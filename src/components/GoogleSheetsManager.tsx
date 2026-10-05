import React, { useState, useEffect } from 'react';
import {
  initGoogleAuth,
  signInWithGoogle,
  getGoogleAccessToken,
  googleSignOut,
} from '../services/googleAuth';
import {
  createQuizSpreadsheet,
  getSavedSpreadsheetId,
  saveSpreadsheetId,
  readQuizSheetRows,
  syncAllLocalLeadsToGoogleSheet,
  SHEET_COLUMNS,
} from '../services/googleSheetsService';
import { getLocalQuizResponses, QuizSubmissionRecord } from '../services/quizService';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  LogOut,
  Table,
  Eye,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

export const GoogleSheetsManager: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(getSavedSpreadsheetId());
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(
    spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : null
  );

  // Live Sheet Data state
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>(SHEET_COLUMNS);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'embedded'>('table');
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [localLeads, setLocalLeads] = useState<QuizSubmissionRecord[]>([]);

  // 24/7 Background Webhook state
  const [activeSection, setActiveSection] = useState<'webhook' | 'leads'>('webhook');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isWebhookConfigured, setIsWebhookConfigured] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestMessage, setWebhookTestMessage] = useState<string | null>(null);

  // Fetch settings & local leads on mount
  useEffect(() => {
    // 1. Fetch server settings
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.spreadsheetId && !spreadsheetId) {
          setSpreadsheetId(data.spreadsheetId);
          setSpreadsheetUrl(data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`);
          saveSpreadsheetId(data.spreadsheetId, data.spreadsheetUrl);
        }
        if (data.webhookUrl) {
          setWebhookUrl(data.webhookUrl);
        }
        setIsWebhookConfigured(Boolean(data.isConfigured));
      })
      .catch(() => {});

    // 2. Fetch all leads from server backup & localStorage
    fetch('/api/quiz/leads')
      .then((r) => r.json())
      .then((data) => {
        if (data.leads && Array.isArray(data.leads) && data.leads.length > 0) {
          setLocalLeads(data.leads);
        } else {
          setLocalLeads(getLocalQuizResponses());
        }
      })
      .catch(() => {
        setLocalLeads(getLocalQuizResponses());
      });
  }, []);

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setCurrentUser(user);
        setAuthToken(token);
      },
      () => {
        setCurrentUser(null);
        setAuthToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch rows if token & spreadsheetId exist
  const loadRows = async (token: string, id: string) => {
    setIsLoadingRows(true);
    setErrorMessage(null);
    try {
      const data = await readQuizSheetRows(token, id);
      setSheetHeaders(data.headers.length > 0 ? data.headers : SHEET_COLUMNS);
      setSheetRows(data.rows);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load rows from Google Sheet');
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    if (authToken && spreadsheetId) {
      loadRows(authToken, spreadsheetId);
    }
  }, [authToken, spreadsheetId]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    setSyncStatus(null);
    try {
      const res = await signInWithGoogle();
      setCurrentUser(res.user);
      setAuthToken(res.accessToken);

      const { findExistingSpreadsheet } = await import('../services/googleSheetsService');

      // 1. Check if we already have saved ID locally or in server settings
      let targetId = spreadsheetId || getSavedSpreadsheetId();
      let targetUrl = spreadsheetUrl;

      // 2. If no saved ID, query Drive for existing sheet created for Nthabi's Touch
      if (!targetId) {
        const found = await findExistingSpreadsheet(res.accessToken);
        if (found) {
          targetId = found.spreadsheetId;
          targetUrl = found.spreadsheetUrl;
        }
      }

      if (targetId) {
        setSpreadsheetId(targetId);
        const url = targetUrl || `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
        setSpreadsheetUrl(url);
        // Also auto-sync any leads
        const leads = localLeads.length > 0 ? localLeads : getLocalQuizResponses();
        if (leads.length > 0) {
          await syncAllLocalLeadsToGoogleSheet(res.accessToken, targetId, leads);
          setSyncStatus(`Connected to Google Sheets! Synced ${leads.length} quiz lead(s) successfully.`);
        }
        await loadRows(res.accessToken, targetId);
      } else {
        await handleCreateSheet(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in was canceled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Create Sheet
  const handleCreateSheet = async (tokenToUse?: string) => {
    const token = tokenToUse || authToken || getGoogleAccessToken();
    if (!token) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    setIsCreatingSheet(true);
    setErrorMessage(null);
    try {
      const created = await createQuizSpreadsheet(token);
      setSpreadsheetId(created.spreadsheetId);
      setSpreadsheetUrl(created.spreadsheetUrl);
      saveSpreadsheetId(created.spreadsheetId, created.spreadsheetUrl);

      // Auto-sync any existing local/server leads
      const leads = localLeads.length > 0 ? localLeads : getLocalQuizResponses();
      if (leads.length > 0) {
        await syncAllLocalLeadsToGoogleSheet(token, created.spreadsheetId, leads);
      }
      await loadRows(token, created.spreadsheetId);
      setSyncStatus(`Created spreadsheet "Nthabi's Touch - Spa Quiz Leads & Bookings" with ${leads.length} lead(s) synced!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not create Google Spreadsheet');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Handle Link Existing Sheet
  const handleLinkExistingSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetInput.trim()) return;

    const token = authToken || getGoogleAccessToken();
    if (!token) {
      setErrorMessage('Please sign in with Google first to verify sheet access.');
      return;
    }

    const { extractSpreadsheetId } = await import('../services/googleSheetsService');
    const cleanId = extractSpreadsheetId(customSheetInput);
    if (!cleanId) {
      setErrorMessage('Invalid Google Spreadsheet URL or ID.');
      return;
    }

    setIsLoadingRows(true);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
      saveSpreadsheetId(cleanId, url);
      setSpreadsheetId(cleanId);
      setSpreadsheetUrl(url);

      const leads = localLeads.length > 0 ? localLeads : getLocalQuizResponses();
      if (leads.length > 0) {
        await syncAllLocalLeadsToGoogleSheet(token, cleanId, leads);
        setSyncStatus(`Linked spreadsheet and synced ${leads.length} lead(s)!`);
      } else {
        setSyncStatus('Spreadsheet linked successfully!');
      }

      await loadRows(token, cleanId);
      setCustomSheetInput('');
    } catch (err: any) {
      setErrorMessage(`Could not access spreadsheet: ${err.message}. Make sure your account has edit permissions.`);
    } finally {
      setIsLoadingRows(false);
    }
  };

  // Handle Sync All Leads
  const handleSyncAll = async () => {
    if (!authToken || !spreadsheetId) return;
    setIsSyncing(true);
    setErrorMessage(null);
    setSyncStatus(null);
    try {
      const leads = localLeads.length > 0 ? localLeads : getLocalQuizResponses();
      const count = await syncAllLocalLeadsToGoogleSheet(authToken, spreadsheetId, leads);
      setSyncStatus(`Synced ${count} lead(s) to your Google Sheet!`);
      await loadRows(authToken, spreadsheetId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not sync leads');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Save Webhook URL for 24/7 background real-time sync
  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebhook(true);
    setWebhookTestMessage(null);
    try {
      const res = await fetch('/api/settings/google-sheet-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setIsWebhookConfigured(Boolean(data.isConfigured));
        setSyncStatus('24/7 Real-Time Auto-Delivery is now active! All new quiz submissions will land on your Google Sheet instantly.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not save webhook URL');
    } finally {
      setIsSavingWebhook(false);
    }
  };

  // Test Webhook Connection with live ping
  const handleTestWebhook = async () => {
    setActiveSection('webhook');
    const targetUrl =
      webhookUrl.trim() ||
      'https://script.google.com/macros/s/AKfycbwIjkzBVDSgWfGT9Rwx78plq6L3NB5E9KyqWU1WGhQXqiwVpV8FkLuhhHynMnnVF5KQ/exec';

    setIsTestingWebhook(true);
    setWebhookTestMessage(null);
    try {
      const res = await fetch('/api/settings/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: targetUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookTestMessage('✓ Connection successful! A test row was sent to your Google Sheet.');
        if (authToken && spreadsheetId) {
          loadRows(authToken, spreadsheetId);
        }
      } else {
        setWebhookTestMessage(`Error: ${data.error || 'Webhook test failed'}`);
      }
    } catch (err: any) {
      setWebhookTestMessage(`Error: ${err.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAuthToken(null);
    setSheetRows([]);
  };

  // Filtered rows for in-app search
  const filteredRows = sheetRows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return row.some((cell) => String(cell).toLowerCase().includes(term));
  });

  const sampleAppsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "First Name", "Mobile", "Email", "Preferred Contact",
        "Treatments Interested In", "Main Need", "Visit Frequency", 
        "Occupation Status", "Job Title / Field of Study", "Area", 
        "Suburb/City (Other)", "Gender", "Age Range", "Race", 
        "Reward Code", "Spa Personality", "Consent Given", "Source Page"
      ]);
    }
    
    sheet.appendRow([
      data["Timestamp"] || new Date().toISOString(),
      data["First Name"] || "",
      data["Mobile"] || "",
      data["Email"] || "",
      data["Preferred Contact"] || "",
      data["Treatments Interested In"] || "",
      data["Main Need"] || "",
      data["Visit Frequency"] || "",
      data["Occupation Status"] || "",
      data["Job Title / Field of Study"] || "",
      data["Area"] || "",
      data["Suburb/City (Other)"] || "",
      data["Gender"] || "",
      data["Age Range"] || "",
      data["Race"] || "",
      data["Reward Code"] || "",
      data["Spa Personality"] || "",
      data["Consent Given"] || "",
      data["Source Page"] || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Nthabi's Touch Google Sheets Webhook is online and ready!")
    .setMimeType(ContentService.MimeType.TEXT);
}`;

  return (
    <div className="space-y-6">
      {/* Top Section Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DEC8] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('webhook')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'webhook'
                ? 'bg-[#1C2E24] text-[#FAF7F2] shadow-sm'
                : 'bg-[#FAF8F5] text-[#5C5047] hover:bg-[#EFEAE2] border border-[#E8DEC8]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>⚡ 24/7 Webhook &amp; Test Live Ping</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isWebhookConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-700'
              }`}
            >
              {isWebhookConfigured ? 'Active' : 'Setup'}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'leads'
                ? 'bg-[#1C2E24] text-[#FAF7F2] shadow-sm'
                : 'bg-[#FAF8F5] text-[#5C5047] hover:bg-[#EFEAE2] border border-[#E8DEC8]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0F9D58]" />
            <span>Google Sheet Data ({localLeads.length} Leads)</span>
          </button>
        </div>

        {/* Global Persistent Test Ping Button */}
        <button
          onClick={handleTestWebhook}
          disabled={isTestingWebhook}
          className="px-4 py-2 bg-[#0F9D58] hover:bg-[#0B8043] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          title="Send test row to Google Sheets right now"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isTestingWebhook ? 'Testing Connection...' : '⚡ Test Live Ping'}</span>
        </button>
      </div>

      {/* SECTION 1: 24/7 Webhook & Test Live Ping */}
      {activeSection === 'webhook' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E8DEC8] shadow-sm space-y-5 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE2]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F9D58] shrink-0">
                <Sparkles className="w-6 h-6 text-[#0F9D58]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#1C2E24]">
                  24/7 Automated Delivery to Google Sheets
                </h4>
                <p className="text-xs text-[#7A6D63]">
                  Sends every quiz lead into your Google Sheet in &lt;1 second, 24 hours a day, even when your phone or laptop is closed.
                </p>
              </div>
            </div>

            <button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTestingWebhook ? 'Pinging Google Sheets...' : '▶ Run Test Live Ping Now'}</span>
            </button>
          </div>

          {/* Test Ping Result Banner */}
          {webhookTestMessage && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in ${
                webhookTestMessage.startsWith('✓')
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {webhookTestMessage.startsWith('✓') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <strong className="block font-semibold mb-0.5">
                  {webhookTestMessage.startsWith('✓') ? 'Connection Successful!' : 'Connection Notice:'}
                </strong>
                <span>{webhookTestMessage}</span>
              </div>
            </div>
          )}

          {/* Solution Callout for "You need access" Error */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E0D3C1] text-xs text-[#5C5047] space-y-2">
            <h5 className="font-semibold text-[#1C2E24] flex items-center gap-1.5">
              <span>Why the previous test ping showed an error &amp; how to fix it:</span>
            </h5>
            <p className="leading-relaxed">
              Google Apps Script defaults its deployment permission to <strong>"Only myself"</strong>, which tells Google to block external website submissions.
            </p>
            <div className="space-y-1.5 pl-3 border-l-2 border-[#D4AF37] text-[11px]">
              <div>
                <strong>Step 1:</strong> Open your Google Sheet:{' '}
                {spreadsheetUrl ? (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F9D58] font-bold underline inline-flex items-center gap-1"
                  >
                    <span>Nthabi's Touch - Spa Quiz Leads &amp; Bookings</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  'your spreadsheet'
                )}.
              </div>
              <div>
                <strong>Step 2:</strong> In Google Sheets, click menu <strong>Extensions &gt; Apps Script</strong>.
              </div>
              <div>
                <strong>Step 3:</strong> At the top right of Apps Script, click the blue <strong>Deploy</strong> button &gt; <strong>Manage deployments</strong>.
              </div>
              <div>
                <strong>Step 4:</strong> Click the <strong>pencil icon ✏️ (Edit)</strong>.
              </div>
              <div>
                <strong>Step 5:</strong> Change <strong>"Who has access"</strong> to <strong>"Anyone"</strong>, then click <strong>Deploy</strong>.
              </div>
              <div>
                <strong>Step 6:</strong> Click the green <strong>"▶ Run Test Live Ping Now"</strong> button above!
              </div>
            </div>
          </div>

          {/* Webhook URL Input Form */}
          <form onSubmit={handleSaveWebhook} className="space-y-2">
            <label className="block font-semibold text-[#2E2824] text-xs">
              Google Apps Script Web App URL:
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D8CFC5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#1C2E24]"
              />
              <button
                type="submit"
                disabled={isSavingWebhook || !webhookUrl.trim()}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#1C2E24] hover:bg-[#284133] disabled:opacity-50 text-[#FAF7F2] rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                {isSavingWebhook ? 'Saving...' : 'Save Webhook URL'}
              </button>
            </div>
          </form>

          {/* Script Code Reference */}
          <div className="pt-2 border-t border-[#F0EAE2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#1C2E24]">Google Apps Script Code (Code.gs):</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleAppsScriptCode);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="px-2.5 py-1 bg-white border border-[#D8CFC5] rounded-lg text-xs font-medium text-[#1C2E24] hover:bg-[#FAF8F5] flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#1C2E24] text-[#FAF7F2] rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed max-h-48">
              {sampleAppsScriptCode}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: Spreadsheet Data & Leads */}
      {activeSection === 'leads' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Status & Connection Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF8F5] to-[#F5EFEB] border border-[#E8DEC8] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#0F9D58]/10 text-[#0F9D58] shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-6 h-6 text-[#0F9D58]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#1C2E24] leading-snug">
                    Google Sheets Live Sync
                  </h4>
                  <p className="text-xs text-[#6B5E55]">
                    {currentUser
                      ? `Connected as ${currentUser.displayName || currentUser.email}`
                      : `${localLeads.length} quiz lead(s) captured! Connect your Google account to automatically sync them to your Google Sheet.`}
                  </p>
                </div>
              </div>

              <div>
                {!currentUser ? (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoggingIn}
                    className="gsi-material-button px-4 py-2.5 bg-white border border-[#D8CFC5] rounded-xl hover:bg-[#FAF8F5] transition-all shadow-sm flex items-center gap-2.5 text-xs font-semibold text-[#2E2824] active:scale-98 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-lg border border-[#D8CFC5] bg-white text-xs text-[#7A6D63] hover:text-[#1C2E24] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Disconnect Google account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Informational callout when not connected yet */}
            {!currentUser && (
              <div className="mt-4 pt-3 border-t border-[#E5DDD4] space-y-3">
                <div className="bg-[#FAF3EA] p-3 rounded-xl border border-[#E0D3C1] text-xs text-[#5C5047] flex items-start gap-2.5">
                  <span className="text-base shrink-0">✨</span>
                  <div>
                    <strong className="text-[#1C2E24] block mb-0.5">
                      Why haven't your responses appeared in Google Sheets yet?
                    </strong>
                    <p className="leading-relaxed">
                      All <strong>{localLeads.length} form responses</strong> (including Nthabiseng Rakuoane, Jazeem Allah, Mary Jones, Flora, etc.) are safely stored in your studio database!
                      To write them to your personal Google Drive, Google requires you to sign in once with your Google account.
                      Click the <strong>"Sign in with Google"</strong> button above, and the system will automatically create your sheet and sync all {localLeads.length} responses in seconds!
                    </p>
                  </div>
                </div>

                {/* Optional Link Existing Spreadsheet */}
                <form onSubmit={handleLinkExistingSheet} className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <span className="text-[#6B5E55] whitespace-nowrap font-medium">Or link existing Google Sheet:</span>
                  <input
                    type="text"
                    value={customSheetInput}
                    onChange={(e) => setCustomSheetInput(e.target.value)}
                    placeholder="Paste Google Sheet URL or ID..."
                    className="flex-1 w-full px-3 py-1.5 bg-white border border-[#D8CFC5] rounded-xl text-xs focus:outline-none focus:border-[#1C2E24]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Connect Sheet
                  </button>
                </form>
              </div>
            )}

            {/* Action Bar when Connected */}
            {currentUser && (
              <div className="mt-4 pt-3 border-t border-[#E5DDD4] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#1C2E24]">
                  <span className="font-semibold">Spreadsheet:</span>
                  {spreadsheetUrl ? (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0F9D58] font-semibold hover:underline"
                    >
                      <span>Nthabi's Touch - Spa Quiz Leads &amp; Bookings</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[#8C6D46]">None created yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!spreadsheetId ? (
                    <button
                      onClick={() => handleCreateSheet()}
                      disabled={isCreatingSheet}
                      className="px-3.5 py-1.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{isCreatingSheet ? 'Creating Sheet...' : 'Create Google Sheet & Sync All'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSyncAll}
                        disabled={isSyncing}
                        className="px-3 py-1.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] rounded-lg font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isSyncing ? 'Syncing...' : `Sync All (${localLeads.length})`}</span>
                      </button>

                      <button
                        onClick={() => authToken && loadRows(authToken, spreadsheetId)}
                        disabled={isLoadingRows}
                        className="px-3 py-1.5 bg-white border border-[#D8CFC5] text-[#2E2824] hover:bg-[#FAF7F2] rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reload data from Google Sheets"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRows ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>

                      <a
                        href={spreadsheetUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Open in Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Feedback / Notification alerts */}
            {syncStatus && (
              <div className="mt-3 p-3 rounded-xl bg-[#E6F4EA] border border-[#A8DAB5] text-xs text-[#137333] flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{syncStatus}</span>
                </div>
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline text-[#0F9D58] hover:text-[#0B8043]"
                  >
                    <span>View Live Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

      {/* When not connected, show the 6 captured client responses from the backup so user sees them right away! */}
      {!currentUser && localLeads.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-serif text-base font-semibold text-[#1C2E24]">
                Captured Client Form Responses ({localLeads.length})
              </h5>
              <p className="text-xs text-[#7A6D63]">
                These responses were captured from your quiz and are waiting to be sent to your Google Sheet:
              </p>
            </div>
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="px-3.5 py-1.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sync to Google Sheets</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-60 border border-[#F0EAE2] rounded-xl">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#1C2E24] text-[#FAF7F2] sticky top-0">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Mobile</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Treatments</th>
                  <th className="py-2 px-3">Reward Code</th>
                  <th className="py-2 px-3">Personality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {localLeads.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]'}>
                    <td className="py-2 px-3 whitespace-nowrap text-[#7A6D63] font-mono">{item.payload['Timestamp']}</td>
                    <td className="py-2 px-3 font-semibold text-[#1C2E24]">{item.payload['First Name']}</td>
                    <td className="py-2 px-3 font-mono">{item.payload['Mobile']}</td>
                    <td className="py-2 px-3 text-[#5C5047]">{item.payload['Email']}</td>
                    <td className="py-2 px-3 truncate max-w-xs">{item.payload['Treatments Interested In']}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#8C6D46]">{item.payload['Reward Code']}</td>
                    <td className="py-2 px-3">{item.payload['Spa Personality']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Content Area: Table / Embedded / Guide */}
      {currentUser && spreadsheetId && (
        <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-[#E8DEC8] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C7E74]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search spreadsheet rows..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D8CFC5] rounded-xl text-xs focus:outline-none focus:border-[#1C2E24]"
                />
              </div>
              <span className="text-[#8C6D46] whitespace-nowrap">
                {filteredRows.length} row(s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-0.5 bg-[#EAE2D7] rounded-lg flex items-center">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-[#1C2E24] shadow-xs'
                      : 'text-[#6B5E55] hover:text-[#1C2E24]'
                  }`}
                >
                  Data Grid
                </button>
                <button
                  onClick={() => setViewMode('embedded')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'embedded'
                      ? 'bg-white text-[#1C2E24] shadow-xs'
                      : 'text-[#6B5E55] hover:text-[#1C2E24]'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              <button
                onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
                className="px-2.5 py-1 text-xs text-[#8C6D46] hover:text-[#1C2E24] underline"
              >
                {showAppsScriptGuide ? 'Hide Webhook Guide' : 'Webhook / Script Guide'}
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Interactive Data Table */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto max-h-[55vh]">
              {isLoadingRows ? (
                <div className="p-12 text-center text-[#8C7E74]">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#0F9D58]" />
                  <p className="text-xs">Fetching live rows from Google Sheets...</p>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="p-12 text-center text-[#8C7E74]">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#0F9D58]" />
                  <p className="text-sm font-medium text-[#1C2E24]">No rows in Google Sheet yet</p>
                  <p className="text-xs mt-1">Click "Sync All Leads" above to populate all existing quiz results!</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#1C2E24] text-[#FAF7F2] sticky top-0 z-10">
                      <th className="py-2.5 px-3 font-semibold border-r border-[#2D3E32] w-10 text-center">#</th>
                      {sheetHeaders.map((header, idx) => (
                        <th
                          key={idx}
                          className="py-2.5 px-3 font-semibold border-r border-[#2D3E32] whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE2]">
                    {filteredRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={rowIdx % 2 === 0 ? 'bg-white hover:bg-[#FAF8F5]' : 'bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'}
                      >
                        <td className="py-2 px-3 text-center text-[#8C7E74] font-mono border-r border-[#F0EAE2]">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="py-2 px-3 text-[#2E2824] border-r border-[#F0EAE2] whitespace-nowrap max-w-xs truncate font-mono text-[11px]"
                            title={String(cell)}
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* VIEW MODE 2: Embedded Google Sheet Iframe Preview */}
          {viewMode === 'embedded' && (
            <div className="h-[55vh] w-full bg-[#FAF8F5]">
              <iframe
                title="Google Sheet Live View"
                src={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview?widget=true&headers=false`}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};
