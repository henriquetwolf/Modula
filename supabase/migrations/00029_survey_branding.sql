-- ============================================================================
-- MODULA HEALTH — Migration 029: branding configurável do formulário público
-- logo_url: imagem opcional no topo; show_branding: rodapé "criado com Modula Health"
-- ============================================================================

ALTER TABLE public.surveys
    ADD COLUMN logo_url text,
    ADD COLUMN show_branding boolean NOT NULL DEFAULT false;

-- Bucket público para logos enviadas pelo editor de pesquisas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('survey-logos', 'survey-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "survey_logos_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'survey-logos');

CREATE POLICY "survey_logos_tenant_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'survey-logos'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

CREATE POLICY "survey_logos_tenant_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'survey-logos'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

CREATE POLICY "survey_logos_tenant_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'survey-logos'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );
