/**
 * Tipos del Motor de Clasificación IA.
 *
 * En el monorepo, varios de estos contratos viven en
 * `src/shared/types/index.ts`. Aquí se declaran de forma local (y se
 * re-exportan) para que la feature sea autocontenida y tipada mientras
 * ese barrel compartido se consolida.
 */

/** Identificador único de un email dentro del sistema. */
export type EmailId = string;

/** Niveles de prioridad que el motor de IA puede asignar a un email. */
export enum EmailPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low',
  Noise = 'noise',
}

/** Email crudo tal como llega desde la sincronización con el proveedor. */
export interface RawEmail {
  readonly id: EmailId;
  readonly accountId: string;
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly body: string;
  /** Marca temporal de recepción en ISO 8601. */
  readonly receivedAt: string;
}

/** Resultado de la clasificación IA de un email. */
export interface ClassificationResult {
  readonly priority: EmailPriority;
  /** Confianza del modelo en el rango 0..1. */
  readonly confidence: number;
  /** Razones legibles que justifican la prioridad asignada. */
  readonly reasons: readonly string[];
  /** Etiquetas semánticas (p. ej. "lead", "queja", "newsletter"). */
  readonly labels: readonly string[];
  /** Marca temporal de clasificación en ISO 8601. */
  readonly classifiedAt: string;
}

/** Email junto a su resultado de clasificación. */
export interface ClassifiedEmail {
  readonly email: RawEmail;
  readonly classification: ClassificationResult;
}

/**
 * Contrato del clasificador. La implementación concreta (prompt + llamada
 * al modelo de Claude) vive en otra task; el pipeline sólo depende de esta
 * interfaz, lo que permite testear con dobles y desacoplar el motor de IA.
 */
export interface EmailClassifier {
  classify(email: RawEmail, signal?: AbortSignal): Promise<ClassificationResult>;
}
