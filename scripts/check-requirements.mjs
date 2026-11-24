// Sends a clearly labelled test enquiry to verify the Apps Script write path.
// It may create one test row, marked as not requiring a quotation or follow-up.
const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/a/macros/timeequipment.co.in/s/AKfycbxcRKzTGFfqqBHwGOxMGe9k5qdlZSCZ93iukkrqdbQnuJmuZqtmlqcDfSoL_qcfQ67e/exec';
const requestId = crypto.randomUUID();
const payload = {
  screwType: 'Translating Type', orientation: 'Upward', headType: 'Head 1',
  capacity: '1', customCapacity: '', quantity: '1', stroke: '', accessories: [],
  specialOptions: [], name: 'WEBSITE CONNECTION TEST - DELETE',
  company: 'Automated integration verification', phone: '9999999999', email: '',
  notes: 'Labelled connection test only. Not a customer enquiry. No quotation or contact required.',
  website: '', requestId, secret: process.env.GOOGLE_APPS_SCRIPT_SECRET || '',
};
try {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(25000),
  });
  const text = await response.text();
  let result;
  try { result = JSON.parse(text); } catch { result = { success: false, error: 'Expected JSON, received an HTML or login page.' }; }
  console.log(JSON.stringify({ status: response.status, success: result.success === true, enquiryId: result.enquiryId, error: result.error }, null, 2));
  if (result.success !== true) process.exitCode = 1;
} catch (error) {
  console.error('Connection check failed:', error.message, error.cause?.code || '');
  process.exitCode = 1;
}
