/**
 * Tipos para la sincronización de correo vía Gmail API (E1-T2).
 *
 * Estos tipos idealmente viven/re-exportan desde `src/shared/types/index.ts`.
 * Se definen aquí de forma auto-contenida para mantener la feature funcional
 * mientras el módulo compartido no exista. Cuando exista, reemplazar
 * `NormalizedEmail`/`EmailAddress` por los tipos compartidos.
 */

/** Credenciales OAuth2 ya obtenidas en el flujo de onboarding (E1-T1). */
export interface GmailOAuthCredentials {
  readonly accessToken: string;
  /** Refresh token para renovar el access token expirado. */
  readonly refreshToken: string;
  /** Epoch en ms en que expira el access token, si se conoce. */
  readonly expiryDate?: number;
  readonly clientId: string;
  readonly clientSecret: string;
}

/** Dirección de correo normalizada. */
export interface EmailAddress {
  readonly name: string | null;
  readonly email: string;
}

/** Email normalizado, agnóstico del proveedor. */
export interface NormalizedEmail {
  /** Id del mensaje en Gmail. */
  readonly id: string;
  /** Id del hilo (thread) al que pertenece. */
  readonly threadId: string;
  readonly from: EmailAddress | null;
  readonly to: readonly EmailAddress[];
  readonly cc: readonly EmailAddress[];
  readonly subject: string;
  /** Snippet corto provisto por Gmail. */
  readonly snippet: string;
  /** Cuerpo en texto plano (extraído del payload MIME). */
  readonly bodyText: string;
  /** Fecha de recepción (epoch ms). */
  readonly receivedAt: number;
  readonly labelIds: readonly string[];
  readonly isUnread: boolean;
}

/** Cursor de sincronización incremental persistido por usuario. */
export interface SyncState {
  /**
   * `historyId` de Gmail que marca el último punto sincronizado.
   * Si es `null`, se debe hacer un full-sync inicial.
   */
  readonly historyId: string | null;
}

/** Resultado de una operación de sincronización. */
export interface SyncResult {
  /** Emails nuevos o modificados detectados en esta corrida. */
  readonly upserted: readonly NormalizedEmail[];
  /** Ids de mensajes eliminados/movidos fuera de la bandeja. */
  readonly deletedIds: readonly string[];
  /** Nuevo cursor a persistir para la próxima corrida. */
  readonly nextState: SyncState;
  /** `true` si se ejecutó un full-sync (cursor ausente o inválido). */
  readonly fullSync: boolean;
}

/** Puerto de persistencia para el cursor de sincronización. */
export interface SyncStateStore {
  load(userId: string): Promise<SyncState | null>;
  save(userId: string, state: SyncState): Promise<void>;
}

/** Puerto de persistencia para los emails sincronizados. */
export interface EmailStore {
  upsertMany(userId: string, emails: readonly NormalizedEmail[]): Promise<void>;
  deleteMany(userId: string, messageIds: readonly string[]): Promise<void>;
}

/** Opciones de la sincronización. */
export interface GmailSyncOptions {
  /** Máximo de mensajes a traer en un full-sync. Default: 200. */
  readonly maxFullSyncMessages?: number;
  /** Query de Gmail para acotar el full-sync. Default: 'in:inbox'. */
  readonly query?: string;
}
