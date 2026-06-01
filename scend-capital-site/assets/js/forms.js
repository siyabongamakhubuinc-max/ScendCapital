/**
 * ============================================================
 * SCEND CAPITAL — Google Sheets Form Integration
 * File: assets/js/forms.js
 *
 * HOW IT WORKS:
 * Each form submission is sent via fetch() to a Google Apps
 * Script Web App URL (acting as a proxy). The Apps Script
 * writes the row to the connected Google Sheet.
 *
 * SETUP: Follow the guide in docs/google-sheets-setup.md
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIGURATION — Replace these URLs after deploying each
   Google Apps Script (one per form / sheet tab).
   See docs/google-sheets-setup.md for full instructions.
───────────────────────────────────────────────────────────── */
const SCEND_SHEETS_CONFIG = {

  // Main contact / enquiry form  →  Sheet tab: "Enquiries"
  contact: {
    url: 'https://script.google.com/macros/s/AKfycbxjSTFTnZ6QAGKr_-KvQEOPAKAb-mGnVaHFlGUalm5lLfDtNcr3uCeWojJt55U0n7YA/exec',
    sheetName: 'Enquiries',
  },

  // Investor-specific fields     →  Sheet tab: "Investors"
  investor: {
    url: 'https://script.google.com/macros/s/AKfycbxjSTFTnZ6QAGKr_-KvQEOPAKAb-mGnVaHFlGUalm5lLfDtNcr3uCeWojJt55U0n7YA/exec',
    sheetName: 'Investors',
  },

  // Entrepreneur-specific fields →  Sheet tab: "Entrepreneurs"
  entrepreneur: {
    url: 'https://script.google.com/macros/s/AKfycbxjSTFTnZ6QAGKr_-KvQEOPAKAb-mGnVaHFlGUalm5lLfDtNcr3uCeWojJt55U0n7YA/exec',
    sheetName: 'Entrepreneurs',
  },

  // Deal scout fields            →  Sheet tab: "Scouts"
  scout: {
    url: 'https://script.google.com/macros/s/AKfycbxjSTFTnZ6QAGKr_-KvQEOPAKAb-mGnVaHFlGUalm5lLfDtNcr3uCeWojJt55U0n7YA/exec',
    sheetName: 'Scouts',
  },

  // General enquiry              →  Sheet tab: "General"
  general: {
    url: 'https://script.google.com/macros/s/AKfycbxjSTFTnZ6QAGKr_-KvQEOPAKAb-mGnVaHFlGUalm5lLfDtNcr3uCeWojJt55U0n7YA/exec',
    sheetName: 'General',
  },
};

/* ─────────────────────────────────────────────────────────────
   UTILITY: Read the currently active form tab type
   (investor | entrepreneur | scout | general)
───────────────────────────────────────────────────────────── */
function _getFormType() {
  const activeTab = document.querySelector('.ftab.active');
  return activeTab ? (activeTab.dataset.type || 'general') : 'general';
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Collect all visible, filled form fields into
   a plain object { fieldName: value, ... }
───────────────────────────────────────────────────────────── */
function _collectFormData(form) {
  const data = {};

  // Timestamp + metadata
  data.timestamp       = new Date().toISOString();
  data.formType        = _getFormType();
  data.pageUrl         = window.location.href;
  data.referrer        = document.referrer || 'direct';

  // All visible inputs, selects, textareas
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach(field => {
    if (!field.name && !field.placeholder) return;
    if (field.type === 'checkbox') {
      data[field.name || 'consent'] = field.checked ? 'Yes' : 'No';
      return;
    }
    // Only include visible fields (hidden conditional fields excluded)
    const wrapper = field.closest('.fg');
    if (wrapper && wrapper.style.display === 'none') return;

    const key = field.name || field.placeholder || field.id || 'field';
    if (field.value && field.value.trim()) {
      data[key] = field.value.trim();
    }
  });

  return data;
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Show success state (replaces form with thank-you)
───────────────────────────────────────────────────────────── */
function _showSuccess(form) {
  form.style.cssText = 'opacity:0;transform:translateY(-8px);transition:all .3s ease';
  setTimeout(() => {
    form.style.display = 'none';
    const succ = document.getElementById('fsucc');
    if (succ) succ.classList.add('on');
  }, 320);
}

/* ─────────────────────────────────────────────────────────────
   UTILITY: Show error state (inline message, form stays open)
───────────────────────────────────────────────────────────── */
function _showError(btn, message) {
  btn.classList.remove('busy');
  btn.textContent = 'Submit Enquiry →';

  let errEl = document.getElementById('form-error-msg');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'form-error-msg';
    errEl.style.cssText = [
      'font-size:.78rem',
      'color:#c0392b',
      'margin-top:.6rem',
      'text-align:center',
      'line-height:1.5',
    ].join(';');
    btn.insertAdjacentElement('afterend', errEl);
  }
  errEl.textContent = message;
  setTimeout(() => { if (errEl) errEl.textContent = ''; }, 8000);
}

/* ─────────────────────────────────────────────────────────────
   CORE: Submit form data to Google Sheets via Apps Script
───────────────────────────────────────────────────────────── */
async function _submitToSheets(formData, scriptUrl) {

  // Build URLSearchParams (Apps Script reads doPost(e).parameter)
  const params = new URLSearchParams();
  Object.entries(formData).forEach(([k, v]) => params.append(k, v));

  const response = await fetch(scriptUrl, {
    method:  'POST',
    mode:    'no-cors', // Apps Script requires no-cors
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  // no-cors returns opaque response — we can't read status.
  // We treat reaching this point as success.
  return true;
}

/* ─────────────────────────────────────────────────────────────
   MAIN: Called by index.html's doSubmit() via
         window.scendSubmitForm()
───────────────────────────────────────────────────────────── */
window.scendSubmitForm = async function(event, form, btn) {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }

  btn.classList.add('busy');
  btn.textContent = 'Submitting…';

  const formType = _getFormType();
  const formData = _collectFormData(form);

  // Determine which Apps Script URL to use.
  // Strategy: always write to the type-specific sheet AND the
  // master Enquiries sheet so nothing is missed.
  const typeConfig    = SCEND_SHEETS_CONFIG[formType]    || SCEND_SHEETS_CONFIG.general;
  const contactConfig = SCEND_SHEETS_CONFIG.contact;

  const scriptUrl = typeConfig.url;

  // Validate that the URL has been configured
  if (scriptUrl.includes('YOUR_') || !scriptUrl.startsWith('https://script.google.com')) {
    console.warn('[ScendForms] Apps Script URL not configured for type:', formType);
    console.table(formData);
    // Still show success in demo / unconfigured mode
    _showSuccess(form);
    return;
  }

  try {
    await _submitToSheets(formData, scriptUrl);

    // If type-specific sheet differs from master Enquiries, also
    // write to Enquiries for the unified pipeline view
    if (formType !== 'contact' && contactConfig.url && !contactConfig.url.includes('YOUR_')) {
      await _submitToSheets({ ...formData, sourceSheet: typeConfig.sheetName }, contactConfig.url);
    }

    _showSuccess(form);

  } catch (err) {
    console.error('[ScendForms] Submission error:', err);
    _showError(
      btn,
      'There was a problem submitting your enquiry. Please try again or email us directly at info@scendcapital.co.za'
    );
  }
};

/* ─────────────────────────────────────────────────────────────
   INIT: Attach submit listener once DOM is ready
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cf');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    if (typeof window.scendSubmitForm === 'function') {
      window.scendSubmitForm(e, form, document.getElementById('fsub'));
    }
  });
});
