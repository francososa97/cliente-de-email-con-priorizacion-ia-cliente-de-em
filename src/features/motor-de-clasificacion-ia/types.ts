/**
 * Tipos del Motor de Clasificacion IA (E2-T1).
 *
 * Estos tipos serian ideal candidatos para promoverse a
 * `src/shared/types/index.ts`; se definen aqui de forma local porque ese
 * modulo compartido aun no existe en el repo. Si en el futuro se crea, basta
 * con re-exportar desde alli e importar desde `@shared/types`.
 */

/** Nivel de prioridad asignado a un email por el motor. */
export type PriorityLevel = 'high' | 'normal';

/** Representa una direccion de correo con nombre opcional. */
export interface EmailAddress {
  readonly name?: string;
  readonly email: string;
}

/** Email de entrada a clasificar. */
export interface Email {
  readonly id: string;
  readonly from: EmailAddress;
  readonly to: readonly EmailAddress[];
  readonly subject: string;
  /** Cuerpo en texto plano (sin HTML). */
  readonly body: string;
  /** Fecha de recepcion en formato ISO-8601. */
  readonly receivedAt: string;
}

/** Resultado de la clasificacion de un email. */
export interface PriorityClassification {
  readonly emailId: string;
  readonly priority: PriorityLevel;
  /** Razon breve (1 oracion) que justifica la prioridad. */
  readonly reason: string;
  /** Confianza del modelo entre 0 y 1. */
  readonly confidence: number;
  /** Fecha de clasificacion en formato ISO-8601. */
  readonly classifiedAt: string;
}

/** Configuracion del clasificador. */
export interface ClassifierConfig {
  /** API key de Anthropic. Por defecto toma `process.env.ANTHROPIC_API_KEY`. */
  readonly apiKey?: string;
  /** Modelo a usar. Por defecto Haiku 4.5 (rapido y economico). */
  readonly model?: string;
  /** Maximo de caracteres del cuerpo enviados al LLM. Por defecto 4000. */
  readonly maxBodyChars?: number;
  /** Reintentos ante errores transitorios de red/API. Por defecto 2. */
  readonly maxRetries?: number;
}

/** Error de dominio del motor de clasificacion. */
export class ClassificationError extends Error {
  public readonly emailId: string;

  constructor(emailId: string, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ClassificationError';
    this.emailId = emailId;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
