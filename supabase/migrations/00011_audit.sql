-- ============================================================================
-- MODULA HEALTH — Migration 011: Audit Logs, Sensitive Data Access
-- ============================================================================

-- AUDIT LOGS (general platform audit trail)
-- Partitioned table: PK must include partition key, no direct FKs allowed
CREATE TABLE public.audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tenant_id uuid,                                    -- NULL for platform-level events
    user_id uuid,
    action varchar(50) NOT NULL,                       -- 'create', 'update', 'delete', 'login', 'export', 'access'
    resource_type varchar(50) NOT NULL,                -- 'client_profile', 'evaluation', 'payment'
    resource_id uuid,
    module_code varchar(50),

    -- Change details
    changes jsonb DEFAULT '{}',                        -- {field: {old: x, new: y}}
    description text,

    -- Request context
    ip_address inet,
    user_agent text,
    request_id varchar(100),
    session_id varchar(100),

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partitions by quarter (create as needed)
CREATE TABLE public.audit_logs_2026_q1 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE public.audit_logs_2026_q2 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE public.audit_logs_2026_q3 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE public.audit_logs_2026_q4 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE INDEX idx_audit_logs_tenant ON public.audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- Append-only: revoke UPDATE and DELETE from regular roles
-- (applied after RLS setup)

-- SENSITIVE DATA ACCESS LOG (level 3-4 data access tracking)
CREATE TABLE public.sensitive_data_access_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id),
    client_id uuid NOT NULL REFERENCES public.client_profiles(id),
    resource_type varchar(50) NOT NULL,
    resource_id uuid NOT NULL,
    sensitivity_level sensitive_level NOT NULL,
    action varchar(20) NOT NULL,                       -- 'read', 'update', 'export', 'share'
    justification text,
    ip_address inet,
    user_agent text,
    accessed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sensitive_log_tenant ON public.sensitive_data_access_log(tenant_id, accessed_at DESC);
CREATE INDEX idx_sensitive_log_user ON public.sensitive_data_access_log(user_id, accessed_at DESC);
CREATE INDEX idx_sensitive_log_client ON public.sensitive_data_access_log(client_id, accessed_at DESC);
CREATE INDEX idx_sensitive_log_level ON public.sensitive_data_access_log(sensitivity_level, accessed_at DESC);

-- AI REQUEST LOGS (tracking AI usage per tenant)
CREATE TABLE public.ai_request_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id),
    copilot varchar(50) NOT NULL,                      -- 'ef', 'physio', 'nutri', 'commercial', 'ops'
    model varchar(50) NOT NULL,                        -- 'gpt-4o', 'claude-3.5-sonnet'
    action varchar(50) NOT NULL,                       -- 'generate_plan', 'analyze_evaluation', 'suggest'

    -- Token usage
    input_tokens integer NOT NULL DEFAULT 0,
    output_tokens integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    estimated_cost_cents numeric(10,4) DEFAULT 0,

    -- Performance
    latency_ms integer,
    status varchar(20) NOT NULL DEFAULT 'success',     -- success, error, filtered, rate_limited

    -- Context
    client_id uuid REFERENCES public.client_profiles(id),
    resource_type varchar(50),
    resource_id uuid,

    -- Content (sanitized — no PII)
    prompt_hash varchar(64),
    response_summary text,
    was_helpful boolean,
    user_feedback text,

    metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_logs_tenant ON public.ai_request_logs(tenant_id, created_at DESC);
CREATE INDEX idx_ai_logs_user ON public.ai_request_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_logs_copilot ON public.ai_request_logs(copilot, created_at DESC);
CREATE INDEX idx_ai_logs_tokens ON public.ai_request_logs(tenant_id, total_tokens);

-- EMBEDDINGS (pgvector for RAG)
CREATE TABLE public.embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    source_type varchar(50) NOT NULL,                  -- 'exercise', 'protocol', 'material', 'plan'
    source_id uuid NOT NULL,
    chunk_index integer DEFAULT 0,
    content text NOT NULL,
    embedding vector(1536),                            -- OpenAI text-embedding-3-small
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_embeddings_tenant ON public.embeddings(tenant_id);
CREATE INDEX idx_embeddings_source ON public.embeddings(source_type, source_id);
CREATE INDEX idx_embeddings_vector ON public.embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
