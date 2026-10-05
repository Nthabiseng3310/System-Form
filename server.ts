import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory / file-based backup database for quiz leads, bookings, funnel & settings
const BACKUP_FILE = path.resolve(__dirname, 'data_quiz_responses.json');
const BOOKINGS_FILE = path.resolve(__dirname, 'data_bookings.json');
const FUNNEL_FILE = path.resolve(__dirname, 'data_funnel_stats.json');
const SETTINGS_FILE = path.resolve(__dirname, 'data_settings.json');

function readBackupResponses(): any[] {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading backup quiz responses', e);
  }
  return [];
}

function saveBackupResponse(item: any) {
  try {
    const list = readBackupResponses();
    list.unshift(item);
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to quiz backup file', e);
  }
}

// Permanent default Google Sheets & Webhook configuration
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxfW_GW_C6YBmepwKhLZi3Jc43afzOZfGy6IFE7HEAptoMfm56BSbF4-8z7doXdlSC2/exec';
const DEFAULT_SPREADSHEET_ID = '1t0hv8HgN9TpgVUt91TG4DaQCzl4PI0tjaJkwqEX6xf8';
const DEFAULT_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1t0hv8HgN9TpgVUt91TG4DaQCzl4PI0tjaJkwqEX6xf8/edit';

function readSettings(): { webhookUrl?: string; secretToken?: string; spreadsheetId?: string; spreadsheetUrl?: string } {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return {
        webhookUrl: data.webhookUrl || DEFAULT_WEBHOOK_URL,
        spreadsheetId: data.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        spreadsheetUrl: data.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
        secretToken: data.secretToken || '',
      };
    }
  } catch (e) {
    console.error('Error reading settings', e);
  }
  return {
    webhookUrl: DEFAULT_WEBHOOK_URL,
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    secretToken: '',
  };
}

function saveSettings(settings: any) {
  try {
    const current = readSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

// Ensure settings file exists with defaults on startup
try {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(
        {
          spreadsheetId: DEFAULT_SPREADSHEET_ID,
          spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
          webhookUrl: DEFAULT_WEBHOOK_URL,
          secretToken: '',
        },
        null,
        2
      ),
      'utf-8'
    );
  }
} catch (e) {
  console.error('Error initializing settings file', e);
}

function getActiveWebhookUrl(): string {
  const settings = readSettings();
  if (settings.webhookUrl && settings.webhookUrl.startsWith('http')) {
    return settings.webhookUrl;
  }
  const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('YOUR_SCRIPT_ID')) {
    return envUrl;
  }
  return DEFAULT_WEBHOOK_URL;
}

