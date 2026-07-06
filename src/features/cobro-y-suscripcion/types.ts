/**
 * Tipos del dominio de Cobro y Suscripción (Épica E4).
 *
 * Nota: `src/shared/types/index.ts` aún no existe en este scaffold. Cuando se
 * cree, los tipos genéricos (p. ej. `UserId`, `ISODateString`) deberían moverse
 * allí y reexportarse desde aquí. Se definen localmente para no bloquear la task.
 */

/** Identificador único de usuario. */
export type UserId = string;

/** Fecha en formato ISO-8601 (ej: "2026-07-06T12:00:00.000Z"). */
export type ISODateString = string;

/**
 * Estado del ciclo de vida de la suscripción de un usuario.
 * - `trialing`: dentro del período de prueba, sin pago confirmado.
 * - `active`: suscripción pagada y vigente.
 * - `past_due`: hubo un pago fallido; acceso en gracia hasta `graceEndsAt`.
 * - `canceled`: cancelada por el usuario; acceso hasta fin del período pagado.
 * - `expired`: trial vencido sin pago, o suscripción terminada. Sin acceso.
 */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired';

/** Nivel de plan contratado. */
export type PlanTier = 'free' | 'pro' | 'business';

/**
 * Snapshot persistido de la suscripción de un usuario.
 * Refleja el último estado conocido según el proveedor de pagos.
 */
export interface Subscription {
  readonly userId: UserId;
  readonly status: SubscriptionStatus;
  readonly plan: PlanTier;
  /** Fin del período de prueba. `null` si el usuario nunca tuvo trial. */
  readonly trialEndsAt: ISODateString | null;
  /** Fin del período pagado actual. `null` si nunca pagó. */
  readonly currentPeriodEndsAt: ISODateString | null;
  /** Fin del período de gracia tras un pago fallido. `null` si no aplica. */
  readonly graceEndsAt: ISODateString | null;
  /** `true` si existe al menos un pago confirmado en el historial. */
  readonly hasEverPaid: boolean;
}

/** Razón por la que el acceso puede estar restringido. */
export type AccessDenialReason =
  | 'trial_expired'
  | 'payment_past_due'
  | 'subscription_expired'
  | 'subscription_canceled';

/**
 * Resultado de evaluar el acceso de un usuario en un instante dado.
 * Discriminated union por el campo `allowed` para uso ergonómico en la UI.
 */
export type AccessDecision =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason: AccessDenialReason;
      /** Mensaje listo para mostrar al usuario. */
      readonly message: string;
    };

/**
 * Vista de estado pensada para renderizar en la app (banner/badge de cuenta).
 */
export interface SubscriptionStatusView {
  readonly status: SubscriptionStatus;
  readonly plan: PlanTier;
  readonly hasAccess: boolean;
  /** Días restantes de trial (>= 0), o `null` si no está en trial. */
  readonly trialDaysRemaining: number | null;
  /** `true` cuando conviene mostrar un CTA de pago/upgrade. */
  readonly showUpgradeCta: boolean;
  /** Texto corto descriptivo del estado, listo para UI. */
  readonly label: string;
}
