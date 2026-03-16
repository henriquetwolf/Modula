-- ============================================================================
-- MODULA HEALTH — Migration 004: Client Profiles, Contacts, Links
-- ============================================================================

-- CLIENT PROFILES (central unified record — "ficha 360")
CREATE TABLE public.client_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    auth_user_id uuid REFERENCES auth.users(id),           -- NULL if client has no portal login
    full_name varchar(200) NOT NULL,
    preferred_name varchar(100),
    email varchar(255),
    phone varchar(20),
    secondary_phone varchar(20),
    cpf varchar(14),
    rg varchar(20),
    date_of_birth date,
    gender gender_type,
    avatar_url text,
    status client_status NOT NULL DEFAULT 'active',
    source varchar(50),                                     -- 'manual', 'crm', 'portal', 'import'

    -- Address
    address jsonb DEFAULT '{
        "street": null,
        "number": null,
        "complement": null,
        "neighborhood": null,
        "city": null,
        "state": null,
        "zip_code": null
    }',

    -- Medical / Health baseline
    health_info jsonb NOT NULL DEFAULT '{
        "blood_type": null,
        "allergies": [],
        "medications": [],
        "conditions": [],
        "injuries_history": [],
        "surgical_history": [],
        "family_history": [],
        "smoker": false,
        "alcohol": null,
        "physical_activity_level": null,
        "sleep_hours_avg": null,
        "occupation": null,
        "objectives": [],
        "observations": null
    }',

    -- Emergency contact
    emergency_contact jsonb DEFAULT '{
        "name": null,
        "phone": null,
        "relationship": null
    }',

    -- Responsible (for minors)
    responsible jsonb DEFAULT '{
        "name": null,
        "cpf": null,
        "phone": null,
        "relationship": null
    }',

    tags text[] DEFAULT '{}',
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES public.user_profiles(id)
);

CREATE TRIGGER client_profiles_updated_at
    BEFORE UPDATE ON public.client_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_clients_tenant ON public.client_profiles(tenant_id);
CREATE INDEX idx_clients_status ON public.client_profiles(tenant_id, status);
CREATE INDEX idx_clients_email ON public.client_profiles(tenant_id, email);
CREATE INDEX idx_clients_name ON public.client_profiles(tenant_id, full_name);
CREATE INDEX idx_clients_phone ON public.client_profiles(tenant_id, phone);
CREATE UNIQUE INDEX idx_clients_cpf_tenant ON public.client_profiles(tenant_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_clients_tags ON public.client_profiles USING GIN(tags);
CREATE INDEX idx_clients_name_trgm ON public.client_profiles USING GIN(full_name gin_trgm_ops);

-- CLIENT ↔ PROFESSIONAL LINK (binding for access control)
CREATE TABLE public.client_professional_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    professional_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    profession profession_type NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,       -- primary professional for this area
    status varchar(20) NOT NULL DEFAULT 'active',    -- active, paused, ended
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER client_prof_links_updated_at
    BEFORE UPDATE ON public.client_professional_links
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_client_prof_link_unique ON public.client_professional_links(client_id, professional_id, unit_id);
CREATE INDEX idx_client_prof_link_client ON public.client_professional_links(client_id);
CREATE INDEX idx_client_prof_link_prof ON public.client_professional_links(professional_id);
CREATE INDEX idx_client_prof_link_tenant ON public.client_professional_links(tenant_id);

-- CLIENT ↔ UNIT association (which units the client is registered at)
CREATE TABLE public.client_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    is_active boolean NOT NULL DEFAULT true,
    registered_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_client_units_unique ON public.client_units(client_id, unit_id);
CREATE INDEX idx_client_units_tenant ON public.client_units(tenant_id);
CREATE INDEX idx_client_units_unit ON public.client_units(unit_id);
