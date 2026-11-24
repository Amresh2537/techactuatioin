import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { initialConfiguration, normalizeConfiguration, validateStep, summaryRows, STEPS } from '../app/requirement/configuration.ts';

const valid = () => ({ ...initialConfiguration, accessories: ['Motor', 'Bellows Boot'], specialOptions: ['Anti-rotation'], screwType: 'Rotating Type', orientation: 'Downward', headType: 'Head 6', capacity: '20', quantity: '2', name: 'Test Customer', phone: '+91 9311742040', notes: 'LABELLED TEST ONLY' });
const requestId = '2732f00d-395b-4c98-94ca-98e59336ccee';

test('all sketch selections, optional fields, and numeric bounds validate correctly', () => {
  const data = valid();
  STEPS.forEach((_, index) => assert.equal(validateStep(index, data), null));
  assert.match(validateStep(0, { ...data, screwType: '' }), /select/i);
  assert.match(validateStep(3, { ...data, quantity: '1.5' }), /whole-number/);
  assert.match(validateStep(3, { ...data, capacity: 'Other', customCapacity: '-5' }), /custom capacity/);
  assert.equal(validateStep(3, { ...data, capacity: 'Other', customCapacity: '17.5', stroke: '300' }), null);
  assert.match(validateStep(6, { ...data, phone: '123' }), /mobile/);
  assert.match(validateStep(6, { ...data, email: 'not-an-email' }), /email/);
  assert.match(validateStep(4, { ...data, accessories: ['unknown component'] }), /accessories/);
  assert.equal(summaryRows({ ...data, capacity: 'Other', customCapacity: '17.5' })[3][1], '17.5 ton');
});

test('server normalization rejects malformed input and deduplicates selections', () => {
  assert.equal(normalizeConfiguration(null), null);
  assert.equal(normalizeConfiguration({ ...valid(), specialOptions: 'Anti-rotation' }), null);
  assert.equal(normalizeConfiguration({ ...valid(), accessories: [42] }), null);
  const result = normalizeConfiguration({ ...valid(), name: ' Test ', accessories: ['Motor', 'Motor'] });
  assert.equal(result.name, 'Test'); assert.deepEqual(result.accessories, ['Motor']);
});

const routeFile = new URL('../app/api/requirements/route.ts', import.meta.url);
const configFile = new URL('../app/requirement/configuration.ts', import.meta.url).href;
const routeCode = ts.transpileModule(fs.readFileSync(routeFile, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"../../requirement/configuration"', JSON.stringify(configFile));
const { POST } = await import('data:text/javascript;base64,' + Buffer.from(routeCode).toString('base64'));
const request = (data) => new Request('https://example.test/api/requirements', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });

test('API rejects invalid submissions before calling Google', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Must not contact Google'); };
  try {
    assert.equal((await POST(request({ ...valid(), requestId, website: 'spam' }))).status, 400);
    assert.equal((await POST(request({ ...valid(), requestId, headType: 'Head 99' }))).status, 400);
    assert.equal((await POST(request({ ...valid(), requestId: 'invalid' }))).status, 400);
    assert.equal((await POST(request(null))).status, 400);
  } finally { globalThis.fetch = original; }
});

test('API only reports success for a confirmed saved ID and preserves the retry key', async () => {
  const original = globalThis.fetch;
  const originalSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
  process.env.GOOGLE_APPS_SCRIPT_SECRET = 'test-secret';
  try {
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.equal(payload.requestId, requestId);
      assert.equal(payload.secret, 'test-secret');
      assert.deepEqual(payload.accessories, ['Motor', 'Bellows Boot']);
      return Response.json({ success: true, enquiryId: `SJ-${requestId.toUpperCase()}` });
    };
    const response = await POST(request({ ...valid(), requestId }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, true); assert.equal('secret' in result, false);
    globalThis.fetch = async () => new Response('<html>Sign in to Google</html>', { headers: { 'content-type': 'text/html' } });
    assert.equal((await POST(request({ ...valid(), requestId }))).status, 502);
    globalThis.fetch = async () => Response.json({ success: false, error: 'Private backend error' });
    const failed = await POST(request({ ...valid(), requestId }));
    assert.equal(failed.status, 502); assert.doesNotMatch(await failed.text(), /Private backend/);
  } finally {
    globalThis.fetch = original;
    if (originalSecret === undefined) delete process.env.GOOGLE_APPS_SCRIPT_SECRET; else process.env.GOOGLE_APPS_SCRIPT_SECRET = originalSecret;
  }
});

test('Apps Script writes the existing 13-column schema, escapes cells, and deduplicates retries', () => {
  const headers = ['Submitted At', 'Enquiry ID', 'Screw Jack Type', 'Screw Orientation', 'Head Type', 'Load Capacity (Ton)', 'Quantity', 'Customer Name', 'Company Name', 'Mobile / WhatsApp', 'Email', 'Special Requirements', 'Status'];
  const rows = [headers]; let released = 0;
  const sheet = {
    getLastRow: () => rows.length,
    getRange: (row, column) => ({ getValues: () => [rows[row - 1]], createTextFinder: id => ({ matchEntireCell: () => ({ findNext: () => rows.slice(1).find(item => item[column - 1] === id) || null }) }) }),
    appendRow: row => rows.push(row),
  };
  const sandbox = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => key === 'ENQUIRIES_SPREADSHEET_ID' ? 'test-sheet' : null }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush() {} },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() { released++; } }) },
  };
  vm.createContext(sandbox); vm.runInContext(fs.readFileSync(new URL('../integrations/google-apps-script/Code.gs', import.meta.url), 'utf8'), sandbox);
  const data = { ...valid(), requestId, name: '=formula', company: '@company' };
  const first = sandbox.submitEnquiry(data);
  assert.equal(first.success, true); assert.equal(rows.length, 2); assert.equal(rows[1].length, 13);
  assert.equal(rows[1][7], "'=formula"); assert.equal(rows[1][8], "'@company");
  assert.match(rows[1][11], /Motor, Bellows Boot/); assert.match(rows[1][11], /Anti-rotation/);
  assert.equal(sandbox.submitEnquiry(data).enquiryId, first.enquiryId);
  assert.equal(rows.length, 2); assert.equal(released, 2);
  assert.throws(() => sandbox.submitEnquiry({ ...data, capacity: 'Other', customCapacity: '0' }), /custom capacity/);
});
