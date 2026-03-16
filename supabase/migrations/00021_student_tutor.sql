-- ============================================================================
-- MODULA HEALTH — Migration 021: AI Tutor for Students
-- Conversations, messages, feedback
-- ============================================================================

-- ============================================================================
-- TUTOR CONVERSATIONS
-- ============================================================================

CREATE TYPE tutor_mode AS ENUM (
    'general', 'discipline', 'methodology', 'internship',
    'article', 'case_study', 'exam_prep', 'coaching'
);

CREATE TABLE public.tutor_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    mode tutor_mode NOT NULL DEFAULT 'general',
    area profession_type,
    title varchar(300),
    discipline varchar(100),

    -- Context references
    context_type varchar(30),
    context_id uuid,

    message_count integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    is_archived boolean NOT NULL DEFAULT false,

    last_message_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER tutor_conversations_updated_at
    BEFORE UPDATE ON public.tutor_conversations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_tutor_conv_user ON public.tutor_conversations(tenant_id, user_id, last_message_at DESC);
CREATE INDEX idx_tutor_conv_mode ON public.tutor_conversations(user_id, mode);

-- ============================================================================
-- TUTOR MESSAGES
-- ============================================================================

CREATE TABLE public.tutor_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,

    role varchar(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content text NOT NULL,

    -- AI metadata (only for assistant messages)
    model varchar(50),
    input_tokens integer,
    output_tokens integer,
    latency_ms integer,
    context_sources jsonb,
    was_guardrail_filtered boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tutor_messages_conv ON public.tutor_messages(conversation_id, created_at);

-- ============================================================================
-- TUTOR FEEDBACK (thumbs up/down on messages)
-- ============================================================================

CREATE TABLE public.tutor_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES public.tutor_messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    rating varchar(10) NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
    comment text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_tutor_feedback_message ON public.tutor_feedback(message_id, user_id);