function readFunnelStats(): { starts: number; stepDropoff: Record<string, number>; completions: number } {
  try {
    if (fs.existsSync(FUNNEL_FILE)) {
      return JSON.parse(fs.readFileSync(FUNNEL_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading funnel stats', e);
  }
  return { starts: 0, stepDropoff: {}, completions: 0 };
}

function incrementFunnelStep(step: number) {
  try {
    const stats = readFunnelStats();
    if (step === 1) stats.starts = (stats.starts || 0) + 1;
    stats.stepDropoff = stats.stepDropoff || {};
    stats.stepDropoff[String(step)] = (stats.stepDropoff[String(step)] || 0) + 1;
    fs.writeFileSync(FUNNEL_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error updating funnel stats', e);
  }
}

function incrementFunnelCompletion() {
  try {
    const stats = readFunnelStats();
    stats.completions = (stats.completions || 0) + 1;
    fs.writeFileSync(FUNNEL_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error updating funnel completions', e);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Submit Quiz Answers & Forward to Google Apps Script / Supabase
app.post('/api/quiz/submit', async (req, res) => {
  const { payload } = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Missing quiz payload' });
  }

  // Anti-spam honeypot
  if (req.body.honeypot) {
    return res.json({ success: true, forwardedToSheet: false });
  }

  const googleSheetUrl = getActiveWebhookUrl();
  const secretToken = process.env.SHEET_SECRET_TOKEN || readSettings().secretToken || '';

  let forwardedToSheet = false;
  let forwardError: string | null = null;

  // Forward to Google Apps Script Web App (Webhook)
  if (googleSheetUrl) {
    try {
      const response = await fetch(googleSheetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: secretToken,
          formType: 'quiz',
          ...payload,
        }),
        redirect: 'follow',
      });

      const responseText = await response.text().catch(() => '');
      if (responseText.includes('You need access') || responseText.includes('accounts.google.com')) {
        forwardError = 'Permission Denied: Webhook "Who has access" is set to "Only myself" instead of "Anyone"';
      } else if (response.ok || responseText.includes('success')) {
        forwardedToSheet = true;
        console.log('✅ Quiz response forwarded to Google Sheets successfully!');
      } else {
        forwardError = `Google Sheet returned HTTP ${response.status}`;
      }
    } catch (err: any) {
      console.warn('Could not forward to Google Apps Script webhook:', err.message);
      forwardError = err.message || 'Webhook request failed';
    }
  } else {
    forwardError = 'No Google Sheet Webhook URL configured';
  }

  // Save backup response record
  const record = {
    id: `resp-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    payload,
    forwardedToSheet,
    forwardError,
  };
  saveBackupResponse(record);
  incrementFunnelCompletion();

  return res.json({
    success: true,
    forwardedToSheet,
    forwardError,
    rewardCode: payload['Reward Code'],
  });
});

// 2. Submit Booking Appointment and Forward to Google Sheet
app.post('/api/bookings/submit', async (req, res) => {
  const { booking } = req.body;
  if (!booking) {
    return res.status(400).json({ error: 'Missing booking payload' });
  }

  const googleSheetUrl = getActiveWebhookUrl();
  const secretToken = process.env.SHEET_SECRET_TOKEN || readSettings().secretToken || '';

  let forwardedToSheet = false;
  let forwardError: string | null = null;

  if (googleSheetUrl) {
    try {
      const response = await fetch(googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: secretToken,
          formType: 'booking',
          ...booking,
        }),
      });
      if (response.ok) forwardedToSheet = true;
      else forwardError = `Google Sheet returned HTTP ${response.status}`;
    } catch (err: any) {
      forwardError = err.message || 'Webhook request failed';
    }
  }

  return res.json({ success: true, forwardedToSheet, forwardError });
});

// 3. Settings: Get & Set Google Sheet Webhook & Spreadsheet ID
app.get('/api/settings', (_req, res) => {
  const settings = readSettings();
  const activeUrl = getActiveWebhookUrl();
  const leads = readBackupResponses();
  res.json({
    webhookUrl: settings.webhookUrl || '',
    activeUrl: activeUrl || '',
    isConfigured: Boolean(activeUrl),
    secretToken: settings.secretToken || process.env.SHEET_SECRET_TOKEN || '',
    spreadsheetId: settings.spreadsheetId || '',
    spreadsheetUrl: settings.spreadsheetUrl || (settings.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}/edit` : ''),
    totalLeads: leads.length,
    unsyncedLeads: leads.filter((l) => !l.forwardedToSheet).length,
  });
});

app.post('/api/settings/spreadsheet', (req, res) => {
  const { spreadsheetId, spreadsheetUrl } = req.body;
  if (!spreadsheetId) {
    return res.status(400).json({ error: 'Missing spreadsheetId' });
  }
  const cleanId = String(spreadsheetId).trim();
  const cleanUrl = spreadsheetUrl ? String(spreadsheetUrl).trim() : `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
  saveSettings({
    spreadsheetId: cleanId,
    spreadsheetUrl: cleanUrl,
  });
  res.json({
    success: true,
    spreadsheetId: cleanId,
    spreadsheetUrl: cleanUrl,
  });
});

app.post('/api/settings/google-sheet-webhook', (req, res) => {
  const { webhookUrl, secretToken } = req.body;
  saveSettings({
    webhookUrl: (webhookUrl || '').trim(),
    secretToken: (secretToken || '').trim(),
  });
  res.json({
    success: true,
    activeUrl: getActiveWebhookUrl(),
    isConfigured: Boolean(getActiveWebhookUrl()),
  });
});

// 4. Batch sync all leads from backup to Google Sheet via Bearer token
app.post('/api/quiz/sync-to-sheet', async (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body.token || '').trim();
  const settings = readSettings();
  const spreadsheetId = (req.body.spreadsheetId || settings.spreadsheetId || '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing Google OAuth access token' });
  }
  if (!spreadsheetId) {
    return res.status(400).json({ error: 'Missing spreadsheet ID' });
  }

  try {
    const list = readBackupResponses();
    if (list.length === 0) {
      return res.json({ success: true, count: 0, message: 'No leads found to sync' });
    }

    const rows = list.map((item: any) => {
      const p = item.payload || {};
      return [
        p['Timestamp'] || item.submittedAt || '',
        p['First Name'] || '',
        p['Mobile'] || '',
        p['Email'] || '',
        p['Preferred Contact'] || '',
        p['Treatments Interested In'] || '',
        p['Main Need'] || '',
        p['Visit Frequency'] || '',
        p['Occupation Status'] || '',
        p['Job Title / Field of Study'] || '',
        p['Area'] || '',
        p['Suburb/City (Other)'] || '',
        p['Gender'] || '',
        p['Age Range'] || '',
        p['Race'] || '',
        p['Reward Code'] || '',
        p['Spa Personality'] || '',
        p['Consent Given'] || '',
        p['Source Page'] || '/',
      ];
    });

    const googleRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz%20Responses!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rows }),
      }
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      return res.status(googleRes.status).json({
        error: `Google Sheets API error: ${googleRes.status} ${errText}`,
      });
    }

    // Mark all existing responses as forwarded
    list.forEach((item: any) => {
      item.forwardedToSheet = true;
      item.forwardError = null;
    });
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(list, null, 2), 'utf-8');

    return res.json({
      success: true,
      count: rows.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// 4. Test Webhook Connection
app.post('/api/settings/test-webhook', async (req, res) => {
  const targetUrl = req.body.webhookUrl || getActiveWebhookUrl();
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'No valid Webhook URL provided to test' });
  }

  const secretToken = req.body.secretToken || process.env.SHEET_SECRET_TOKEN || '';

  try {
    const testPayload = {
      token: secretToken,
      formType: 'test',
      Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      'First Name': 'Test Connection (Nthabi\'s Touch)',
      Mobile: '076 200 6014',
      Email: 'test@nthabistouch.co.za',
      'Preferred Contact': 'WhatsApp',
      'Treatments Interested In': 'Test Verification Ping',
      'Main Need': 'Connection Check',
      'Visit Frequency': 'Once',
      'Occupation Status': 'Verified',
      'Job Title / Field of Study': 'System Ping',
      Area: 'Sandton / Fourways',
      'Suburb/City (Other)': 'N/A',
      Gender: 'N/A',
      'Age Range': 'N/A',
      Race: 'N/A',
      'Reward Code': 'NT-TEST99',
      'Spa Personality': 'System Test 🌸',
      'Consent Given': 'YES',
      'Source Page': '/admin-test',
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      redirect: 'follow',
    });

    let dataText = '';
    try {
      dataText = await response.text();
    } catch {}

    // Check if Google returned an authentication / access denied HTML page
    if (dataText.includes('You need access') || dataText.includes('accounts.google.com') || dataText.includes('Sign in - Google Accounts')) {
      return res.status(403).json({
        success: false,
        error: 'Google Permission Error: In Apps Script, "Who has access" is currently set to "Only myself". In your Apps Script deployment, change "Who has access" to "Anyone" and redeploy.',
      });
    }

    if (response.ok) {
      return res.json({
        success: true,
        message: 'Successfully connected and sent test row to your Google Sheet!',
        responseStatus: response.status,
        responseDetails: dataText.slice(0, 200),
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: `Google Apps Script returned HTTP ${response.status}. Please ensure "Who has access" is set to "Anyone".`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Could not reach Google Apps Script Webhook: ${err.message}`,
    });
  }
});

// 5. Track drop-off step in funnel
app.post('/api/quiz/track-step', (req, res) => {
  const { step } = req.body;
  if (typeof step === 'number') {
    incrementFunnelStep(step);
  }
  res.json({ ok: true });
});

// 6. Admin: Get all quiz responses & leads
app.get('/api/quiz/leads', (_req, res) => {
  const leads = readBackupResponses();
  res.json({ leads });
});

// 7. Admin: Get funnel analytics
app.get('/api/quiz/analytics', (_req, res) => {
  const funnel = readFunnelStats();
  const leads = readBackupResponses();
  res.json({
    funnel,
    totalLeads: leads.length,
  });
});

// -------------------------------------------------------------
// VITE INTEGRATION
// -------------------------------------------------------------
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Nthabi's Touch full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
