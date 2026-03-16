-- ============================================================================
-- MODULA HEALTH — Migration 022: Academic Organization & Career Preparation
-- Calendar, tasks, weekly plans, productivity, career checklists
-- ============================================================================

-- ============================================================================
-- ACADEMIC EVENTS (calendar)
-- ============================================================================

CREATE TYPE academic_event_type AS ENUM (
    'exam', 'deadline', 'class', 'lab', 'event', 'meeting', 'study', 'internship_shift', 'other'
);

CREATE TABLE public.academic_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(300) NOT NULL,
    description text,
    event_type academic_event_type NOT NULL DEFAULT 'other',
    discipline varchar(100),
    location varchar(200),

    event_date date NOT NULL,
    time_start time,
    time_end time,
    is_all_day boolean NOT NULL DEFAULT false,

    priority varchar(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled', 'postponed')),

    recurrence_rule jsonb,
    reminder_minutes integer[] NOT NULL DEFAULT '{60}',

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER academic_events_updated_at
    BEFORE UPDATE ON public.academic_events
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_academic_events_user_date ON public.academic_events(tenant_id, user_id, event_date);
CREATE INDEX idx_academic_events_type ON public.academic_events(user_id, event_type);

-- ============================================================================
-- ACADEMIC TASKS
-- ============================================================================

CREATE TABLE public.academic_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(300) NOT NULL,
    description text,
    discipline varchar(100),
    due_date date,

    priority varchar(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status varchar(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),

    estimated_hours numeric(5,1),
    actual_hours numeric(5,1),
    tags text[] NOT NULL DEFAULT '{}',

    -- Link to other entities
    source_type varchar(30),
    source_id uuid,

    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER academic_tasks_updated_at
    BEFORE UPDATE ON public.academic_tasks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_academic_tasks_user ON public.academic_tasks(tenant_id, user_id, status);
CREATE INDEX idx_academic_tasks_due ON public.academic_tasks(tenant_id, user_id, due_date)
    WHERE status NOT IN ('done', 'cancelled');

-- ============================================================================
-- WEEKLY PLANS (AI-generated or manual study plans)
-- ============================================================================

CREATE TABLE public.weekly_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    week_start date NOT NULL,
    blocks jsonb NOT NULL DEFAULT '[]',
    is_ai_generated boolean NOT NULL DEFAULT false,
    completion_pct numeric(5,2) NOT NULL DEFAULT 0,
    notes text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER weekly_plans_updated_at
    BEFORE UPDATE ON public.weekly_plans
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_weekly_plans_user_week ON public.weekly_plans(tenant_id, user_id, week_start);

-- ============================================================================
-- PRODUCTIVITY LOGS (daily metrics)
-- ============================================================================

CREATE TABLE public.productivity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    log_date date NOT NULL,
    study_hours numeric(4,1) NOT NULL DEFAULT 0,
    tasks_completed integer NOT NULL DEFAULT 0,
    articles_read integer NOT NULL DEFAULT 0,
    flashcards_reviewed integer NOT NULL DEFAULT 0,
    quizzes_taken integer NOT NULL DEFAULT 0,
    cases_solved integer NOT NULL DEFAULT 0,
    notes text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_productivity_logs_user_date ON public.productivity_logs(tenant_id, user_id, log_date);

-- ============================================================================
-- CAREER CHECKLISTS
-- ============================================================================

CREATE TABLE public.career_checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    items jsonb NOT NULL DEFAULT '[]',
    completion_pct numeric(5,2) NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER career_checklists_updated_at
    BEFORE UPDATE ON public.career_checklists
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_career_checklists_user ON public.career_checklists(tenant_id, user_id);

-- ============================================================================
-- CAREER INTERESTS
-- ============================================================================

CREATE TABLE public.career_interests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    specialties text[] NOT NULL DEFAULT '{}',
    niches text[] NOT NULL DEFAULT '{}',
    target_audience text,
    goals text,
    preferred_settings text[] NOT NULL DEFAULT '{}',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER career_interests_updated_at
    BEFORE UPDATE ON public.career_interests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_career_interests_user ON public.career_interests(tenant_id, user_id);

-- ============================================================================
-- UPGRADE READINESS (score for student→pro transition)
-- ============================================================================

CREATE TABLE public.upgrade_readiness (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    overall_score smallint NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    criteria jsonb NOT NULL DEFAULT '[]',
    last_assessed_at timestamptz NOT NULL DEFAULT now(),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER upgrade_readiness_updated_at
    BEFORE UPDATE ON public.upgrade_readiness
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_upgrade_readiness_user ON public.upgrade_readiness(tenant_id, user_id);

-- ============================================================================
-- CAREER MILESTONES
-- ============================================================================

CREATE TABLE public.career_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(300) NOT NULL,
    description text,
    achieved_at date,
    evidence_ids uuid[] NOT NULL DEFAULT '{}',

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_career_milestones_user ON public.career_milestones(tenant_id, user_id);
