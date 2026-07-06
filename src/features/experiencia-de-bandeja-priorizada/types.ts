// Tipos de dominio para la Vista de Bandeja Priorizada (E3-T1).
//
// NOTA: Estos tipos deberían vivir idealmente en `src/shared/types/index.ts`
// y reexportarse. Mientras ese módulo compartido no exista, se declaran aquí
// de forma local para mantener la feature autocontenida y con tipado estricto.

/** Nivel de prioridad asignado por la IA a un email. */
export type PriorityLevel = 'critica' | 'alta' | 'media' | 'baja';

/** Categoría de negocio detectada por la IA. */
export type EmailCategory =
  | 'lead'
  | 'cliente'
  | 'oportunidad'
  | 'soporte'
  | 'ruido'
  | 'otro';

/** Contacto (remitente o destinatario) de un email. */
export interface EmailContact {
  readonly name: string;
  readonly email: string;
}

/**
 * Email ya enriquecido por el motor de priorización con IA.
 * `priorityScore` y `urgencyScore` están normalizados en el rango [0, 100].
 */
export interface PrioritizedEmail {
  readonly id: string;
  readonly subject: string;
  readonly from: EmailContact;
  readonly snippet: string;
  /** Fecha de recepción en formato ISO 8601. */
  readonly receivedAt: string;
  readonly priority: PriorityLevel;
  readonly priorityScore: number;
  readonly urgencyScore: number;
  readonly category: EmailCategory;
  readonly isRead: boolean;
  readonly labels: readonly string[];
}

/** Opciones para construir la vista de bandeja priorizada. */
export interface PriorityInboxOptions {
  /**
   * Niveles considerados de "alta prioridad" y por tanto visibles en esta
   * pantalla separada del inbox normal. Por defecto: 'critica' y 'alta'.
   */
  readonly includeLevels?: readonly PriorityLevel[];
  /**
   * Umbral mínimo de `priorityScore` (0-100) para incluir un email, aplicado
   * de forma adicional al filtro por nivel. Por defecto: 0 (sin umbral extra).
   */
  readonly minPriorityScore?: number;
  /** Si es `true`, oculta los emails ya leídos. Por defecto: `false`. */
  readonly onlyUnread?: boolean;
}

/** Resumen agregado de la bandeja priorizada. */
export interface PriorityInboxSummary {
  readonly total: number;
  readonly unread: number;
  readonly byLevel: Readonly<Record<PriorityLevel, number>>;
  readonly byCategory: Readonly<Record<EmailCategory, number>>;
}

/** Resultado listo para renderizar en la pantalla de bandeja priorizada. */
export interface PriorityInboxView {
  /** Emails de alta prioridad ordenados por urgencia (más urgente primero). */
  readonly emails: readonly PrioritizedEmail[];
  readonly summary: PriorityInboxSummary;
}
