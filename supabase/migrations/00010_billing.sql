-- ============================================================================
-- MODULA HEALTH — Migration 010: SaaS Billing — Plans, Module Entitlements
-- ============================================================================

-- SAAS PLANS (platform subscription plans)
CREATE TABLE public.saas_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    slug varchar(50) NOT NULL UNIQUE,
    tier saas_plan_tier NOT NULL,
    description text,

    -- Pricing
    price_monthly_cents bigint NOT NULL,
    price_annual_cents bigint,                        -- annual discount
    currency varchar(3) NOT NULL DEFAULT 'BRL',

    -- Limits
    max_users integer,                                -- NULL = unlimited
    max_clients integer,
    max_units integer DEFAULT 1,
    max_storage_gb integer DEFAULT 5,
    ai_tokens_monthly integer DEFAULT 0,

    -- Included modules
    included_modules text[] NOT NULL DEFAULT '{}',   -- module codes included in this plan

    -- Stripe integration
    stripe_product_id varchar(100),
    stripe_price_monthly_id varchar(100),
    stripe_price_annual_id varchar(100),

    is_active boolean NOT NULL DEFAULT true,
    is_public boolean NOT NULL DEFAULT true,          -- visible in pricing page
    sort_order integer DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER saas_plans_updated_at
    BEFORE UPDATE ON public.saas_plans
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- MODULE CATALOG (all available modules)
CREATE TABLE public.module_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE,                 -- 'ef.training', 'mod.crm', 'ai.copilot.ef'
    name varchar(100) NOT NULL,
    description text,
    category varchar(50) NOT NULL,                    -- 'core', 'shared', 'ef', 'physio', 'nutri', 'multi', 'ai'
    is_core boolean NOT NULL DEFAULT false,            -- core modules always active
    price_monthly_cents bigint DEFAULT 0,             -- addon price if not in plan
    trial_days integer DEFAULT 14,
    icon varchar(50),
    sort_order integer DEFAULT 0,
    dependencies text[] DEFAULT '{}',                 -- ['core.clients', 'core.records']
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_module_catalog_category ON public.module_catalog(category);
CREATE INDEX idx_module_catalog_core ON public.module_catalog(is_core) WHERE is_core = true;

-- SAAS SUBSCRIPTIONS (tenant's active SaaS subscription)
CREATE TABLE public.saas_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES public.saas_plans(id),
    status subscription_status NOT NULL DEFAULT 'active',
    billing_cycle varchar(20) NOT NULL DEFAULT 'monthly',  -- monthly, annual

    current_period_start timestamptz NOT NULL,
    current_period_end timestamptz NOT NULL,
    trial_start timestamptz,
    trial_end timestamptz,
    cancelled_at timestamptz,
    cancel_at_period_end boolean DEFAULT false,

    -- Stripe integration
    stripe_subscription_id varchar(100),
    stripe_customer_id varchar(100),

    -- Usage tracking
    current_users integer DEFAULT 0,
    current_clients integer DEFAULT 0,
    current_storage_gb numeric(10,2) DEFAULT 0,
    current_ai_tokens integer DEFAULT 0,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER saas_subscriptions_updated_at
    BEFORE UPDATE ON public.saas_subscriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_saas_subs_tenant ON public.saas_subscriptions(tenant_id) WHERE status IN ('active', 'trial');
CREATE INDEX idx_saas_subs_plan ON public.saas_subscriptions(plan_id);

-- MODULE ENTITLEMENTS (which modules are active for each tenant)
CREATE TABLE public.module_entitlements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    module_code varchar(50) NOT NULL REFERENCES public.module_catalog(code),
    source varchar(20) NOT NULL DEFAULT 'plan',       -- 'plan', 'addon', 'trial', 'manual'
    is_active boolean NOT NULL DEFAULT true,
    trial_started_at timestamptz,
    trial_expires_at timestamptz,
    activated_at timestamptz NOT NULL DEFAULT now(),
    deactivated_at timestamptz,

    -- Addon billing
    addon_price_cents bigint DEFAULT 0,
    stripe_subscription_item_id varchar(100),

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER module_entitlements_updated_at
    BEFORE UPDATE ON public.module_entitlements
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_module_ent_unique ON public.module_entitlements(tenant_id, module_code);
CREATE INDEX idx_module_ent_tenant ON public.module_entitlements(tenant_id);
CREATE INDEX idx_module_ent_active ON public.module_entitlements(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_module_ent_trial ON public.module_entitlements(trial_expires_at) WHERE trial_expires_at IS NOT NULL AND is_active = true;

-- SAAS INVOICES (platform billing invoices)
CREATE TABLE public.saas_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id uuid NOT NULL REFERENCES public.saas_subscriptions(id),
    amount_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'BRL',
    status varchar(20) NOT NULL DEFAULT 'pending',   -- pending, paid, failed, refunded
    billing_period_start date NOT NULL,
    billing_period_end date NOT NULL,
    due_date date NOT NULL,
    paid_at timestamptz,

    stripe_invoice_id varchar(100),
    stripe_payment_intent_id varchar(100),
    invoice_url text,
    pdf_url text,

    line_items jsonb NOT NULL DEFAULT '[]',           -- [{description, amount, module_code}]
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER saas_invoices_updated_at
    BEFORE UPDATE ON public.saas_invoices
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_saas_invoices_tenant ON public.saas_invoices(tenant_id);
CREATE INDEX idx_saas_invoices_status ON public.saas_invoices(status, due_date);
