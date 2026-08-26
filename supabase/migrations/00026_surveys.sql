-- ============================================================================
-- MODULA HEALTH — Migration 026: Surveys (formulários de pesquisa públicos)
-- Módulo provisório: builder autenticado, link público de resposta (public_slug)
-- e link público de resultados protegido por token (results_token).
-- Acesso público acontece somente via service role no servidor (sem policy anon).
-- ============================================================================

-- ============================================================================
-- SURVEYS
-- ============================================================================

CREATE TABLE public.surveys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,

    title varchar(200) NOT NULL,
    description text,

    -- Tokens dos links públicos
    public_slug text NOT NULL UNIQUE,
    results_token text NOT NULL UNIQUE,

    -- Estrutura das perguntas (ver apps/web/src/lib/surveys/schema.ts)
    questions jsonb NOT NULL DEFAULT '[]',

    status varchar(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'closed')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER surveys_updated_at
    BEFORE UPDATE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_surveys_tenant ON public.surveys(tenant_id, created_at DESC);
CREATE INDEX idx_surveys_public_slug ON public.surveys(public_slug);
CREATE INDEX idx_surveys_results_token ON public.surveys(results_token);

-- ============================================================================
-- SURVEY RESPONSES
-- ============================================================================

CREATE TABLE public.survey_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,

    -- Mapa question_id -> resposta
    answers jsonb NOT NULL DEFAULT '{}',

    submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_survey_responses_survey ON public.survey_responses(survey_id, submitted_at DESC);

-- ============================================================================
-- RLS — isolamento por tenant
-- ============================================================================

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_tenant" ON public.surveys
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "survey_responses_tenant" ON public.survey_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = survey_responses.survey_id
              AND s.tenant_id = get_current_tenant_id()
        )
    );
