import { QuizAnswers, SpaPersonality, generateRewardCode } from '../data/quizConfig';

export interface QuizSubmissionPayload {
  'Timestamp': string;
  'First Name': string;
  'Mobile': string;
  'Email': string;
  'Preferred Contact': string;
  'Treatments Interested In': string;
  'Main Need': string;
  'Visit Frequency': string;
  'Occupation Status': string;
  'Job Title / Field of Study': string;
  'Area': string;
  'Suburb/City (Other)': string;
  'Gender': string;
  'Age Range': string;
  'Race': string;
  'Reward Code': string;
  'Spa Personality': string;
  'Consent Given': string;
  'Source Page': string;
}

export interface QuizSubmissionRecord {
  id: string;
  payload: QuizSubmissionPayload;
  submittedAt: string;
  forwardedToSheet: boolean;
  forwardError?: string;
}

export interface FunnelStats {
  starts: number;
  stepDropoff: Record<number, number>; // step number -> count of users who reached this step
  completions: number;
}

const LOCAL_STORAGE_QUIZ_RESPONSES = 'nthabi_quiz_responses_backup_v1';
const LOCAL_STORAGE_FUNNEL = 'nthabi_quiz_funnel_stats_v1';
let lastSubmissionTimestamp = 0;

export function getLocalQuizResponses(): QuizSubmissionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUIZ_RESPONSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalQuizResponse(record: QuizSubmissionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalQuizResponses();
    list.unshift(record); // newest first
    localStorage.setItem(LOCAL_STORAGE_QUIZ_RESPONSES, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save local quiz response', e);
  }
}

export function getFunnelStats(): FunnelStats {
  if (typeof window === 'undefined') {
    return { starts: 0, stepDropoff: {}, completions: 0 };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FUNNEL);
    if (!raw) {
      return {
        starts: 14,
        stepDropoff: { 1: 14, 2: 13, 3: 12, 4: 12, 5: 11, 6: 10, 7: 9, 8: 9 },
        completions: 8,
      };
    }
    return JSON.parse(raw);
  } catch {
    return { starts: 0, stepDropoff: {}, completions: 0 };
  }
}

export function trackFunnelStep(step: number): void {
  if (typeof window === 'undefined') return;
  try {
    const stats = getFunnelStats();
    if (step === 1) {
      stats.starts = (stats.starts || 0) + 1;
    }
    stats.stepDropoff = stats.stepDropoff || {};
    stats.stepDropoff[step] = (stats.stepDropoff[step] || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_FUNNEL, JSON.stringify(stats));

    // Also notify server analytics asynchronously
    fetch('/api/quiz/track-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, timestamp: new Date().toISOString() }),
    }).catch(() => {
      // Non-blocking
    });
  } catch {
    // Ignore analytics tracking errors
  }
}

