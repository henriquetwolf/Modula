-- ============================================================================
-- MODULA HEALTH — Migration 028: texto customizavel do botao de envio
-- NULL mantem o texto padrao ("Enviar resposta") no formulario publico.
-- ============================================================================

ALTER TABLE public.surveys
    ADD COLUMN submit_label varchar(60);
