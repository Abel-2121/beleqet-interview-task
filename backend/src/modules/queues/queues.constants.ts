// =============================================================================
// Beleqet — BullMQ Queue & Job Type Constants
// All queue names and job types in one place to prevent typos across modules.
// =============================================================================

/** All BullMQ queue names used across the application. */
export const QUEUE_NAMES = {
  APPLICATION:   'application-processing',
  NOTIFICATIONS: 'notifications',
  ANALYTICS:     'analytics',
  ESCROW:        'escrow',
  WALLET:        'wallet',
  SEARCH_INDEX:  'search-index',
  SCHEDULED:     'scheduled',
} as const;

// ── Application workflow jobs ─────────────────────────────────────────────

/** Job types for the application-processing queue (screening, scoring, notifications, interviews). */
export const APPLICATION_JOBS = {
  SCREEN_CANDIDATE: 'screen-candidate',
  UPDATE_SCORE:     'update-candidate-score',
  NOTIFY_RECRUITER: 'notify-recruiter-new-application',
  SCHEDULE_INTERVIEW: 'schedule-interview',
} as const;

// ── Notification jobs ─────────────────────────────────────────────────────

/** Job types for the notifications queue (in-app, Telegram, email). */
export const NOTIFICATION_JOBS = {
  SEND_IN_APP:  'send-in-app',
  SEND_TELEGRAM: 'send-telegram',
  SEND_EMAIL:   'send-email',
} as const;

// ── Analytics jobs ────────────────────────────────────────────────────────

/** Job types for the analytics queue (stats updates and event logging). */
export const ANALYTICS_JOBS = {
  UPDATE_JOB_STATS:  'update-job-stats',
  UPDATE_USER_STATS: 'update-user-stats',
  LOG_EVENT:         'log-platform-event',
} as const;

// ── Escrow jobs ───────────────────────────────────────────────────────────

/** Job types for the escrow queue (webhooks, auto-release, withdrawals). */
export const ESCROW_JOBS = {
  PROCESS_WEBHOOK:    'process-payment-webhook',
  AUTO_RELEASE:       'auto-release-milestone',  // 14-day auto-approval
  PROCESS_WITHDRAWAL: 'process-wallet-withdrawal',
} as const;

// ── Scoring thresholds ────────────────────────────────────────────────────

/** Threshold constants for auto-shortlisting and auto-rejecting candidates. */
export const SCORING = {
  /** Candidates above this threshold are automatically shortlisted */
  AUTO_SHORTLIST_THRESHOLD: 75,
  /** Candidates below this threshold are automatically rejected */
  AUTO_REJECT_THRESHOLD: 30,
} as const;
