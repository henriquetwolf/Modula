-- ============================================================================
-- MODULA HEALTH — Migration 015: Student Foundation
-- New enums, tenant_type, student_profiles table
-- ============================================================================

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

CREATE TYPE institution_type AS ENUM ('public', 'private', 'ead');
CREATE TYPE academic_status AS ENUM ('active', 'on_leave', 'graduated', 'transferred', 'dropped_out');
CREATE TYPE academic_shift AS ENUM ('morning', 'afternoon', 'evening', 'full_time');
CREATE TYPE tenant_type AS ENUM ('professional', 'student');

-- Extend existing saas_plan_tier
ALTER TYPE saas_plan_tier ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE saas_plan_tier ADD VALUE IF NOT EXISTS 'student_plus';

-- ============================================================================
-- ALTER TENANTS: add tenant_type column
-- ============================================================================

ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS tenant_type tenant_type NOT NULL DEFAULT 'professional';

CREATE INDEX idx_tenants_type ON public.tenants(tenant_type);

-- ============================================================================
-- STUDENT PROFILES
-- ============================================================================

CREATE TABLE public.student_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Institution
    institution_name text NOT NULL,
    institution_type institution_type NOT NULL DEFAULT 'private',

    -- Course
    course profession_type NOT NULL,
    course_name text NOT NULL,
    enrollment_number text,

    -- Academic progress
    current_semester smallint NOT NULL DEFAULT 1 CHECK (current_semester >= 1 AND current_semester <= 20),
    total_semesters smallint NOT NULL DEFAULT 8 CHECK (total_semesters >= 4 AND total_semesters <= 20),
    expected_graduation date,
    shift academic_shift NOT NULL DEFAULT 'morning',
    academic_status academic_status NOT NULL DEFAULT 'active',

    -- Interests and goals
    areas_of_interest text[] NOT NULL DEFAULT '{}',
    study_goals jsonb NOT NULL DEFAULT '{}',
    academic_history jsonb NOT NULL DEFAULT '{}',

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_student_profiles_tenant ON public.student_profiles(tenant_id);
CREATE INDEX idx_student_profiles_course ON public.student_profiles(course);
CREATE INDEX idx_student_profiles_status ON public.student_profiles(academic_status);
CREATE INDEX idx_student_profiles_semester ON public.student_profiles(current_semester);
