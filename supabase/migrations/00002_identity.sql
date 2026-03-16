-- ============================================================================
-- MODULA HEALTH — Migration 002: Identity & Access — Tenants, Companies, Units
-- ============================================================================

-- TENANTS (SaaS account — billing and isolation boundary)
CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    legal_name varchar(300),
    document varchar(20),                    -- CNPJ or CPF
    document_type varchar(4) DEFAULT 'cnpj', -- 'cnpj' | 'cpf'
    email varchar(255) NOT NULL,
    phone varchar(20),
    plan saas_plan_tier NOT NULL DEFAULT 'starter',
    status user_status NOT NULL DEFAULT 'active',
    branding jsonb NOT NULL DEFAULT '{
        "logo_url": null,
        "favicon_url": null,
        "primary_color": "#0D9488",
        "secondary_color": "#6366F1",
        "custom_domain": null
    }',
    settings jsonb NOT NULL DEFAULT '{
        "timezone": "America/Sao_Paulo",
        "locale": "pt-BR",
        "currency": "BRL",
        "date_format": "DD/MM/YYYY",
        "cancellation_policy_hours": 24,
        "allow_online_booking": true
    }',
    metadata jsonb NOT NULL DEFAULT '{}',
    trial_ends_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenants_plan ON public.tenants(plan);

-- COMPANIES (juridical entity within a tenant)
CREATE TABLE public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    legal_name varchar(300),
    cnpj varchar(18),
    state_registration varchar(30),
    email varchar(255),
    phone varchar(20),
    address jsonb DEFAULT '{}',
    is_primary boolean NOT NULL DEFAULT false,
    status user_status NOT NULL DEFAULT 'active',
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_companies_tenant ON public.companies(tenant_id);
CREATE UNIQUE INDEX idx_companies_cnpj ON public.companies(cnpj) WHERE cnpj IS NOT NULL;

-- UNITS (physical location / branch)
CREATE TABLE public.units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    slug varchar(100) NOT NULL,
    type varchar(50) NOT NULL DEFAULT 'clinic',  -- clinic, studio, gym, office, school
    email varchar(255),
    phone varchar(20),
    address jsonb DEFAULT '{
        "street": null,
        "number": null,
        "complement": null,
        "neighborhood": null,
        "city": null,
        "state": null,
        "zip_code": null,
        "country": "BR",
        "latitude": null,
        "longitude": null
    }',
    operating_hours jsonb DEFAULT '{}',
    settings jsonb NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_units_tenant ON public.units(tenant_id);
CREATE INDEX idx_units_company ON public.units(company_id);
CREATE UNIQUE INDEX idx_units_tenant_slug ON public.units(tenant_id, slug);
