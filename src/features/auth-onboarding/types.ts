/**
 * Domain types for the Auth & Onboarding feature (E1-T3).
 *
 * These types model the initial-scan onboarding flow: when a user connects
 * their mailbox we fetch the last few days of email, classify each message by
 * business priority and hand back a ready-to-render prioritized inbox.
 *
 * NOTE: `src/shared/types/index.ts` does not yet exist in this repo, so the
 * shared primitives that would naturally live there (PriorityBucket, EmailId,
 * etc.) are defined here and re-exported from the feature barrel. When the
 * shared module lands these can be lifted verbatim.
 */

/** Opaque identifiers kept as branded-ish aliases for readability. */
export type AccountId = string;
export type EmailId = string;

/**
 * Business-priority buckets, ordered from most to least important. The order of
 * this tuple is the canonical ranking used when building the prioritized inbox.
 */
export const PRIORITY_BUCKETS = [
  'critical',
  'high',
  'medium',
  'low',
  'noise',
] as const;

export type PriorityBucket = (typeof PRIORITY_BUCKETS)[number];

/** Numeric rank (0 = highest priority) derived from PRIORITY_BUCKETS order. */
export function bucketRank(bucket: PriorityBucket): number {
  return PRIORITY_BUCKETS.indexOf(bucket);
}

/** A raw message as returned by the connected mail provider. */
export interface RawEmail {
  readonly id: EmailId;
  readonly threadId: string;
  readonly from: EmailAddress;
  readonly to: readonly EmailAddress[];
  readonly subject: string;
  /** Plain-text snippet/body used for classification. */
  readonly snippet: string;
  /** RFC3339 timestamp the message was received. */
  readonly receivedAt: string;
  readonly unread: boolean;
  readonly labels: readonly string[];
}

export interface EmailAddress {
  readonly name: string | null;
  readonly email: string;
}

/** Output of the classifier for a single email. */
export interface EmailClassification {
  readonly bucket: PriorityBucket;
  /** Confidence-weighted score in [0, 1]; used as a tie-breaker within a bucket. */
  readonly score: number;
  /** Short human-readable justification, surfaced in the UI. */
  readonly reason: string;
  /** Optional detected intent (e.g. "hot_lead", "complaint", "newsletter"). */
  readonly intent: string | null;
}

/** A raw email enriched with its classification. */
export interface ClassifiedEmail extends RawEmail {
  readonly classification: EmailClassification;
}

/** A single priority bucket populated with its (already sorted) emails. */
export interface PrioritizedBucket {
  readonly bucket: PriorityBucket;
  readonly emails: readonly ClassifiedEmail[];
}

/** The prioritized inbox handed to the UI once onboarding completes. */
export interface PrioritizedInbox {
  readonly accountId: AccountId;
  readonly generatedAt: string;
  readonly buckets: readonly PrioritizedBucket[];
  /** Flattened, fully-ranked view — convenient for a single scroll list. */
  readonly ranked: readonly ClassifiedEmail[];
  readonly totalScanned: number;
}

/** Tunable parameters for the initial scan. */
export interface InitialScanConfig {
  /** How many days back to scan. Defaults to 3 (per the acceptance criteria). */
  readonly lookbackDays: number;
  /** Hard cap on messages fetched to keep onboarding fast. */
  readonly maxEmails: number;
  /** Max concurrent classifier calls. */
  readonly classifyConcurrency: number;
}

export const DEFAULT_SCAN_CONFIG: InitialScanConfig = {
  lookbackDays: 3,
  maxEmails: 500,
  classifyConcurrency: 8,
};

/** Phases emitted through the progress callback during onboarding. */
export type OnboardingPhase =
  | 'connecting'
  | 'fetching'
  | 'classifying'
  | 'ranking'
  | 'done'
  | 'error';

export interface OnboardingProgress {
  readonly phase: OnboardingPhase;
  /** Completion in [0, 1]; monotonically non-decreasing across a run. */
  readonly progress: number;
  readonly processed: number;
  readonly total: number;
  readonly message: string;
}

export type ProgressListener = (progress: OnboardingProgress) => void;

export interface OnboardingResult {
  readonly inbox: PrioritizedInbox;
  readonly durationMs: number;
}

/**
 * Query passed to the mail provider when listing messages for the scan.
 */
export interface EmailListQuery {
  readonly accountId: AccountId;
  /** RFC3339 lower bound (inclusive). */
  readonly since: string;
  readonly maxResults: number;
}

// ---- Ports (dependency-inversion boundaries) --------------------------------

/** Provider-agnostic access to a connected mailbox (Gmail, Graph, IMAP…). */
export interface EmailProviderPort {
  /** Establishes/validates the connection for an account; throws on failure. */
  connect(accountId: AccountId): Promise<void>;
  /** Lists messages matching the query, newest first. */
  listRecent(query: EmailListQuery): Promise<readonly RawEmail[]>;
}

/** AI classifier that scores an email's business priority. */
export interface EmailClassifierPort {
  classify(email: RawEmail): Promise<EmailClassification>;
}

/** Persists the generated inbox so onboarding is only paid for once. */
export interface InboxStorePort {
  save(inbox: PrioritizedInbox): Promise<void>;
  load(accountId: AccountId): Promise<PrioritizedInbox | null>;
}

/** Monotonic clock, injectable for deterministic tests. */
export interface Clock {
  now(): Date;
}

export interface OnboardingDeps {
  readonly provider: EmailProviderPort;
  readonly classifier: EmailClassifierPort;
  readonly inboxStore: InboxStorePort;
  readonly clock?: Clock;
  readonly config?: Partial<InitialScanConfig>;
}
