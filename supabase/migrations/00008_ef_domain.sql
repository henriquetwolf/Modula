-- ============================================================================
-- MODULA HEALTH — Migration 008: EF Domain — Exercises, Training Plans
-- ============================================================================

-- EXERCISE CATEGORIES
CREATE TABLE public.exercise_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = system library
    name varchar(100) NOT NULL,
    slug varchar(100) NOT NULL,
    parent_id uuid REFERENCES public.exercise_categories(id),
    icon varchar(50),
    sort_order integer DEFAULT 0,
    is_system boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_categories_tenant ON public.exercise_categories(tenant_id);
CREATE INDEX idx_exercise_categories_parent ON public.exercise_categories(parent_id);

-- EXERCISES (library — system + tenant custom)
CREATE TABLE public.exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = system library
    category_id uuid REFERENCES public.exercise_categories(id),
    name varchar(200) NOT NULL,
    slug varchar(200),
    description text,
    instructions text,
    tips text,

    -- Classification
    muscle_groups text[] DEFAULT '{}',               -- ['chest', 'triceps', 'anterior_deltoid']
    primary_muscle varchar(50),
    equipment text[] DEFAULT '{}',                   -- ['barbell', 'bench']
    difficulty varchar(20) DEFAULT 'intermediate',   -- beginner, intermediate, advanced
    modality varchar(50) DEFAULT 'strength',         -- strength, cardio, flexibility, functional, plyometric
    movement_pattern varchar(50),                     -- push, pull, hinge, squat, lunge, carry, rotation
    laterality varchar(20) DEFAULT 'bilateral',      -- bilateral, unilateral, alternating

    -- Media
    image_url text,
    video_url text,
    thumbnail_url text,

    -- System flags
    is_system boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    is_favorite boolean NOT NULL DEFAULT false,
    usage_count integer DEFAULT 0,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES public.user_profiles(id)
);

CREATE TRIGGER exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_exercises_tenant ON public.exercises(tenant_id);
CREATE INDEX idx_exercises_category ON public.exercises(category_id);
CREATE INDEX idx_exercises_muscle ON public.exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_equipment ON public.exercises USING GIN(equipment);
CREATE INDEX idx_exercises_name_trgm ON public.exercises USING GIN(name gin_trgm_ops);
CREATE INDEX idx_exercises_system ON public.exercises(is_system) WHERE is_system = true;
CREATE INDEX idx_exercises_modality ON public.exercises(modality);

-- TRAINING PLAN DETAILS (extends plans table where type='training')
-- The plans table holds the base record; this table holds training-specific structure

-- TRAINING PLAN WEEKS (periodization)
CREATE TABLE public.training_plan_weeks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    week_number integer NOT NULL,
    name varchar(100),
    description text,
    focus varchar(50),                                -- hypertrophy, strength, endurance, deload
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_weeks_plan ON public.training_plan_weeks(plan_id);
CREATE UNIQUE INDEX idx_training_weeks_order ON public.training_plan_weeks(plan_id, week_number);

-- TRAINING PLAN DAYS (workout sessions within a week)
CREATE TABLE public.training_plan_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    week_id uuid REFERENCES public.training_plan_weeks(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,                       -- "Treino A - Peito e Triceps"
    day_of_week weekday_type,
    day_number integer,                               -- sequential day number
    focus varchar(100),
    warmup_notes text,
    cooldown_notes text,
    estimated_duration_minutes integer,
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER training_plan_days_updated_at
    BEFORE UPDATE ON public.training_plan_days
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_training_days_plan ON public.training_plan_days(plan_id);
CREATE INDEX idx_training_days_week ON public.training_plan_days(week_id);

-- TRAINING PLAN EXERCISE GROUPS (supersets, circuits, etc.)
CREATE TABLE public.training_exercise_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    day_id uuid NOT NULL REFERENCES public.training_plan_days(id) ON DELETE CASCADE,
    type varchar(30) NOT NULL DEFAULT 'straight',     -- straight, superset, triset, circuit, dropset, giant_set
    name varchar(100),
    rest_between_rounds_seconds integer,
    rounds integer DEFAULT 1,
    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_groups_day ON public.training_exercise_groups(day_id);

-- TRAINING PLAN EXERCISES (individual exercises within a day/group)
CREATE TABLE public.training_plan_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    day_id uuid NOT NULL REFERENCES public.training_plan_days(id) ON DELETE CASCADE,
    group_id uuid REFERENCES public.training_exercise_groups(id) ON DELETE SET NULL,
    exercise_id uuid NOT NULL REFERENCES public.exercises(id),

    -- Prescription
    sets integer NOT NULL DEFAULT 3,
    reps varchar(30),                                 -- "12", "8-12", "até falha"
    load varchar(50),                                 -- "70% 1RM", "20kg", "RPE 8"
    tempo varchar(20),                                -- "3-1-2-0" (eccentric-pause-concentric-pause)
    rest_seconds integer DEFAULT 60,
    duration_seconds integer,                         -- for timed exercises
    distance_meters integer,                          -- for distance exercises
    method varchar(50),                               -- 'standard', 'drop_set', 'rest_pause', 'pyramid', 'myo_reps'

    -- Instruction overrides
    notes text,                                       -- professional notes for this specific prescription
    substitution_exercise_id uuid REFERENCES public.exercises(id),

    sort_order integer NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER training_plan_exercises_updated_at
    BEFORE UPDATE ON public.training_plan_exercises
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_training_exercises_day ON public.training_plan_exercises(day_id);
CREATE INDEX idx_training_exercises_exercise ON public.training_plan_exercises(exercise_id);
CREATE INDEX idx_training_exercises_group ON public.training_plan_exercises(group_id);

-- TRAINING LOGS (client execution tracking)
CREATE TABLE public.training_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    plan_id uuid NOT NULL REFERENCES public.plans(id),
    day_id uuid NOT NULL REFERENCES public.training_plan_days(id),
    session_id uuid REFERENCES public.sessions(id),

    started_at timestamptz NOT NULL,
    completed_at timestamptz,
    duration_minutes integer,

    -- Overall feedback
    perceived_effort integer,                         -- RPE 1-10
    mood varchar(20),                                 -- great, good, neutral, bad, terrible
    energy_level integer,                             -- 1-10
    notes text,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_logs_tenant ON public.training_logs(tenant_id);
CREATE INDEX idx_training_logs_client ON public.training_logs(tenant_id, client_id, started_at DESC);
CREATE INDEX idx_training_logs_plan ON public.training_logs(plan_id);

-- TRAINING LOG SETS (individual set records)
CREATE TABLE public.training_log_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    log_id uuid NOT NULL REFERENCES public.training_logs(id) ON DELETE CASCADE,
    plan_exercise_id uuid NOT NULL REFERENCES public.training_plan_exercises(id),
    exercise_id uuid NOT NULL REFERENCES public.exercises(id),
    set_number integer NOT NULL,

    -- Actual execution
    reps_done integer,
    load_kg numeric(7,2),
    duration_seconds integer,
    distance_meters integer,
    rpe integer,                                      -- 1-10

    completed boolean NOT NULL DEFAULT true,
    skipped boolean NOT NULL DEFAULT false,
    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_log_sets_log ON public.training_log_sets(log_id);
CREATE INDEX idx_training_log_sets_exercise ON public.training_log_sets(exercise_id);
