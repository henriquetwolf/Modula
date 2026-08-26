-- ============================================================================
-- MODULA HEALTH — Migration 030: destaque de respostas de pesquisa
-- Permite marcar respostas como destaque durante a leitura ao vivo. O destaque
-- e compartilhado: quem marca pelo celular faz aparecer para todos que estao
-- no mesmo link de resultados. NULL = sem destaque.
-- ============================================================================

ALTER TABLE public.survey_responses
    ADD COLUMN highlighted_at timestamptz;

-- Indice parcial: as respostas em destaque sobem para o topo da listagem
CREATE INDEX idx_survey_responses_highlighted
    ON public.survey_responses(survey_id, highlighted_at DESC)
    WHERE highlighted_at IS NOT NULL;
