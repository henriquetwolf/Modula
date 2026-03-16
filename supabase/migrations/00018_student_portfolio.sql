-- ============================================================================
-- MODULA HEALTH — Migration 018: Student Portfolio & Competencies
-- Portfolio items, sections, competency records, academic CV
-- ============================================================================

-- ============================================================================
-- PORTFOLIO ITEMS
-- ============================================================================

CREATE TYPE portfolio_item_type AS ENUM (
    'certificate', 'course', 'event', 'case_study', 'project',
    'presentation', 'internship', 'publication', 'award', 'other'
);

CREATE TABLE public.portfolio_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    item_type portfolio_item_type NOT NULL,
    title varchar(300) NOT NULL,
    description text,
    item_date date,
    institution varchar(200),

    attachments uuid[] NOT NULL DEFAULT '{}',
    tags text[] NOT NULL DEFAULT '{}',
    is_public boolean NOT NULL DEFAULT false,
    is_featured boolean NOT NULL DEFAULT false,

    -- Optional links to other entities
    source_type varchar(30),
    source_id uuid,

    metadata jsonb NOT NULL DEFAULT '{}',
    sort_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER portfolio_items_updated_at
    BEFORE UPDATE ON public.portfolio_items
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_portfolio_items_user ON public.portfolio_items(tenant_id, user_id);
CREATE INDEX idx_portfolio_items_type ON public.portfolio_items(user_id, item_type);
CREATE INDEX idx_portfolio_items_public ON public.portfolio_items(user_id)
    WHERE is_public = true;

-- ============================================================================
-- PORTFOLIO SECTIONS (user-organized sections)
-- ============================================================================

CREATE TABLE public.portfolio_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER portfolio_sections_updated_at
    BEFORE UPDATE ON public.portfolio_sections
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_portfolio_sections_user ON public.portfolio_sections(tenant_id, user_id, sort_order);

-- ============================================================================
-- PORTFOLIO SECTION ITEMS (M:N relationship)
-- ============================================================================

CREATE TABLE public.portfolio_section_items (
    section_id uuid NOT NULL REFERENCES public.portfolio_sections(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
    sort_order integer NOT NULL DEFAULT 0,

    PRIMARY KEY (section_id, item_id)
);

-- ============================================================================
-- COMPETENCY RECORDS (accumulated competency tracking)
-- ============================================================================

CREATE TABLE public.competency_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    competency_code varchar(50) NOT NULL,
    competency_name varchar(200) NOT NULL,
    level varchar(20) NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    score smallint CHECK (score >= 0 AND score <= 100),
    evidence_ids uuid[] NOT NULL DEFAULT '{}',
    source varchar(30) NOT NULL DEFAULT 'self' CHECK (source IN ('self', 'supervisor', 'quiz', 'case', 'ai')),

    last_updated timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_competency_records_unique ON public.competency_records(tenant_id, user_id, competency_code);

-- ============================================================================
-- ACADEMIC CV
-- ============================================================================

CREATE TABLE public.academic_cv (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    bio text,
    objective text,
    education jsonb NOT NULL DEFAULT '[]',
    experiences jsonb NOT NULL DEFAULT '[]',
    skills text[] NOT NULL DEFAULT '{}',
    languages jsonb NOT NULL DEFAULT '[]',
    publications jsonb NOT NULL DEFAULT '[]',
    awards jsonb NOT NULL DEFAULT '[]',
    certifications jsonb NOT NULL DEFAULT '[]',

    version integer NOT NULL DEFAULT 1,
    is_current boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER academic_cv_updated_at
    BEFORE UPDATE ON public.academic_cv
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_academic_cv_current ON public.academic_cv(tenant_id, user_id)
    WHERE is_current = true;
