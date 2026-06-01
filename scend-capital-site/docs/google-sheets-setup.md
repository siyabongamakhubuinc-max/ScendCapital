# Google Sheets Integration — Setup Guide
**Scend Capital Website · docs/google-sheets-setup.md**

---

## Overview

Every form submission on the Scend Capital website is captured in a Google Sheet via a Google Apps Script Web App. The flow is:

```
Browser form  →  fetch() POST  →  Apps Script Web App  →  Google Sheet row
                                         ↓
                                  Email notification
                                  → info@scendcapital.co.za
```

One Google Sheet holds **five tabs** (Enquiries, Investors, Entrepreneurs, Scouts, General). A single Apps Script handles all four form types and routes each submission to the correct tab, plus mirrors every row to the master **Enquiries** tab.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it: `Scend Capital — Website Enquiries`
3. Leave the default tab as-is — the Apps Script will create and format all tabs automatically when you run `setupSheets()` in Step 3.

> **Tip:** Share the sheet with anyone at Scend Capital who needs to see enquiries (Viewer or Editor access as appropriate).

---

## Step 2 — Create the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete all the default code in the editor (the `function myFunction()` placeholder).
3. Open the file `scripts/google-apps-script.js` from this repository.
4. Paste the **entire contents** into the Apps Script editor.
5. Click **Save** (the floppy disk icon or `Ctrl+S`).
6. Name the project: `Scend Capital Form Handler`

### Configure the notification email

In the script, find this line near the top:

```javascript
var NOTIFY_EMAIL = 'info@scendcapital.co.za';
```

Change it to the email address that should receive new enquiry alerts. You can add multiple recipients using a comma-separated string:

```javascript
var NOTIFY_EMAIL = 'info@scendcapital.co.za, deals@scendcapital.co.za';
```

To **disable** email notifications entirely:

```javascript
var SEND_NOTIFICATIONS = false;
```

---

## Step 3 — Initialise the Sheet Tabs

Before deploying, run the setup function once to create all tabs and header rows:

1. In the Apps Script editor, click the **function selector dropdown** (next to the Run button) and choose `setupSheets`.
2. Click **Run** (the ▶ play button).
3. When prompted, click **Review permissions** → choose your Google account → **Allow**.
4. Check your Google Sheet — you should now see five tabs:
   - `Enquiries` (master)
   - `Investors`
   - `Entrepreneurs`
   - `Scouts`
   - `General`

Each tab will have a gold-styled header row with the correct column names already set.

---

## Step 4 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the **gear icon** next to "Type" and select **Web app**.
3. Fill in the deployment settings:

   | Setting | Value |
   |---|---|
   | Description | `Scend Capital Form Handler v1` |
   | Execute as | `Me (your Google account)` |
   | Who has access | `Anyone` |

4. Click **Deploy**.
5. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby...LONGSTRING.../exec
   ```
   > **Keep this URL private** — anyone with it can POST data to your sheet.

---

## Step 5 — Configure the Website

Open `assets/js/forms.js` and replace the placeholder URLs in `SCEND_SHEETS_CONFIG`:

```javascript
const SCEND_SHEETS_CONFIG = {

  contact: {
    url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    //   ↑ Replace with your Web App URL
    sheetName: 'Enquiries',
  },

  investor: {
    url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    sheetName: 'Investors',
  },

  entrepreneur: {
    url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    sheetName: 'Entrepreneurs',
  },

  scout: {
    url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    sheetName: 'Scouts',
  },

  general: {
    url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    sheetName: 'General',
  },
};
```

> **Single script, all types:** Because one Apps Script handles all four form types, you can paste the **same URL** into all five `url` fields above. The script uses the `formType` POST parameter to route to the correct tab automatically.

---

## Step 6 — Test the Integration

### Method A — Browser health check
Paste your Web App URL directly into a browser address bar. You should see:

```json
{
  "status": "ok",
  "service": "Scend Capital Form Handler",
  "sheet": "Scend Capital — Website Enquiries",
  "tabs": ["Enquiries", "Investors", "Entrepreneurs", "Scouts", "General"],
  "time": "2025-05-29T..."
}
```

### Method B — Live form test
1. Open `index.html` in your browser.
2. Select the **Investor** tab on the contact form.
3. Fill in all required fields with test data.
4. Click **Submit Enquiry**.
5. Check your Google Sheet — a new row should appear in both the **Investors** tab and the **Enquiries** tab within a few seconds.
6. Check your notification email for the alert.

### Method C — Browser DevTools
Open DevTools → Network tab. Submit the form and look for a request to `script.google.com`. Because `mode: 'no-cors'` is used, the response will show as `(opaque)` — this is expected and correct.

---

## Step 7 — Re-deploying After Changes

If you modify the Apps Script (e.g., add columns or change routing), you **must** create a new deployment — editing the script alone does not update the live Web App.

1. In Apps Script: **Deploy → Manage deployments**.
2. Click the **pencil (edit) icon** on your active deployment.
3. Change the version to **"New version"**.
4. Click **Deploy**.
5. The URL stays the same — no changes needed in `forms.js`.

---

## Sheet Structure Reference

### Enquiries (master tab)
| Column | Source |
|---|---|
| Timestamp | Auto — ISO 8601 |
| Form Type | investor / entrepreneur / scout / general |
| First Name | Form field |
| Last Name | Form field |
| Email | Form field |
| Phone | Form field |
| Province | Form field (investor / scout) |
| Message | Form field |
| POPIA Consent | Yes / No |
| Source URL | Auto — page URL |
| Referrer | Auto — HTTP referrer |
| Source Sheet | Which tab it came from |

### Investors tab
Adds: **Investment Amount**

### Entrepreneurs tab
Adds: **Business Name & Type**, **Business Location**, **Capital Required**

### Scouts tab
Adds: **Business Location**

---

## Troubleshooting

### Form submits but nothing appears in the sheet
- Check that you replaced `YOUR_SCRIPT_ID` in `forms.js` with the actual deployed URL.
- Confirm the deployment "Who has access" is set to **Anyone** (not "Anyone with a Google account").
- In Apps Script, click **Executions** (left sidebar) to see if `doPost` ran and check for error messages.

### "Authorization required" error in Apps Script
- Click **Review permissions** and grant access when prompted.
- The script needs `SpreadsheetApp` and `MailApp` permissions.

### Emails not arriving
- Check your spam folder.
- Verify `NOTIFY_EMAIL` is set correctly in the script.
- Check Apps Script **Executions** for `MailApp` errors — free Google accounts have a daily email quota (100/day).
- To check quota: in Apps Script editor go to **View → Executions** and look for `sendNotification` errors.

### "Script function not found: setupSheets"
- Make sure you saved the script after pasting it (`Ctrl+S`).
- Try refreshing the Apps Script editor page and reselecting `setupSheets` from the dropdown.

### Columns are misaligned in the sheet
- Delete all rows in the affected tab (including headers) and re-run `setupSheets()`.
- Then re-deploy the Web App as a new version.

---

## Security Notes

- The Web App URL acts as a **secret endpoint** — treat it like a password.
- Do not commit the URL to a public GitHub repository. Use environment variables or a `.env` file (see README for instructions).
- All data is stored in your private Google Drive and is subject to your Google Workspace / personal account privacy settings.
- Submissions include POPIA consent confirmation (`Yes`) automatically.
- Consider enabling **Google Workspace audit logs** if you are subject to formal data governance requirements.

---

*Scend Capital · 15 Chris Kruger Street, Norkem Park, 1618 · info@scendcapital.co.za*
