// Replace Code.gs in the EXISTING, Sheet-bound Apps Script project.
// Keep its existing Index.html file so the original sample continues to work.
const ENQUIRIES_SHEET = 'Enquiries';
const ALLOWED_TYPES = ['Translating Type', 'Rotating Type'];
const ALLOWED_ORIENTATIONS = ['Upward', 'Downward'];
const ALLOWED_HEADS = ['Head 1', 'Head 2', 'Head 3', 'Head 4', 'Head 5', 'Head 6'];
const ALLOWED_CAPACITIES = ['0.5', '1', '2', '2.5', '3', '5', '10', '20', 'Other'];
const ALLOWED_ACCESSORIES = ['Handwheel', 'Motor', 'Gearbox & Motor', 'Coupling', 'Bellows Boot', 'Bevel Gear Box'];
const ALLOWED_SPECIAL = ['Anti-rotation', 'Anti-backlash'];
const HEADERS = ['Submitted At', 'Enquiry ID', 'Screw Jack Type', 'Screw Orientation', 'Head Type', 'Load Capacity (Ton)', 'Quantity', 'Customer Name', 'Company Name', 'Mobile / WhatsApp', 'Email', 'Special Requirements', 'Status'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Screw Jack Requirement Form')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open Apps Script from your target Google Sheet.');
  PropertiesService.getScriptProperties().setProperty('ENQUIRIES_SPREADSHEET_ID', ss.getId());
  getEnquiriesSheet_();
  return 'Setup complete. Enquiries sheet is ready.';
}

// Website submissions enter here. google.script.run is kept for the old sample.
function doPost(event) {
  try {
    if (!event || !event.postData || event.postData.contents.length > 16000) throw new Error('Invalid enquiry.');
    const data = JSON.parse(event.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('WEBSITE_SECRET');
    if (secret && data.secret !== secret) throw new Error('Invalid website credentials.');
    return jsonResponse_(submitEnquiry(data));
  } catch (error) {
    return jsonResponse_({ success: false, error: error.message || 'Unable to save enquiry.' });
  }
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function getEnquiriesSheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('ENQUIRIES_SPREADSHEET_ID');
  const ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Run setup from the target Google Sheet first.');
  let sheet = ss.getSheetByName(ENQUIRIES_SHEET);
  if (!sheet) sheet = ss.insertSheet(ENQUIRIES_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setBackground('#10213c').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setColumnWidths(1, HEADERS.length, 175);
    sheet.setColumnWidth(12, 300);
  } else {
    const existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (HEADERS.some(function (header, index) { return existing[index] !== header; })) throw new Error('Enquiries sheet headers do not match. Existing data was left unchanged.');
  }
  return sheet;
}

function submitEnquiry(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.website) throw new Error('Invalid enquiry.');
  const screwType = clean_(data.screwType, 40);
  const orientation = clean_(data.orientation, 30);
  const headType = clean_(data.headType, 20);
  const capacityChoice = clean_(data.capacity, 20);
  const quantity = Number(data.quantity);
  const name = clean_(data.name, 100);
  const company = clean_(data.company, 120);
  const phone = clean_(data.phone, 30);
  const email = clean_(data.email, 120);
  const notes = clean_(data.notes, 1500);
  const accessories = validateOptions_(data.accessories, ALLOWED_ACCESSORIES);
  const special = validateOptions_(data.specialOptions, ALLOWED_SPECIAL);
  const stroke = clean_(data.stroke, 30);
  const requestId = clean_(data.requestId, 36);
  if (requestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new Error('Invalid request reference.');
  if (!ALLOWED_TYPES.includes(screwType)) throw new Error('Select a valid Screw Jack type.');
  if (!ALLOWED_ORIENTATIONS.includes(orientation)) throw new Error('Select a valid screw orientation.');
  if (!ALLOWED_HEADS.includes(headType)) throw new Error('Select a valid head type.');
  if (!ALLOWED_CAPACITIES.includes(capacityChoice)) throw new Error('Select a valid load capacity.');
  let capacity = capacityChoice;
  if (capacityChoice === 'Other') {
    const custom = Number(data.customCapacity);
    if (!Number.isFinite(custom) || custom <= 0 || custom > 100000) throw new Error('Enter a valid custom capacity in tons.');
    capacity = String(custom);
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error('Enter a valid quantity.');
  if (stroke && (!Number.isFinite(Number(stroke)) || Number(stroke) <= 0 || Number(stroke) > 1000000)) throw new Error('Enter a valid stroke length.');
  if (!name) throw new Error('Enter your name.');
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) throw new Error('Enter a valid mobile / WhatsApp number.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const requirements = [
    'Drive & accessories: ' + (accessories.join(', ') || 'None selected'),
    'Special options: ' + (special.join(', ') || 'Standard configuration'),
    'Stroke length: ' + (stroke ? stroke + ' mm' : 'To be discussed'),
    notes ? 'Application notes: ' + notes : ''
  ].filter(Boolean).join('\n');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getEnquiriesSheet_();
    const id = requestId ? 'SJ-' + requestId.toUpperCase() : 'SJ-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    // A retry after a slow response must not append the same enquiry twice.
    if (requestId && sheet.getLastRow() > 1) {
      const existing = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (existing) return { success: true, enquiryId: id };
    }
    sheet.appendRow([new Date(), id, screwType, orientation, headType, capacity, quantity, safeCell_(name), safeCell_(company), safeCell_(phone), safeCell_(email), safeCell_(requirements), 'New']);
    SpreadsheetApp.flush();
    return { success: true, enquiryId: id };
  } finally { lock.releaseLock(); }
}

function validateOptions_(value, allowed) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > allowed.length || value.some(function (item) { return !allowed.includes(item); })) throw new Error('Invalid accessory or special option.');
  return Array.from(new Set(value));
}
function clean_(value, maxLength) { return String(value == null ? '' : value).trim().slice(0, maxLength); }
function safeCell_(value) { return /^[=+\-@\t\r]/.test(value) ? "'" + value : value; }
