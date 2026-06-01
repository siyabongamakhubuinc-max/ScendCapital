/**
 * ============================================================
 * SCEND CAPITAL — Google Apps Script
 * File: scripts/google-apps-script.js
 *
 * DEPLOYMENT: Paste this entire file into the Google Apps Script
 * editor (script.google.com) connected to your Google Sheet.
 * Deploy as a Web App (see docs/google-sheets-setup.md).
 *
 * ONE SCRIPT PER SHEET is recommended, OR use this single
 * multi-tab script and route by the "formType" parameter.
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   SHEET CONFIGURATION
   Map each formType value to a sheet tab name.
   Create these tabs in your Google Sheet before deploying.
───────────────────────────────────────────────────────────── */
var SHEET_MAP = {
  investor:     'Investors',
  entrepreneur: 'Entrepreneurs',
  scout:        'Scouts',
  general:      'General',
  contact:      'Enquiries',   // fallback / master tab
};

/* Column headers for each sheet tab.
   ORDER MATTERS — must match the order data is written below. */
var HEADERS = {
  Enquiries: [
    'Timestamp', 'Form Type', 'First Name', 'Last Name',
    'Email', 'Phone', 'Province', 'Message', 'POPIA Consent',
    'Source URL', 'Referrer', 'Source Sheet'
  ],
  Investors: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Province', 'Investment Amount', 'Message', 'POPIA Consent',
    'Source URL', 'Referrer'
  ],
  Entrepreneurs: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Business Name & Type', 'Business Location', 'Capital Required',
    'Message', 'POPIA Consent', 'Source URL', 'Referrer'
  ],
  Scouts: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Province', 'Business Location', 'Message', 'POPIA Consent',
    'Source URL', 'Referrer'
  ],
  General: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Message', 'POPIA Consent', 'Source URL', 'Referrer'
  ],
};

/* ─────────────────────────────────────────────────────────────
   UTILITY: Get or create a sheet tab by name
───────────────────────────────────────────────────────────── */
function getOrCreateSheet(ss, tabName) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  return sheet;
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Ensure the header row exists on a sheet tab.
   If row 1 is empty, write the headers.
