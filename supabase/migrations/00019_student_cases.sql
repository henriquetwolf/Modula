-- ============================================================================
-- MODULA HEALTH — Migration 019: Student Case Studies
-- Case library, attempts, discussions, favorites
-- ============================================================================

-- ============================================================================
-- CASE STUDIES (system library of practice cases)
-- ============================================================================

CREATE TABLE public.case_studies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    area profession_type NOT NULL,
    specialty varchar(100),
    title varchar(300) NOT NULL,
    description text NOT NULL,
    difficulty varchar(20) NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

    -- Case content
    patient_scenario jsonb NOT NULL DEFAULT '{}',
    history text,
    exam_findings text,
    complementary_exams text,
    questions jsonb NOT NULL DEFAULT '[]',
    expected_outcomes jsonb NOT NULL DEFAULT '{}',
    discussion_points text,
    key_concepts text[] NOT NULL DEFAULT '{}',
    references_list text[] NOT NULL DEFAULT '{}',

    tags text[] NOT NULL DEFAULT '{}',
    is_system boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true,
    is_premium boolean NOT NULL DEFAULT false,

    -- Stats
    times_attempted integer NOT NULL DEFAULT 0,
    avg_score numeric(5,2),

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER case_studies_updated_at
    BEFORE UPDATE ON public.case_studies
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_case_studies_area ON public.case_studies(area, specialty);
CREATE INDEX idx_case_studies_difficulty ON public.case_studies(area, difficulty);
CREATE INDEX idx_case_studies_system ON public.case_studies(is_system) WHERE is_system = true;

-- ============================================================================
-- CASE ATTEMPTS (user attempts at solving cases)
-- ============================================================================

CREATE TABLE public.case_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    case_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,

    hypotheses text[] NOT NULL DEFAULT '{}',
    decisions jsonb NOT NULL DEFAULT '[]',
    reasoning text,
    outcome_score numeric(5,2),
    ai_feedback text,
    ai_feedback_model varchar(50),

    time_spent_seconds integer,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_attempts_user ON public.case_attempts(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_case_attempts_case ON public.case_attempts(case_id);

-- ============================================================================
-- CASE DISCUSSIONS (comments on cases)
-- ============================================================================

CREATE TABLE public.case_discussions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    content text NOT NULL,
    parent_id uuid REFERENCES public.case_discussions(id) ON DELETE CASCADE,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER case_discussions_updated_at
    BEFORE UPDATE ON public.case_discussions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_case_discussions_case ON public.case_discussions(case_id, created_at);

-- ============================================================================
-- CASE FAVORITES
-- ============================================================================

CREATE TABLE public.case_favorites (
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    case_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, case_id)
);
