// Tipos del dominio para la vista de detalle de email priorizado y sus acciones rápidas.
// Nota: src/shared/types/index.ts aún no existe en el repositorio; estos tipos se declaran
// localmente en la feature y pueden promoverse a shared cuando se consoliden.

/** Nivel de prioridad calculado por la IA de priorización. */
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

/** Categoría de negocio que la IA asigna al email. */
export type EmailCategory =
  | 'hot_lead'
  | 'opportunity'
  | 'customer_issue'
  | 'negotiation'
  | 'follow_up'
  | 'noise';

/** Estado de gestión del email dentro de la bandeja priorizada. */
export type EmailStatus = 'unread' | 'read' | 'archived' | 'snoozed' | 'done';

/** Participante de un email (remitente o destinatario). */
export interface EmailParticipant {
  readonly name: string;
  readonly email: string;
}

/** Adjunto asociado a un email. */
export interface EmailAttachment {
  readonly id: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

/** Explicación estructurada de por qué la IA priorizó el email. */
export interface PriorityInsight {
  readonly level: PriorityLevel;
  readonly category: EmailCategory;
  /** Score 0..100 devuelto por el motor de priorización. */
  readonly score: number;
  /** Motivos legibles que justifican la prioridad, ordenados por relevancia. */
  readonly reasons: readonly string[];
}

/** Representación completa de un email para la vista de detalle. */
export interface EmailDetail {
  readonly id: string;
  readonly threadId: string;
  readonly subject: string;
  readonly from: EmailParticipant;
  readonly to: readonly EmailParticipant[];
  readonly cc: readonly EmailParticipant[];
  /** Cuerpo en texto plano ya saneado para render seguro. */
  readonly body: string;
  /** Fecha de recepción en ISO-8601. */
  readonly receivedAt: string;
  readonly attachments: readonly EmailAttachment[];
  readonly insight: PriorityInsight;
  readonly status: EmailStatus;
}

/** Identificador de cada acción rápida disponible en el detalle. */
export type QuickActionType =
  | 'reply'
  | 'archive'
  | 'snooze'
  | 'mark_done'
  | 'mark_important'
  | 'convert_to_lead';

/** Parámetros opcionales que acompañan a una acción rápida. */
export interface QuickActionParams {
  /** Texto de respuesta, requerido para la acción `reply`. */
  readonly replyBody?: string;
  /** Momento (ISO-8601) hasta el que posponer, requerido para `snooze`. */
  readonly snoozeUntil?: string;
}

/** Solicitud de ejecución de una acción rápida sobre un email. */
export interface QuickActionRequest {
  readonly emailId: string;
  readonly type: QuickActionType;
  readonly params?: QuickActionParams;
}

/** Resultado de ejecutar una acción rápida. */
export interface QuickActionResult {
  readonly type: QuickActionType;
  readonly emailId: string;
  /** Estado del email después de aplicar la acción. */
  readonly newStatus: EmailStatus;
  /** Mensaje legible para feedback en la UI. */
  readonly message: string;
}

/** Metadatos de una acción rápida para renderizar botones en la UI. */
export interface QuickActionDescriptor {
  readonly type: QuickActionType;
  readonly label: string;
  /** Nombre lógico de ícono (desacoplado de la librería de íconos). */
  readonly icon: string;
  /** Si true, la acción requiere input adicional antes de ejecutarse. */
  readonly requiresInput: boolean;
}

/** Error de dominio de la feature de detalle de email. */
export class EmailDetailError extends Error {
  constructor(
    message: string,
    readonly code: 'NOT_FOUND' | 'INVALID_ACTION' | 'MISSING_PARAM',
  ) {
    super(message);
    this.name = 'EmailDetailError';
  }
}

/** Puerto de persistencia que la feature necesita del resto del sistema. */
export interface EmailRepository {
  findById(emailId: string): Promise<EmailDetail | null>;
  updateStatus(emailId: string, status: EmailStatus): Promise<void>;
  updatePriorityLevel(emailId: string, level: PriorityLevel): Promise<void>;
}

/** Puerto para disparar el envío de una respuesta de email. */
export interface ReplySender {
  sendReply(emailId: string, body: string): Promise<void>;
}

/** Puerto para crear un lead a partir de un email (integración CRM). */
export interface LeadCreator {
  createLeadFromEmail(email: EmailDetail): Promise<{ readonly leadId: string }>;
}
