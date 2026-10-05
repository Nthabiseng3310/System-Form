import { QuizSubmissionPayload, QuizSubmissionRecord } from './quizService';

export const SHEET_COLUMNS = [
  'Timestamp',
  'First Name',
  'Mobile',
  'Email',
  'Preferred Contact',
  'Treatments Interested In',
  'Main Need',
  'Visit Frequency',
  'Occupation Status',
  'Job Title / Field of Study',
  'Area',
  'Suburb/City (Other)',
  'Gender',
  'Age Range',
  'Race',
  'Reward Code',
  'Spa Personality',
  'Consent Given',
  'Source Page',
];

const LOCAL_STORAGE_SPREADSHEET_ID = 'nthabi_google_sheet_id';

export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // If full URL e.g. https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export function getSavedSpreadsheetId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_SPREADSHEET_ID);
}

export function saveSpreadsheetId(id: string, url?: string): void {
  if (typeof window === 'undefined') return;
  const cleanId = extractSpreadsheetId(id);
  localStorage.setItem(LOCAL_STORAGE_SPREADSHEET_ID, cleanId);

  // Sync to server settings
  fetch('/api/settings/spreadsheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId: cleanId,
      spreadsheetUrl: url || `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
    }),
  }).catch(() => {
    // Non-blocking
  });
}

// Search Drive for any existing spreadsheet created for Nthabi's Touch
export async function findExistingSpreadsheet(token: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  try {
    const query = encodeURIComponent("name contains 'Nthabi' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        const spreadsheetId = file.id;
        const spreadsheetUrl = file.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        saveSpreadsheetId(spreadsheetId, spreadsheetUrl);
        return { spreadsheetId, spreadsheetUrl };
      }
    }
  } catch (e) {
    console.warn('Could not query Drive for existing sheet', e);
  }
  return null;
}

// Convert payload object into ordered row array matching SHEET_COLUMNS
export function payloadToRow(payload: QuizSubmissionPayload): string[] {
  return SHEET_COLUMNS.map((col) => {
    return (payload as any)[col] || '';
  });
}

// 1. Create a new Google Spreadsheet in the user's Google Drive
export async function createQuizSpreadsheet(token: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Nthabi's Touch - Spa Quiz Leads & Bookings`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Quiz Responses',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Spreadsheet: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row to Quiz Responses sheet
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz%20Responses!A1:S1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Quiz Responses!A1:S1',
        majorDimension: 'ROWS',
        values: [SHEET_COLUMNS],
      }),
    });
  } catch (err) {
    console.warn('Could not write header row', err);
  }

  // Apply elegant styling to the header row (Dark Green #1C2E24, White text, Bold)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: data.sheets?.[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_COLUMNS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.11, green: 0.18, blue: 0.14 }, // #1C2E24
                  textFormat: {
                    foregroundColor: { red: 0.98, green: 0.97, blue: 0.95 },
                    bold: true,
                    fontSize: 10,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Could not apply custom header cell formatting', err);
  }

  saveSpreadsheetId(spreadsheetId, spreadsheetUrl);
  return { spreadsheetId, spreadsheetUrl };
}

// 2. Append a single quiz response row
export async function appendQuizResponseToSheet(
  token: string,
  spreadsheetId: string,
  payload: QuizSubmissionPayload
): Promise<boolean> {
  const row = payloadToRow(payload);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz%20Responses!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  return res.ok;
}

// 3. Read all rows from the Google Sheet
export async function readQuizSheetRows(
  token: string,
  spreadsheetId: string
): Promise<{ headers: string[]; rows: string[][] }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz%20Responses!A1:Z500`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    // Fallback to active sheet range A1:Z500 if 'Quiz Responses' tab not found
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z500`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!fallbackRes.ok) {
      throw new Error(`Failed to read spreadsheet rows: ${res.status}`);
    }
    const data = await fallbackRes.json();
    const allValues = data.values || [];
    if (allValues.length === 0) return { headers: SHEET_COLUMNS, rows: [] };
    const [headers, ...rows] = allValues;
    return { headers, rows };
  }

  const data = await res.json();
  const allValues = data.values || [];
  if (allValues.length === 0) {
    return { headers: SHEET_COLUMNS, rows: [] };
  }

  const [headers, ...rows] = allValues;
  return { headers, rows };
}

// 4. Batch sync all local leads to the Google Sheet
export async function syncAllLocalLeadsToGoogleSheet(
  token: string,
  spreadsheetId: string,
  leads: QuizSubmissionRecord[]
): Promise<number> {
  if (leads.length === 0) return 0;

  const rows = leads.map((lead) => payloadToRow(lead.payload));

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Quiz%20Responses!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sync failed with status ${res.status}: ${errText}`);
  }

  // Also notify server endpoint to mark records as synced
  fetch('/api/quiz/sync-to-sheet', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ spreadsheetId }),
  }).catch(() => {});

  return leads.length;
}