───────────────────────────────────────────────────────────── */
function ensureHeaders(sheet, tabName) {
  if (sheet.getLastRow() === 0) {
    var headers = HEADERS[tabName] || HEADERS['Enquiries'];
    sheet.appendRow(headers);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#9C833A');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Build a row array from POST parameters.
   Uses the tab-specific header list so columns always align.
───────────────────────────────────────────────────────────── */
function buildRow(params, tabName) {
  var headers = HEADERS[tabName] || HEADERS['Enquiries'];
  var row = [];

  headers.forEach(function(header) {
    switch (header) {
      case 'Timestamp':
        row.push(params.timestamp || new Date().toISOString());
        break;
      case 'Form Type':
        row.push(params.formType || '');
        break;
      case 'First Name':
        row.push(params['First Name'] || params.firstName || params['given-name'] || '');
        break;
      case 'Last Name':
        row.push(params['Last Name'] || params.lastName || params['family-name'] || '');
        break;
      case 'Email':
        row.push(params.email || params.Email || params['email address *'] || params['email address'] || '');
        break;
      case 'Phone':
        row.push(params.phone || params.Phone || params.mobile || params['mobile / whatsapp'] || '');
        break;
      case 'Province':
        row.push(params.province || params.Province || '');
        break;
      case 'Investment Amount':
        row.push(params['Investment amount'] || params.investmentAmount || params['capital required (r)'] || '');
        break;
      case 'Capital Required':
        row.push(params['Capital required (R)'] || params.capitalRequired || params['Investment amount'] || '');
        break;
      case 'Business Name & Type':
        row.push(params['Business Name & Type'] || params.businessName || params['business name & type'] || '');
        break;
      case 'Business Location':
        row.push(params['Business Location'] || params.businessLocation || params['business location'] || '');
        break;
      case 'Message':
        row.push(params.message || params.Message || '');
        break;
      case 'POPIA Consent':
        row.push(params.consent || params.popiConsent || 'Yes');
        break;
      case 'Source URL':
        row.push(params.pageUrl || '');
        break;
      case 'Referrer':
        row.push(params.referrer || '');
        break;
      case 'Source Sheet':
        row.push(params.sourceSheet || '');
        break;
      default:
        // Try a direct match by header name (case-insensitive)
        var val = '';
        Object.keys(params).forEach(function(k) {
          if (k.toLowerCase() === header.toLowerCase()) val = params[k];
        });
        row.push(val);
    }
  });

  return row;
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Send a JSON response back to the caller.
   NOTE: With mode:'no-cors' in fetch(), this response is
   opaque and not readable by the browser — but it allows
   Apps Script to complete cleanly.
───────────────────────────────────────────────────────────── */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Send an email notification to the Scend Capital
   inbox when a new enquiry arrives. Set NOTIFY_EMAIL below.
───────────────────────────────────────────────────────────── */
var NOTIFY_EMAIL = 'info@scendcapital.co.za'; // ← change if needed
var SEND_NOTIFICATIONS = true; // ← set false to disable emails

function sendNotification(params, tabName) {
  if (!SEND_NOTIFICATIONS) return;
  try {
    var firstName = params['First Name'] || params.firstName || '';
    var lastName  = params['Last Name']  || params.lastName  || '';
    var email     = params.email || params.Email || '';
    var formType  = params.formType || 'general';
    var subject   = '[Scend Capital] New ' + formType + ' enquiry — ' + firstName + ' ' + lastName;
    var body = [
      'A new enquiry has been submitted via the Scend Capital website.',
      '',
      'Form type:  ' + formType.toUpperCase(),
      'Sheet tab:  ' + tabName,
      'Name:       ' + firstName + ' ' + lastName,
      'Email:      ' + email,
      'Phone:      ' + (params.phone || params['mobile / whatsapp'] || '—'),
      'Province:   ' + (params.province || '—'),
      'Message:    ' + (params.message || '—').substring(0, 300),
      '',
      'Submitted:  ' + (params.timestamp || new Date().toISOString()),
      'Source URL: ' + (params.pageUrl || '—'),
      '',
      '─────────────────────────────',
      'View all submissions:',
      SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join('\n');

    MailApp.sendEmail({
      to:      NOTIFY_EMAIL,
      subject: subject,
      body:    body,
    });
  } catch (e) {
    Logger.log('Email notification failed: ' + e.message);
  }
}

/* ─────────────────────────────────────────────────────────────
   CORS: Add headers to allow cross-origin POST from the site
───────────────────────────────────────────────────────────── */
function addCorsHeaders(output) {
  return output; // no-cors mode doesn't require explicit CORS headers
}

/* ─────────────────────────────────────────────────────────────
   MAIN: doPost — entry point for all form submissions
   Apps Script calls this when a POST request is received.
───────────────────────────────────────────────────────────── */
function doPost(e) {
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var params = e.parameter || {};

    // Determine which sheet tab to write to
    var formType = params.formType || 'general';
    var tabName  = SHEET_MAP[formType] || SHEET_MAP['general'];

    // Get or create the target sheet tab
    var sheet = getOrCreateSheet(ss, tabName);
    ensureHeaders(sheet, tabName);

    // Build and append the data row
    var row = buildRow(params, tabName);
    sheet.appendRow(row);

    // Also mirror every submission to the master Enquiries tab
    if (tabName !== 'Enquiries') {
      var masterSheet = getOrCreateSheet(ss, 'Enquiries');
      ensureHeaders(masterSheet, 'Enquiries');
      var masterRow = buildRow(params, 'Enquiries');
      masterSheet.appendRow(masterRow);
    }

    // Send email notification
    sendNotification(params, tabName);

    // Log success
    Logger.log('Success: ' + formType + ' → ' + tabName + ' | ' + (params.email || 'no email'));

    return jsonResponse({ status: 'success', sheet: tabName });

  } catch (err) {
    Logger.log('Error in doPost: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN: doGet — health check endpoint
   Visit the deployment URL in a browser to confirm it works.
───────────────────────────────────────────────────────────── */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return jsonResponse({
    status:  'ok',
    service: 'Scend Capital Form Handler',
    sheet:   ss.getName(),
    tabs:    ss.getSheets().map(function(s){ return s.getName(); }),
    time:    new Date().toISOString(),
  });
}

/* ─────────────────────────────────────────────────────────────
   OPTIONAL: Run this function once manually from the Apps
   Script editor to create all sheet tabs and headers upfront.
   Trigger: Run → setupSheets
───────────────────────────────────────────────────────────── */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function(tabName) {
    var sheet = getOrCreateSheet(ss, tabName);
    // Force re-create headers
    if (sheet.getLastRow() === 0) {
      ensureHeaders(sheet, tabName);
    }
    Logger.log('Set up tab: ' + tabName);
  });
  Logger.log('All tabs ready.');
}
