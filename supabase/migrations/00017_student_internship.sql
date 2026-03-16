-- ============================================================================
-- MODULA HEALTH — Migration 017: Student Internship & Supervision
-- Internship records, entries, supervisors, feedback, competencies, reports
-- ============================================================================

-- ============================================================================
-- INTERNSHIP SUPERVISORS
-- ============================================================================

CREATE TABLE public.internship_supervisors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES public.user_profiles(id),

    name varchar(200) NOT NULL,
    email varchar(255),
    phone varchar(30),
    institution varchar(200),
    profession profession_type,
    registration_number varchar(50),
    is_active boolean NOT NULL DEFAULT true,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER internship_supervisors_updated_at
    BEFORE UPDATE ON public.internship_supervisors
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_intern_supervisors_tenant ON public.internship_supervisors(tenant_id);

-- ============================================================================
-- INTERNSHIP RECORDS
-- ============================================================================

CREATE TABLE public.internship_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    supervisor_id uuid REFERENCES public.internship_supervisors(id),

    institution varchar(200) NOT NULL,
    location varchar(300),
    area profession_type NOT NULL,
    specialty varchar(100),

    start_date date NOT NULL,
    end_date date,
    total_hours_required numeric(7,1) NOT NULL DEFAULT 0,
    hours_completed numeric(7,1) NOT NULL DEFAULT 0,
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled', 'archived')),

    objectives text,
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER internship_records_updated_at
    BEFORE UPDATE ON public.internship_records
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_internship_records_user ON public.internship_records(tenant_id, user_id);
CREATE INDEX idx_internship_records_status ON public.internship_records(status);

-- ============================================================================
-- INTERNSHIP ENTRIES (daily diary)
-- ============================================================================

CREATE TABLE public.internship_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id uuid NOT NULL REFERENCES public.internship_records(id) ON DELETE CASCADE,

    entry_date date NOT NULL,
    hours numeric(4,1) NOT NULL CHECK (hours > 0 AND hours <= 24),
    description text NOT NULL,
    activities text[] NOT NULL DEFAULT '{}',
    reflections text,
    competencies_practiced text[] NOT NULL DEFAULT '{}',
    attachments uuid[] NOT NULL DEFAULT '{}',

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER internship_entries_updated_at
    BEFORE UPDATE ON public.internship_entries
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_internship_entries_record ON public.internship_entries(internship_id, entry_date DESC);

-- ============================================================================
-- SUPERVISOR FEEDBACK
-- ============================================================================

CREATE TABLE public.supervisor_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid REFERENCES public.internship_entries(id) ON DELETE CASCADE,
    internship_id uuid NOT NULL REFERENCES public.internship_records(id) ON DELETE CASCADE,
    supervisor_id uuid NOT NULL REFERENCES public.internship_supervisors(id),

    rating smallint CHECK (rating >= 1 AND rating <= 5),
    comments text NOT NULL,
    competency_scores jsonb NOT NULL DEFAULT '{}',
    strengths text,
    improvements text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supervisor_feedback_internship ON public.supervisor_feedback(internship_id, created_at DESC);
CREATE INDEX idx_supervisor_feedback_entry ON public.supervisor_feedback(entry_id);

-- ============================================================================
-- COMPETENCY ASSESSMENTS
-- ============================================================================

CREATE TABLE public.competency_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    internship_id uuid REFERENCES public.internship_records(id) ON DELETE SET NULL,

    competency_code varchar(50) NOT NULL,
    competency_name varchar(200) NOT NULL,
    self_score smallint CHECK (self_score >= 0 AND self_score <= 100),
    supervisor_score smallint CHECK (supervisor_score >= 0 AND supervisor_score <= 100),
    evidence_ids uuid[] NOT NULL DEFAULT '{}',
    notes text,

    assessed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER competency_assessments_updated_at
    BEFORE UPDATE ON public.competency_assessments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_competency_assess_user ON public.competency_assessments(tenant_id, user_id);
CREATE INDEX idx_competency_assess_internship ON public.competency_assessments(internship_id);

-- ============================================================================
-- INTERNSHIP REPORTS
-- ============================================================================

CREATE TABLE public.internship_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id uuid NOT NULL REFERENCES public.internship_records(id) ON DELETE CASCADE,

    title varchar(300) NOT NULL,
    content text NOT NULL DEFAULT '',
    report_type varchar(20) NOT NULL DEFAULT 'monthly' CHECK (report_type IN ('weekly', 'monthly', 'final', 'partial')),
    status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'revision_needed')),

    feedback text,
    attachments uuid[] NOT NULL DEFAULT '{}',
    is_ai_assisted boolean NOT NULL DEFAULT false,

    submitted_at timestamptz,
    reviewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER internship_reports_updated_at
    BEFORE UPDATE ON public.internship_reports
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_internship_reports_record ON public.internship_reports(internship_id);

-- ============================================================================
-- INTERNSHIP CHECKLISTS
-- ============================================================================

CREATE TABLE public.internship_checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id uuid NOT NULL REFERENCES public.internship_records(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    items jsonb NOT NULL DEFAULT '[]',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER internship_checklists_updated_at
    BEFORE UPDATE ON public.internship_checklists
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- SUPERVISOR ACCESS TOKENS (external access without user account)
-- ============================================================================

CREATE TABLE public.supervisor_access_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    supervisor_id uuid NOT NULL REFERENCES public.internship_supervisors(id) ON DELETE CASCADE,
    internship_id uuid NOT NULL REFERENCES public.internship_records(id) ON DELETE CASCADE,

    token varchar(128) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    last_used_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supervisor_tokens_active ON public.supervisor_access_tokens(token)
    WHERE is_active = true;
