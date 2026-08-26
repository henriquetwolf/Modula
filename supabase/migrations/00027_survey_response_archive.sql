-- ============================================================================
-- MODULA HEALTH — Migration 027: arquivamento de respostas de pesquisa
-- Soft archive: a resposta continua no banco, mas sai da lista ativa, do
-- resumo por pergunta e do CSV. Pode ser restaurada a qualquer momento.
-- ============================================================================

ALTER TABLE public.survey_responses
    ADD COLUMN archived_at timestamptz;

-- Indice parcial: a listagem padrao consulta somente as respostas ativas
CREATE INDEX idx_survey_responses_active
    ON public.survey_responses(survey_id, submitted_at DESC)
    WHERE archived_at IS NULL;
