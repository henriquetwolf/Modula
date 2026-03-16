-- ============================================================================
-- MODULA HEALTH — Migration 003: Users, Roles, Permissions, Memberships
-- ============================================================================

-- USER PROFILES (extends auth.users from Supabase Auth)
CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name varchar(200) NOT NULL,
    display_name varchar(100),
    email varchar(255) NOT NULL,
    phone varchar(20),
    avatar_url text,
    date_of_birth date,
    gender gender_type,
    cpf varchar(14),
    status user_status NOT NULL DEFAULT 'active',
    settings jsonb NOT NULL DEFAULT '{
        "theme": "light",
        "language": "pt-BR",
        "notifications_enabled": true,
        "email_notifications": true,
        "whatsapp_notifications": true
    }',
    last_login_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_user_profiles_tenant ON public.user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_auth ON public.user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(tenant_id, status);

-- PROFESSIONAL PROFILES (1:1 with user_profile if user is a professional)
CREATE TABLE public.professional_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profession profession_type NOT NULL,
    registration_number varchar(50) NOT NULL,     -- CREF, CREFITO, CRN
    registration_state varchar(2),                -- UF
    specialties text[] DEFAULT '{}',
    bio text,
    education jsonb DEFAULT '[]',                 -- [{degree, institution, year}]
    certifications jsonb DEFAULT '[]',            -- [{name, issuer, year, url}]
    working_since date,
    consultation_duration_minutes integer DEFAULT 60,
    online_booking_enabled boolean DEFAULT true,
    accepts_new_clients boolean DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER professional_profiles_updated_at
    BEFORE UPDATE ON public.professional_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_professional_profiles_tenant ON public.professional_profiles(tenant_id);
CREATE INDEX idx_professional_profiles_profession ON public.professional_profiles(tenant_id, profession);

-- ROLES (system + tenant-custom)
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = system role
    name varchar(50) NOT NULL,
    display_name varchar(100) NOT NULL,
    description text,
    is_system boolean NOT NULL DEFAULT false,
    is_default boolean NOT NULL DEFAULT false,
    hierarchy_level integer NOT NULL DEFAULT 0,  -- higher = more power
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_roles_system_name ON public.roles(name) WHERE is_system = true;
CREATE INDEX idx_roles_tenant ON public.roles(tenant_id);

-- ROLE PERMISSIONS (granular action-level permissions)
CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module_code varchar(50) NOT NULL,       -- 'ef.training', 'mod.crm', 'core.clients'
    resource varchar(50) NOT NULL,           -- 'training_plans', 'leads', 'client_profiles'
    actions text[] NOT NULL DEFAULT '{}',   -- '{create,read,update,delete,export,share}'
    conditions jsonb DEFAULT '{}',           -- ABAC: {"own_clients_only": true}
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_module ON public.role_permissions(module_code);
CREATE UNIQUE INDEX idx_role_permissions_unique ON public.role_permissions(role_id, module_code, resource);

-- USER ROLES (user ↔ role assignment, optionally scoped to unit)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,  -- NULL = tenant-wide
    granted_by uuid REFERENCES public.user_profiles(id),
    granted_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz,
    is_active boolean NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX idx_user_roles_unique ON public.user_roles(user_id, role_id, COALESCE(unit_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_tenant ON public.user_roles(tenant_id);

-- UNIT MEMBERSHIPS (user belongs to unit with profession context)
CREATE TABLE public.unit_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role varchar(50) NOT NULL DEFAULT 'professional',
    profession profession_type,
    profession_registration varchar(50),     -- 'CREF 012345-G/SP'
    is_active boolean NOT NULL DEFAULT true,
    joined_at timestamptz NOT NULL DEFAULT now(),
    left_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER unit_memberships_updated_at
    BEFORE UPDATE ON public.unit_memberships
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_unit_memberships_unique ON public.unit_memberships(user_id, unit_id);
CREATE INDEX idx_unit_memberships_unit ON public.unit_memberships(unit_id);
CREATE INDEX idx_unit_memberships_tenant ON public.unit_memberships(tenant_id);

-- INVITATIONS (invite users to tenant/unit)
CREATE TABLE public.invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL,
    role_name varchar(50) NOT NULL,
    profession profession_type,
    invited_by uuid NOT NULL REFERENCES public.user_profiles(id),
    token varchar(100) NOT NULL UNIQUE,
    status varchar(20) NOT NULL DEFAULT 'pending',  -- pending, accepted, expired, cancelled
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_tenant ON public.invitations(tenant_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);

-- ============================================================================
-- Custom Access Token Hook (inject tenant_id into JWT)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    user_tenant_id uuid;
    user_profile_id uuid;
    user_roles_arr text[];
BEGIN
    SELECT up.tenant_id, up.id INTO user_tenant_id, user_profile_id
    FROM public.user_profiles up
    WHERE up.auth_user_id = (event->>'user_id')::uuid
    AND up.status = 'active'
    LIMIT 1;

    IF user_tenant_id IS NOT NULL THEN
        SELECT array_agg(DISTINCT r.name) INTO user_roles_arr
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = user_profile_id
        AND ur.is_active = true;

        event := jsonb_set(event, '{claims,tenant_id}', to_jsonb(user_tenant_id::text));
        event := jsonb_set(event, '{claims,profile_id}', to_jsonb(user_profile_id::text));
        event := jsonb_set(event, '{claims,roles}', to_jsonb(COALESCE(user_roles_arr, '{}'::text[])));
    END IF;

    RETURN event;
END;
$$;

-- ============================================================================
-- HELPER FUNCTIONS (depend on tables created above)
-- ============================================================================

-- Check if current user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    AND r.name = check_role
    AND ur.is_active = true
  );
$$;

-- Check if current user is a member of a unit
CREATE OR REPLACE FUNCTION public.user_in_unit(check_unit_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.unit_memberships um
    WHERE um.user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    AND um.unit_id = check_unit_id
    AND um.is_active = true
  );
$$;
