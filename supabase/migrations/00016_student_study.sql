-- ============================================================================
-- MODULA HEALTH — Migration 016: Student Study Domain
-- Tracks, flashcards, quizzes, notes, goals, reading lists
-- ============================================================================

-- ============================================================================
-- STUDY TRACKS (learning paths — system or user-created)
-- ============================================================================

CREATE TABLE public.study_tracks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_by uuid REFERENCES public.user_profiles(id),

    area profession_type NOT NULL,
    title varchar(200) NOT NULL,
    description text,
    difficulty varchar(20) NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours numeric(6,1),
    tags text[] NOT NULL DEFAULT '{}',
    is_system boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer DEFAULT 0,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_tracks_updated_at
    BEFORE UPDATE ON public.study_tracks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_study_tracks_area ON public.study_tracks(area);
CREATE INDEX idx_study_tracks_system ON public.study_tracks(is_system) WHERE is_system = true;
CREATE INDEX idx_study_tracks_tenant ON public.study_tracks(tenant_id) WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- STUDY TRACK MODULES (units within a track)
-- ============================================================================

CREATE TABLE public.study_track_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id uuid NOT NULL REFERENCES public.study_tracks(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    estimated_hours numeric(5,1),
    content jsonb NOT NULL DEFAULT '{}',
    lessons_count integer NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_track_modules_updated_at
    BEFORE UPDATE ON public.study_track_modules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_study_track_modules_track ON public.study_track_modules(track_id, sort_order);

-- ============================================================================
-- STUDY TRACK ENROLLMENTS (user progress in a track)
-- ============================================================================

CREATE TABLE public.study_track_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    track_id uuid NOT NULL REFERENCES public.study_tracks(id) ON DELETE CASCADE,

    current_module_id uuid REFERENCES public.study_track_modules(id),
    progress_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    last_activity_at timestamptz NOT NULL DEFAULT now(),

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_track_enrollments_updated_at
    BEFORE UPDATE ON public.study_track_enrollments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_enrollment_user_track ON public.study_track_enrollments(user_id, track_id);
CREATE INDEX idx_enrollment_tenant ON public.study_track_enrollments(tenant_id);

-- ============================================================================
-- STUDY SESSIONS (timed study blocks)
-- ============================================================================

CREATE TABLE public.study_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    track_module_id uuid REFERENCES public.study_track_modules(id),
    discipline varchar(100),
    topic varchar(200),

    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    duration_minutes integer,
    progress_pct numeric(5,2) DEFAULT 0,
    notes text,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_sessions_user ON public.study_sessions(tenant_id, user_id, started_at DESC);

-- ============================================================================
-- FLASHCARD DECKS
-- ============================================================================

CREATE TABLE public.flashcard_decks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    area profession_type,
    discipline varchar(100),
    tags text[] NOT NULL DEFAULT '{}',
    card_count integer NOT NULL DEFAULT 0,
    is_ai_generated boolean NOT NULL DEFAULT false,
    source_type varchar(30),
    source_id uuid,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER flashcard_decks_updated_at
    BEFORE UPDATE ON public.flashcard_decks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_flashcard_decks_user ON public.flashcard_decks(tenant_id, user_id);

-- ============================================================================
-- FLASHCARDS (SM-2 spaced repetition)
-- ============================================================================

CREATE TABLE public.flashcards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id uuid NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,

    front text NOT NULL,
    back text NOT NULL,
    hint text,

    -- SM-2 algorithm fields
    difficulty varchar(10) NOT NULL DEFAULT 'new' CHECK (difficulty IN ('new', 'learning', 'review', 'relearning')),
    ease_factor numeric(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
    interval_days integer NOT NULL DEFAULT 0,
    repetitions integer NOT NULL DEFAULT 0,
    lapses integer NOT NULL DEFAULT 0,
    next_review_at timestamptz NOT NULL DEFAULT now(),
    last_reviewed_at timestamptz,

    sort_order integer DEFAULT 0,
    is_ai_generated boolean NOT NULL DEFAULT false,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER flashcards_updated_at
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_flashcards_deck ON public.flashcards(deck_id);
CREATE INDEX idx_flashcards_review ON public.flashcards(deck_id, next_review_at)
    WHERE difficulty != 'new';

-- ============================================================================
-- QUESTION BANK (system + user questions)
-- ============================================================================

CREATE TABLE public.question_bank (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,

    area profession_type NOT NULL,
    discipline varchar(100) NOT NULL,
    topic varchar(200),
    question_text text NOT NULL,
    options jsonb NOT NULL DEFAULT '[]',
    correct_option_index smallint NOT NULL,
    explanation text,
    difficulty varchar(20) NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags text[] NOT NULL DEFAULT '{}',

    is_system boolean NOT NULL DEFAULT false,
    is_ai_generated boolean NOT NULL DEFAULT false,
    times_answered integer NOT NULL DEFAULT 0,
    times_correct integer NOT NULL DEFAULT 0,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_question_bank_area ON public.question_bank(area, discipline);
CREATE INDEX idx_question_bank_system ON public.question_bank(is_system) WHERE is_system = true;
CREATE INDEX idx_question_bank_tenant ON public.question_bank(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_question_bank_difficulty ON public.question_bank(area, difficulty);

-- ============================================================================
-- QUIZZES (quiz instances taken by a user)
-- ============================================================================

CREATE TABLE public.quizzes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    area profession_type NOT NULL,
    discipline varchar(100),
    quiz_type varchar(20) NOT NULL DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'exam_prep', 'adaptive', 'ai_generated')),

    question_ids uuid[] NOT NULL DEFAULT '{}',
    answers jsonb NOT NULL DEFAULT '[]',
    score numeric(5,2),
    total_questions integer NOT NULL DEFAULT 0,
    correct_answers integer NOT NULL DEFAULT 0,
    time_limit_minutes integer,
    time_spent_seconds integer,

    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_user ON public.quizzes(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_quizzes_area ON public.quizzes(area, discipline);

-- ============================================================================
-- STUDY NOTES
-- ============================================================================

CREATE TABLE public.study_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(300) NOT NULL,
    content text NOT NULL DEFAULT '',
    discipline varchar(100),
    semester smallint,
    tags text[] NOT NULL DEFAULT '{}',
    is_favorite boolean NOT NULL DEFAULT false,
    is_pinned boolean NOT NULL DEFAULT false,

    source_type varchar(30),
    source_id uuid,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_notes_updated_at
    BEFORE UPDATE ON public.study_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_study_notes_user ON public.study_notes(tenant_id, user_id, updated_at DESC);
CREATE INDEX idx_study_notes_discipline ON public.study_notes(tenant_id, user_id, discipline);
CREATE INDEX idx_study_notes_favorite ON public.study_notes(tenant_id, user_id)
    WHERE is_favorite = true;

-- ============================================================================
-- STUDY GOALS
-- ============================================================================

CREATE TABLE public.study_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    goal_type varchar(30) NOT NULL DEFAULT 'custom' CHECK (goal_type IN ('study_hours', 'articles_read', 'quizzes_completed', 'flashcards_reviewed', 'cases_solved', 'custom')),
    target_value numeric(10,2) NOT NULL,
    current_value numeric(10,2) NOT NULL DEFAULT 0,
    unit varchar(20) NOT NULL DEFAULT 'count',
    deadline date,
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER study_goals_updated_at
    BEFORE UPDATE ON public.study_goals
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_study_goals_user ON public.study_goals(tenant_id, user_id, status);

-- ============================================================================
-- READING LISTS
-- ============================================================================

CREATE TABLE public.reading_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    items jsonb NOT NULL DEFAULT '[]',
    item_count integer NOT NULL DEFAULT 0,
    is_public boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER reading_lists_updated_at
    BEFORE UPDATE ON public.reading_lists
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_reading_lists_user ON public.reading_lists(tenant_id, user_id);