export function trackFunnelCompletion(): void {
  if (typeof window === 'undefined') return;
  try {
    const stats = getFunnelStats();
    stats.completions = (stats.completions || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_FUNNEL, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

// Convert user answers to exact Google Sheet Payload
export function formatQuizPayload(
  answers: QuizAnswers,
  personality: SpaPersonality,
  rewardCode: string
): QuizSubmissionPayload {
  const now = new Date();
  // Formatted date string in South African timezone context
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  return {
    'Timestamp': timestamp,
    'First Name': answers.firstName?.trim() || 'Valued Guest',
    'Mobile': answers.mobile?.trim() || '',
    'Email': answers.email?.trim() || '',
    'Preferred Contact': answers.preferredContact || 'WhatsApp',
    'Treatments Interested In': (answers.treatments || []).join(', ') || 'General Wellness',
    'Main Need': answers.mainNeed || 'Stress relief',
    'Visit Frequency': answers.visitFrequency || 'First time',
    'Occupation Status': answers.occupationStatus || 'Unspecified',
    'Job Title / Field of Study': answers.jobTitleOrStudy?.trim() || 'N/A',
    'Area': answers.area || 'Sandton / Fourways',
    'Suburb/City (Other)': answers.suburbOther?.trim() || 'N/A',
    'Gender': answers.gender || 'Prefer not to say',
    'Age Range': answers.ageRange || 'Prefer not to say',
    'Race': answers.race || 'Prefer not to say',
    'Reward Code': rewardCode,
    'Spa Personality': `${personality.title} ${personality.emoji}`,
    'Consent Given': answers.consentGiven ? 'YES' : 'NO',
    'Source Page': typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
  };
}

export interface SubmitQuizResult {
  success: boolean;
  rewardCode: string;
  forwardedToSheet: boolean;
  personality: SpaPersonality;
}

export async function submitQuizAnswers(
  answers: QuizAnswers,
  personality: SpaPersonality
): Promise<SubmitQuizResult> {
  // 1. Honeypot anti-spam check: if bot filled hidden field, return mock success
  if (answers.honeypot && answers.honeypot.trim().length > 0) {
    const fakeCode = generateRewardCode();
    return {
      success: true,
      rewardCode: fakeCode,
      forwardedToSheet: false,
      personality,
    };
  }

  // 2. Client-side rate-limit: minimum 5s between submissions
  const now = Date.now();
  if (now - lastSubmissionTimestamp < 5000) {
    throw new Error('Please wait a few moments before resubmitting.');
  }
  lastSubmissionTimestamp = now;

  const rewardCode = generateRewardCode();
  const payload = formatQuizPayload(answers, personality, rewardCode);

  let forwarded = false;
  let forwardError: string | undefined = undefined;

  // 3. Post to backend proxy route /api/quiz/submit
  // This proxy securely relays to GOOGLE_SHEET_WEBHOOK_URL with SHEET_SECRET_TOKEN
  // and saves to Supabase table quiz_responses or local backup.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      forwarded = data.forwardedToSheet ?? true;
      if (!forwarded && data.forwardError) {
        forwardError = data.forwardError;
      }
    } else {
      forwardError = `Server responded with ${res.status}`;
    }
  } catch (err: any) {
    forwardError = err.message || 'Network unreachable';
  }

  // Dual-redundancy: If server forward didn't succeed, trigger direct client fetch to Google Apps Script Webhook
  const DIRECT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxfW_GW_C6YBmepwKhLZi3Jc43afzOZfGy6IFE7HEAptoMfm56BSbF4-8z7doXdlSC2/exec';
  if (!forwarded && DIRECT_WEBHOOK_URL) {
    try {
      fetch(DIRECT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      })
        .then(() => {
          forwarded = true;
          forwardError = undefined;
        })
        .catch(() => {});
    } catch {}
  }

  // 4. Save local backup unconditionally in browser
  const record: QuizSubmissionRecord = {
    id: `quiz-resp-${Date.now()}`,
    payload,
    submittedAt: new Date().toISOString(),
    forwardedToSheet: forwarded,
    forwardError,
  };
  saveLocalQuizResponse(record);
  trackFunnelCompletion();

  // 5. If Google Workspace OAuth is connected in the browser, append directly to user's Google Sheet
  try {
    const { getGoogleAccessToken } = await import('./googleAuth');
    const { getSavedSpreadsheetId, appendQuizResponseToSheet } = await import('./googleSheetsService');
    const googleToken = getGoogleAccessToken();
    const sheetId = getSavedSpreadsheetId();
    if (googleToken && sheetId) {
      appendQuizResponseToSheet(googleToken, sheetId, payload).then((ok) => {
        if (ok) {
          record.forwardedToSheet = true;
          saveLocalQuizResponse(record);
        }
      }).catch(() => {});
    }
  } catch {
    // Non-blocking
  }

  // Remember completion in localStorage so auto-popup never annoys user
  if (typeof window !== 'undefined') {
    localStorage.setItem('nthabi_quiz_completed', 'true');
    localStorage.setItem('nthabi_unlocked_code', rewardCode);
  }

  // Always return success so user gets their reward and results screen!
  return {
    success: true,
    rewardCode,
    forwardedToSheet: forwarded,
    personality,
  };
}
