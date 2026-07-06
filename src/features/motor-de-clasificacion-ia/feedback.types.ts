/**
 * Tipos del sub-dominio "Feedback de clasificación" (E2-T3).
 *
 * Cuando exista `src/shared/types/index.ts`, `EmailPriority` e `EmailId`
 * deberían moverse allí y re-exportarse desde este módulo. Se declaran aquí
 * para mantener la feature autocontenida y compilar en TS strict.
 */

/** Identificador único de un email dentro del sistema. */
export type EmailId = string;

/** Identificador único de un registro de feedback. */
export type FeedbackId = string;

/**
 * Nivel de prioridad que asigna el motor de clasificación IA.
 * Ordenado de mayor a menor urgencia comercial.
 */
export type EmailPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'noise';

/** Todas las prioridades posibles, en orden de urgencia descendente. */
export const EMAIL_PRIORITIES: readonly EmailPriority[] = [
  'critical',
  'high',
  'medium',
  'low',
  'noise',
] as const;

/**
 * Veredicto del usuario sobre la predicción de la IA.
 * - `confirmed`: la prioridad predicha era correcta.
 * - `rejected`: la prioridad predicha era incorrecta; el usuario indica cuál
 *   era la correcta mediante `correctedPriority`.
 */
export type FeedbackVerdict = 'confirmed' | 'rejected';

/**
 * Datos que el cliente envía para registrar feedback sobre una predicción.
 * `correctedPriority` es obligatorio (a nivel de validación) cuando
 * `verdict === 'rejected'`.
 */
export interface SubmitFeedbackInput {
  readonly emailId: EmailId;
  /** Prioridad que la IA asignó al email. */
  readonly predictedPriority: EmailPriority;
  readonly verdict: FeedbackVerdict;
  /** Prioridad correcta según el usuario. Requerido si `verdict` es `rejected`. */
  readonly correctedPriority?: EmailPriority;
  /** Usuario que emite el feedback (para auditoría / métricas por usuario). */
  readonly userId?: string;
}

/** Registro persistido de un feedback de clasificación. */
export interface ClassificationFeedback {
  readonly id: FeedbackId;
  readonly emailId: EmailId;
  readonly predictedPriority: EmailPriority;
  readonly verdict: FeedbackVerdict;
  /**
   * Prioridad correcta. Igual a `predictedPriority` cuando el veredicto es
   * `confirmed`; la prioridad indicada por el usuario cuando es `rejected`.
   */
  readonly actualPriority: EmailPriority;
  readonly userId?: string;
  readonly createdAt: Date;
}

/** Métricas de precisión por cada nivel de prioridad predicho. */
export interface PerPriorityAccuracy {
  readonly priority: EmailPriority;
  readonly total: number;
  readonly confirmed: number;
  readonly rejected: number;
  /** confirmed / total, en el rango [0, 1]. `null` si `total === 0`. */
  readonly precision: number | null;
}

/** Resumen agregado de la precisión del motor a partir del feedback. */
export interface AccuracyReport {
  /** Cantidad total de feedbacks considerados. */
  readonly totalFeedback: number;
  readonly confirmed: number;
  readonly rejected: number;
  /** Precisión global: confirmed / totalFeedback. `null` si no hay datos. */
  readonly overallPrecision: number | null;
  /** Desglose de precisión por prioridad predicha. */
  readonly byPredictedPriority: readonly PerPriorityAccuracy[];
}

/**
 * Puerto de persistencia para feedbacks. Se define como interfaz para permitir
 * intercambiar la implementación en memoria por una basada en DB sin tocar el
 * servicio (regla de inversión de dependencias de ARCHITECTURE.md).
 */
export interface FeedbackStore {
  save(feedback: ClassificationFeedback): Promise<ClassificationFeedback>;
  findByEmailId(emailId: EmailId): Promise<ClassificationFeedback | null>;
  list(): Promise<readonly ClassificationFeedback[]>;
}
