// Tipos del subsistema de notificaciones de emails de alta prioridad (E3-T3).
// Nota: cuando exista src/shared/types/index.ts, EmailPriority/EmailAddress/PrioritizedEmail
// deberian re-exportarse desde alli. Se definen localmente para mantener el feature autocontenido.

export type EmailPriority = 'high' | 'medium' | 'low';

export interface EmailAddress {
  readonly name?: string;
  readonly email: string;
}

/** Email ya clasificado por el motor de priorizacion IA. */
export interface PrioritizedEmail {
  readonly id: string;
  readonly accountId: string;
  readonly userId: string;
  readonly from: EmailAddress;
  readonly subject: string;
  readonly snippet: string;
  /** ISO-8601 UTC. */
  readonly receivedAt: string;
  readonly priority: EmailPriority;
  /** Score normalizado 0..1 devuelto por el clasificador. */
  readonly priorityScore: number;
}

export type NotificationChannelType = 'email' | 'web-push';

export interface NotificationPayload {
  readonly title: string;
  readonly body: string;
  readonly emailId: string;
  /** Deep-link a la bandeja priorizada. */
  readonly url?: string;
}

export interface ChannelDeliveryResult {
  readonly channel: NotificationChannelType;
  readonly delivered: boolean;
  readonly error?: string;
}

/** Canal de entrega concreto (email transaccional, web push, etc.). */
export interface NotificationChannel {
  readonly type: NotificationChannelType;
  send(userId: string, payload: NotificationPayload): Promise<ChannelDeliveryResult>;
}

export interface QuietHours {
  /** Hora local de inicio (0-23). */
  readonly startHour: number;
  /** Hora local de fin (0-23), exclusiva. Puede cruzar medianoche. */
  readonly endHour: number;
  /** Offset de la zona horaria del usuario respecto de UTC, en minutos. */
  readonly timezoneOffsetMinutes: number;
}

export interface UserNotificationPreferences {
  readonly userId: string;
  readonly enabledChannels: readonly NotificationChannelType[];
  /** Prioridad minima que dispara una alerta. */
  readonly minPriority: EmailPriority;
  readonly quietHours?: QuietHours;
}

export interface PreferencesProvider {
  getForUser(userId: string): Promise<UserNotificationPreferences | null>;
}

/** Evita reenviar la misma alerta (idempotencia ante reintentos del webhook). */
export interface NotificationDedupeStore {
  wasNotified(key: string): Promise<boolean>;
  markNotified(key: string): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export type NotificationSkipReason =
  | 'not-high-priority'
  | 'below-min-priority'
  | 'no-preferences'
  | 'no-enabled-channels'
  | 'quiet-hours'
  | 'already-notified';

export interface NotificationDispatchResult {
  readonly emailId: string;
  readonly notified: boolean;
  readonly skippedReason?: NotificationSkipReason;
  readonly deliveries: readonly ChannelDeliveryResult[];
}
