// Tipos del dominio de Cobro y Suscripción (E4-T1).
// Se definen localmente porque src/shared/types/index.ts aún no expone tipos de billing.
// Cuando shared exponga estos tipos, reemplazar por re-exports.

/** Identificadores de planes soportados por el cliente de email con priorización IA. */
export type PlanId = 'free' | 'pro' | 'team';

/** Ciclo de facturación de un precio de Stripe. */
export type BillingInterval = 'month' | 'year';

/**
 * Estado de una suscripción, alineado con los estados de Stripe.
 * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

/** Definición estática de un plan comercializable. */
export interface PlanDefinition {
  readonly id: PlanId;
  readonly name: string;
  /** Price ID de Stripe (price_...) para el ciclo mensual. */
  readonly stripePriceId: string;
  readonly interval: BillingInterval;
  /** Días de trial gratuito. 0 = sin trial. */
  readonly trialDays: number;
  /** Precio en la unidad mínima de la moneda (centavos). Solo informativo/UI. */
  readonly amount: number;
  readonly currency: string;
}

/** Vista normalizada de una suscripción para consumo interno de la app. */
export interface SubscriptionSnapshot {
  readonly subscriptionId: string;
  readonly customerId: string;
  readonly planId: PlanId | null;
  readonly status: SubscriptionStatus;
  readonly currentPeriodEnd: Date;
  readonly trialEnd: Date | null;
  readonly cancelAtPeriodEnd: boolean;
}

/** Parámetros para iniciar un checkout con trial. */
export interface CreateCheckoutParams {
  readonly planId: PlanId;
  /** Customer de Stripe ya existente; si no se pasa, Stripe crea/asocia por email. */
  readonly customerId?: string;
  /** Email del usuario, usado cuando no hay customerId. */
  readonly customerEmail?: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  /** Metadata propia (ej. userId interno) que viajará a la suscripción. */
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Resultado de la creación de un checkout. */
export interface CheckoutSessionResult {
  readonly sessionId: string;
  readonly url: string;
}

/** Configuración necesaria para instanciar el servicio de billing. */
export interface StripeServiceConfig {
  readonly apiKey: string;
  readonly webhookSecret: string;
  readonly plans: readonly PlanDefinition[];
}

/** Eventos de suscripción que la app procesa internamente. */
export type SubscriptionEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'trial.will_end'
  | 'payment.failed';

/** Evento de dominio emitido tras procesar un webhook de Stripe. */
export interface SubscriptionDomainEvent {
  readonly type: SubscriptionEventType;
  readonly snapshot: SubscriptionSnapshot;
  /** Id del usuario interno, extraído de metadata si está presente. */
  readonly userId: string | null;
}
