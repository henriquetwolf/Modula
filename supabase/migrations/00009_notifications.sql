-- ============================================================================
-- MODULA HEALTH — Migration 009: Notifications
-- ============================================================================

-- NOTIFICATIONS (in-app notification center)
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'info',
    channel notification_channel NOT NULL DEFAULT 'in_app',
    title varchar(200) NOT NULL,
    body text,
    icon varchar(50),

    -- Action link
    action_url text,
    action_label varchar(100),

    -- Source entity
    source_type varchar(50),                          -- 'appointment', 'payment', 'evaluation', etc.
    source_id uuid,

    -- Status
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    is_archived boolean NOT NULL DEFAULT false,

    -- Delivery status (for email/whatsapp/sms)
    delivered_at timestamptz,
    failed_at timestamptz,
    failure_reason text,

    metadata jsonb NOT NULL DEFAULT '{}',
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_tenant ON public.notifications(tenant_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_source ON public.notifications(source_type, source_id);

-- NOTIFICATION PREFERENCES (per-user overrides)
CREATE TABLE public.notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    event_type varchar(50) NOT NULL,                  -- 'appointment_reminder', 'payment_due', 'new_message'
    in_app boolean NOT NULL DEFAULT true,
    email boolean NOT NULL DEFAULT true,
    whatsapp boolean NOT NULL DEFAULT false,
    sms boolean NOT NULL DEFAULT false,
    push boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER notification_prefs_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_notif_prefs_unique ON public.notification_preferences(user_id, event_type);
CREATE INDEX idx_notif_prefs_tenant ON public.notification_preferences(tenant_id);

-- NOTIFICATION TEMPLATES (reusable templates)
CREATE TABLE public.notification_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = system
    event_type varchar(50) NOT NULL,
    channel notification_channel NOT NULL,
    title_template text NOT NULL,                     -- "Lembrete: Consulta amanha as {{time}}"
    body_template text NOT NULL,                      -- "Ola {{client_name}}, ..."
    is_system boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER notification_templates_updated_at
    BEFORE UPDATE ON public.notification_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_notif_templates_tenant ON public.notification_templates(tenant_id);
CREATE UNIQUE INDEX idx_notif_templates_event ON public.notification_templates(COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), event_type, channel);
