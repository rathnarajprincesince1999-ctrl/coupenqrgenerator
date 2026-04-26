// ═══════════════════════════════════════════════════════════════
//  RATHNA Generator — Premium Google Apps Script
//  Paste this entire file into script.google.com
//  Sheet name: "Premium Orders"
// ═══════════════════════════════════════════════════════════════

const SHEET_NAME   = 'Premium Orders';
const NOTIFY_EMAIL = 'rathnarajsince1999@gmail.com';

// ── Column positions (1-based) ────────────────────────────────────
const COL = {
  ORDER_ID : 1,
  DATE     : 2,
  NAME     : 3,
  PHONE    : 4,
  TXN_ID   : 5,
  AMOUNT   : 6,
  STATUS   : 7,  // pending | verified | rejected
  CODE     : 8,  // auto-generated on verification
  EXPIRY   : 9,  // date string dd/mm/yyyy
  NOTES    : 10,
};

// ── Auto-generate Premium Code ────────────────────────────────────
function generatePremCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function seg(n) {
    let s = '';
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  return `PREM-${seg(4)}-${seg(4)}-${seg(4)}`;
}

// ── Get or create sheet ───────────────────────────────────────────
function getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Header row
    sheet.getRange(1, 1, 1, 10).setValues([[
      'Order ID', 'Date', 'Name', 'Phone', 'TXN ID',
      'Amount', 'Status', 'Code', 'Expiry', 'Notes'
    ]]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── CORS headers ──────────────────────────────────────────────────
function corsHeaders() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Handle GET requests ───────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || '';
  const code   = (e.parameter.code || '').toUpperCase().trim();

  if (action === 'verify' && code) {
    return verifyCode(code);
  }

  if (action === 'orders') {
    return getAllOrders();
  }

  return respond({ error: 'Invalid action' });
}

// ── Handle POST requests ──────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || '';

    if (action === 'order')  return saveOrder(data);
    if (action === 'approve') return approveOrder(data);

    return respond({ error: 'Invalid action' });
  } catch(err) {
    return respond({ error: err.message });
  }
}

// ── Save new order ────────────────────────────────────────────────
function saveOrder(data) {
  const sheet   = getSheet();
  const orderId = data.orderId || ('PREM' + Date.now());
  const date    = new Date().toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

  // Check duplicate TXN ID
  const existing = findByTxn(data.txnId);
  if (existing) {
    return respond({ success: false, error: 'Duplicate Transaction ID.' });
  }

  sheet.appendRow([
    orderId,
    date,
    data.name   || '',
    data.phone  || '',
    data.txnId  || '',
    data.amount || 199,
    'pending',
    '',   // code — empty until verified
    '',   // expiry — empty until verified
    '',   // notes
  ]);

  // Email notification to owner
  try {
    MailApp.sendEmail({
      to      : NOTIFY_EMAIL,
      subject : `🆕 New Premium Order — ${orderId}`,
      body    :
        `New Premium Order Received!\n\n` +
        `Order ID : ${orderId}\n` +
        `Date     : ${date}\n` +
        `Name     : ${data.name}\n` +
        `Phone    : ${data.phone}\n` +
        `TXN ID   : ${data.txnId}\n` +
        `Amount   : ₹${data.amount || 199}\n\n` +
        `Open Google Sheet to verify and approve:\n` +
        `https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}`
    });
  } catch(mailErr) {
    // Email failed — continue anyway
  }

  return respond({ success: true, orderId });
}

// ── Verify code ───────────────────────────────────────────────────
function verifyCode(code) {
  const sheet  = getSheet();
  const data   = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowCode   = String(data[i][COL.CODE - 1]).toUpperCase().trim();
    const rowStatus = String(data[i][COL.STATUS - 1]).toLowerCase().trim();
    const rowExpiry = String(data[i][COL.EXPIRY - 1]).trim();

    if (rowCode === code && rowStatus === 'verified') {
      // Check expiry
      if (rowExpiry) {
        const parts  = rowExpiry.split('/'); // dd/mm/yyyy
        const expiry = new Date(parts[2], parts[1] - 1, parts[0]);
        if (new Date() > expiry) {
          return respond({ valid: false, reason: 'expired' });
        }
      }
      return respond({
        valid  : true,
        name   : data[i][COL.NAME - 1],
        expiry : rowExpiry,
        orderId: data[i][COL.ORDER_ID - 1],
      });
    }
  }

  return respond({ valid: false, reason: 'not_found' });
}

// ── Approve order (called from sheet button or manually) ──────────
function approveOrder(data) {
  const sheet  = getSheet();
  const rows   = sheet.getDataRange().getValues();
  const target = (data.orderId || '').trim();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.ORDER_ID - 1]).trim() === target) {
      const code   = generatePremCode();
      const expiry = getExpiryDate(30); // 30 days from now

      sheet.getRange(i + 1, COL.STATUS).setValue('verified');
      sheet.getRange(i + 1, COL.CODE).setValue(code);
      sheet.getRange(i + 1, COL.EXPIRY).setValue(expiry);

      // Email code to customer
      const phone = rows[i][COL.PHONE - 1];
      const name  = rows[i][COL.NAME - 1];
      try {
        MailApp.sendEmail({
          to      : NOTIFY_EMAIL,
          subject : `✅ Premium Approved — Send Code to ${name} (${phone})`,
          body    :
            `Premium order approved!\n\n` +
            `Customer : ${name}\n` +
            `Phone    : ${phone}\n` +
            `Code     : ${code}\n` +
            `Expiry   : ${expiry}\n\n` +
            `Send this code to the customer on WhatsApp: ${phone}`
        });
      } catch(mailErr) {}

      return respond({ success: true, code, expiry });
    }
  }

  return respond({ success: false, error: 'Order not found' });
}

// ── Get all orders (for admin view) ──────────────────────────────
function getAllOrders() {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const orders  = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return respond({ orders });
}

// ── Helper: find row by TXN ID ────────────────────────────────────
function findByTxn(txnId) {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.TXN_ID - 1]).trim() === String(txnId).trim()) return i + 1;
  }
  return null;
}

// ── Helper: expiry date string dd/mm/yyyy ─────────────────────────
function getExpiryDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

// ── Helper: JSON response ─────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Sheet button: Approve selected row ───────────────────────────
// Add a button in the sheet and assign this function
function approveSelectedRow() {
  const sheet = getSheet();
  const row   = sheet.getActiveRange().getRow();
  if (row <= 1) { SpreadsheetApp.getUi().alert('Select an order row first.'); return; }

  const data    = sheet.getRange(row, 1, 1, 10).getValues()[0];
  const orderId = data[COL.ORDER_ID - 1];
  const status  = data[COL.STATUS - 1];

  if (status === 'verified') {
    SpreadsheetApp.getUi().alert('Already approved. Code: ' + data[COL.CODE - 1]);
    return;
  }

  const result = approveOrder({ orderId });
  const parsed = JSON.parse(result.getContent());

  if (parsed.success) {
    SpreadsheetApp.getUi().alert(
      `✅ Approved!\n\nCode: ${parsed.code}\nExpiry: ${parsed.expiry}\n\nSend this code to the customer on WhatsApp.`
    );
  } else {
    SpreadsheetApp.getUi().alert('Error: ' + parsed.error);
  }
}
