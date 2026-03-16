-- ============================================================================
-- MODULA HEALTH — Migration 007: Financial — Payments, Subscriptions, Invoices
-- ============================================================================

-- CLIENT PLANS/PACKAGES (what the client purchased)
CREATE TABLE public.client_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    professional_id uuid REFERENCES public.user_profiles(id),
    name varchar(200) NOT NULL,
    description text,
    type varchar(50) NOT NULL DEFAULT 'recurring',   -- recurring, package, single
    status subscription_status NOT NULL DEFAULT 'active',

    -- Pricing
    price_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'BRL',
    billing_cycle varchar(20) DEFAULT 'monthly',      -- weekly, biweekly, monthly, quarterly, semiannual, annual
    installments integer DEFAULT 1,

    -- Package-specific (e.g., 12 sessions)
    total_sessions integer,
    used_sessions integer DEFAULT 0,
    sessions_per_week integer,

    -- Dates
    starts_at date NOT NULL,
    ends_at date,
    next_billing_at date,
    cancelled_at timestamptz,
    cancellation_reason text,

    -- External payment provider
    stripe_subscription_id varchar(100),
    asaas_subscription_id varchar(100),

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES public.user_profiles(id)
);

CREATE TRIGGER client_subscriptions_updated_at
    BEFORE UPDATE ON public.client_subscriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_client_subs_tenant ON public.client_subscriptions(tenant_id);
CREATE INDEX idx_client_subs_client ON public.client_subscriptions(tenant_id, client_id);
CREATE INDEX idx_client_subs_status ON public.client_subscriptions(tenant_id, status);
CREATE INDEX idx_client_subs_billing ON public.client_subscriptions(next_billing_at) WHERE status = 'active';

-- PAYMENTS (individual payment records)
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    subscription_id uuid REFERENCES public.client_subscriptions(id),
    status payment_status NOT NULL DEFAULT 'pending',
    method payment_method,

    -- Amounts
    amount_cents bigint NOT NULL,
    discount_cents bigint DEFAULT 0,
    fee_cents bigint DEFAULT 0,
    net_amount_cents bigint,                         -- amount - discount - fee
    currency varchar(3) NOT NULL DEFAULT 'BRL',

    description varchar(300),
    reference_month date,                             -- billing period

    -- Dates
    due_date date NOT NULL,
    paid_at timestamptz,
    cancelled_at timestamptz,

    -- External provider
    stripe_payment_intent_id varchar(100),
    asaas_payment_id varchar(100),
    pix_qr_code text,
    pix_copy_paste text,
    bank_slip_url text,
    receipt_url text,

    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES public.user_profiles(id)
);

CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX idx_payments_client ON public.payments(tenant_id, client_id);
CREATE INDEX idx_payments_status ON public.payments(tenant_id, status);
CREATE INDEX idx_payments_due ON public.payments(due_date) WHERE status = 'pending';
CREATE INDEX idx_payments_overdue ON public.payments(due_date) WHERE status = 'overdue';
CREATE INDEX idx_payments_month ON public.payments(tenant_id, reference_month);

-- INVOICES (NF-e / receipts)
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payment_id uuid REFERENCES public.payments(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    invoice_number varchar(50),
    status varchar(20) NOT NULL DEFAULT 'draft',     -- draft, issued, cancelled
    amount_cents bigint NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'BRL',
    description text,

    -- NF-e integration
    nfe_id varchar(100),
    nfe_number varchar(50),
    nfe_url text,
    nfe_pdf_url text,

    issued_at timestamptz,
    cancelled_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_client ON public.invoices(tenant_id, client_id);

-- COMMISSIONS (professional commissions / payroll splits)
CREATE TABLE public.commissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    professional_id uuid NOT NULL REFERENCES public.user_profiles(id),
    payment_id uuid REFERENCES public.payments(id),
    session_id uuid REFERENCES public.sessions(id),
    type varchar(30) NOT NULL DEFAULT 'session',     -- session, package, bonus
    amount_cents bigint NOT NULL,
    percentage numeric(5,2),
    status varchar(20) NOT NULL DEFAULT 'pending',   -- pending, approved, paid, cancelled
    reference_month date,
    paid_at timestamptz,
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER commissions_updated_at
    BEFORE UPDATE ON public.commissions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_commissions_tenant ON public.commissions(tenant_id);
CREATE INDEX idx_commissions_prof ON public.commissions(tenant_id, professional_id, reference_month);
CREATE INDEX idx_commissions_status ON public.commissions(tenant_id, status);

-- DISCOUNTS / COUPONS
CREATE TABLE public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code varchar(50) NOT NULL,
    description text,
    discount_type varchar(20) NOT NULL DEFAULT 'percentage', -- percentage, fixed
    discount_value numeric(10,2) NOT NULL,
    max_uses integer,
    used_count integer DEFAULT 0,
    min_amount_cents bigint,
    valid_from timestamptz,
    valid_until timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_coupons_code ON public.coupons(tenant_id, code);
CREATE INDEX idx_coupons_tenant ON public.coupons(tenant_id);
