-- ============================================================================
-- MODULA HEALTH — Migration 006: Appointments, Sessions, Schedule
-- ============================================================================

-- APPOINTMENTS (agendamentos)
CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    professional_id uuid NOT NULL REFERENCES public.user_profiles(id),
    status appointment_status NOT NULL DEFAULT 'scheduled',
    type varchar(50) NOT NULL DEFAULT 'individual',  -- individual, group, evaluation, follow_up, remote
    title varchar(200),

    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 60,
    timezone varchar(50) NOT NULL DEFAULT 'America/Sao_Paulo',

    -- Recurrence (if recurring appointment)
    is_recurring boolean NOT NULL DEFAULT false,
    recurrence_rule jsonb DEFAULT '{}',              -- {frequency, interval, days_of_week, until}
    recurrence_parent_id uuid REFERENCES public.appointments(id),

    -- Location
    room varchar(100),
    is_online boolean NOT NULL DEFAULT false,
    video_url text,

    -- Confirmations
    confirmed_at timestamptz,
    confirmed_via varchar(20),                       -- 'whatsapp', 'email', 'app', 'phone'
    cancelled_at timestamptz,
    cancellation_reason text,
    cancelled_by uuid REFERENCES public.user_profiles(id),

    -- Check-in
    checked_in_at timestamptz,

    -- Link to session/evaluation created from this appointment
    session_id uuid,
    evaluation_id uuid REFERENCES public.evaluations(id),

    notes text,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES public.user_profiles(id)
);

CREATE TRIGGER appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_appointments_tenant ON public.appointments(tenant_id);
CREATE INDEX idx_appointments_unit ON public.appointments(tenant_id, unit_id);
CREATE INDEX idx_appointments_prof ON public.appointments(tenant_id, professional_id, starts_at);
CREATE INDEX idx_appointments_client ON public.appointments(tenant_id, client_id, starts_at);
CREATE INDEX idx_appointments_date ON public.appointments(tenant_id, starts_at, ends_at);
CREATE INDEX idx_appointments_status ON public.appointments(tenant_id, status, starts_at);
CREATE INDEX idx_appointments_recurrence ON public.appointments(recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;

-- SESSIONS (completed session records — linked to appointments)
CREATE TABLE public.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    professional_id uuid NOT NULL REFERENCES public.user_profiles(id),
    appointment_id uuid REFERENCES public.appointments(id),
    plan_id uuid REFERENCES public.plans(id),
    type varchar(50) NOT NULL DEFAULT 'training',    -- training, therapy, consultation, evaluation
    status varchar(20) NOT NULL DEFAULT 'completed', -- completed, partial, missed

    started_at timestamptz NOT NULL,
    ended_at timestamptz,
    duration_minutes integer,

    -- Session notes
    notes text,
    summary text,

    -- Performance/adherence tracking
    adherence_score numeric(5,2),                    -- 0-100
    intensity_level integer,                         -- 1-10 RPE
    client_feedback jsonb DEFAULT '{}',              -- {mood, pain_level, energy, satisfaction}

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES public.user_profiles(id)
);

CREATE TRIGGER sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_sessions_tenant ON public.sessions(tenant_id);
CREATE INDEX idx_sessions_client ON public.sessions(tenant_id, client_id, started_at DESC);
CREATE INDEX idx_sessions_prof ON public.sessions(tenant_id, professional_id, started_at DESC);
CREATE INDEX idx_sessions_plan ON public.sessions(plan_id);

-- Add FK from appointments to sessions (deferred because of circular reference)
ALTER TABLE public.appointments
    ADD CONSTRAINT fk_appointments_session
    FOREIGN KEY (session_id) REFERENCES public.sessions(id);

-- SCHEDULE BLOCKS (professional availability / blocked time)
CREATE TABLE public.schedule_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    professional_id uuid NOT NULL REFERENCES public.user_profiles(id),
    type varchar(20) NOT NULL DEFAULT 'available',   -- available, blocked, break, holiday
    title varchar(200),
    day_of_week weekday_type,                        -- for recurring availability
    starts_at timestamptz,
    ends_at timestamptz,
    start_time time,                                  -- for recurring: 08:00
    end_time time,                                    -- for recurring: 18:00
    is_recurring boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER schedule_blocks_updated_at
    BEFORE UPDATE ON public.schedule_blocks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_schedule_blocks_tenant ON public.schedule_blocks(tenant_id);
CREATE INDEX idx_schedule_blocks_prof ON public.schedule_blocks(tenant_id, professional_id);

-- WAITLIST (queue for fully booked slots)
CREATE TABLE public.waitlist_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    unit_id uuid NOT NULL REFERENCES public.units(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    professional_id uuid REFERENCES public.user_profiles(id),
    preferred_days weekday_type[],
    preferred_time_start time,
    preferred_time_end time,
    type varchar(50) DEFAULT 'individual',
    priority integer DEFAULT 0,
    status varchar(20) NOT NULL DEFAULT 'waiting',   -- waiting, notified, booked, cancelled
    notified_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER waitlist_entries_updated_at
    BEFORE UPDATE ON public.waitlist_entries
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_waitlist_tenant ON public.waitlist_entries(tenant_id);
CREATE INDEX idx_waitlist_prof ON public.waitlist_entries(professional_id);
