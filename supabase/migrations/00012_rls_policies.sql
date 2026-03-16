-- ============================================================================
-- MODULA HEALTH — Migration 012: Row-Level Security Policies
-- All data tables protected by tenant isolation via auth.jwt()
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_professional_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plan_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_exercise_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_log_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER: get current tenant from JWT
-- ============================================================================
-- Uses get_current_tenant_id() defined in 00001_foundation.sql

-- ============================================================================
-- TENANTS — owner/admin of the tenant can read their own tenant
-- ============================================================================

CREATE POLICY "tenants_select" ON public.tenants
    FOR SELECT USING (id = get_current_tenant_id());

CREATE POLICY "tenants_update" ON public.tenants
    FOR UPDATE USING (id = get_current_tenant_id());

-- ============================================================================
-- COMPANIES — tenant isolation
-- ============================================================================

CREATE POLICY "companies_tenant" ON public.companies
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- UNITS — tenant isolation
-- ============================================================================

CREATE POLICY "units_tenant" ON public.units
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- USER PROFILES — tenant isolation
-- ============================================================================

CREATE POLICY "user_profiles_tenant" ON public.user_profiles
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "user_profiles_own" ON public.user_profiles
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "user_profiles_admin_manage" ON public.user_profiles
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (
            user_has_role('owner')
            OR user_has_role('admin')
        )
    );

-- ============================================================================
-- PROFESSIONAL PROFILES — tenant isolation
-- ============================================================================

CREATE POLICY "professional_profiles_tenant" ON public.professional_profiles
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "professional_profiles_own" ON public.professional_profiles
    FOR UPDATE USING (
        user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    );

-- ============================================================================
-- ROLES — system roles (public read) + tenant custom roles
-- ============================================================================

CREATE POLICY "roles_system_read" ON public.roles
    FOR SELECT USING (is_system = true);

CREATE POLICY "roles_tenant" ON public.roles
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- ROLE PERMISSIONS — follows roles access
-- ============================================================================

CREATE POLICY "role_permissions_read" ON public.role_permissions
    FOR SELECT USING (
        role_id IN (
            SELECT id FROM public.roles
            WHERE is_system = true OR tenant_id = get_current_tenant_id()
        )
    );

-- ============================================================================
-- USER ROLES — tenant isolation
-- ============================================================================

CREATE POLICY "user_roles_tenant" ON public.user_roles
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "user_roles_admin_manage" ON public.user_roles
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (user_has_role('owner') OR user_has_role('admin'))
    );

-- ============================================================================
-- UNIT MEMBERSHIPS — tenant isolation
-- ============================================================================

CREATE POLICY "unit_memberships_tenant" ON public.unit_memberships
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "unit_memberships_admin_manage" ON public.unit_memberships
    FOR ALL USING (
        tenant_id = get_current_tenant_id()
        AND (user_has_role('owner') OR user_has_role('admin') OR user_has_role('manager'))
    );

-- ============================================================================
-- INVITATIONS — tenant isolation
-- ============================================================================

CREATE POLICY "invitations_tenant" ON public.invitations
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- Public read for accepting invitations via token
CREATE POLICY "invitations_accept" ON public.invitations
    FOR SELECT USING (true);

-- ============================================================================
-- CLIENT PROFILES — tenant isolation + professional binding
-- ============================================================================

CREATE POLICY "clients_tenant_read" ON public.client_profiles
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "clients_tenant_write" ON public.client_profiles
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "clients_tenant_update" ON public.client_profiles
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "clients_tenant_delete" ON public.client_profiles
    FOR DELETE USING (
        tenant_id = get_current_tenant_id()
        AND (user_has_role('owner') OR user_has_role('admin'))
    );

-- ============================================================================
-- CLIENT PROFESSIONAL LINKS — tenant isolation
-- ============================================================================

CREATE POLICY "client_prof_links_tenant" ON public.client_professional_links
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CLIENT UNITS — tenant isolation
-- ============================================================================

CREATE POLICY "client_units_tenant" ON public.client_units
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- EVALUATIONS — tenant isolation
-- ============================================================================

CREATE POLICY "evaluations_tenant" ON public.evaluations
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- PLANS — tenant isolation
-- ============================================================================

CREATE POLICY "plans_tenant" ON public.plans
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- PROGRESS NOTES — tenant isolation
-- ============================================================================

CREATE POLICY "progress_notes_tenant" ON public.progress_notes
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- DOCUMENTS — tenant isolation
-- ============================================================================

CREATE POLICY "documents_tenant" ON public.documents
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CONSENT TEMPLATES — system + tenant
-- ============================================================================

CREATE POLICY "consent_templates_system" ON public.consent_templates
    FOR SELECT USING (tenant_id IS NULL);

CREATE POLICY "consent_templates_tenant" ON public.consent_templates
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CONSENT RECORDS — tenant isolation
-- ============================================================================

CREATE POLICY "consent_records_tenant" ON public.consent_records
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- APPOINTMENTS — tenant isolation
-- ============================================================================

CREATE POLICY "appointments_tenant" ON public.appointments
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- SESSIONS — tenant isolation
-- ============================================================================

CREATE POLICY "sessions_tenant" ON public.sessions
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- SCHEDULE BLOCKS — tenant isolation
-- ============================================================================

CREATE POLICY "schedule_blocks_tenant" ON public.schedule_blocks
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- WAITLIST — tenant isolation
-- ============================================================================

CREATE POLICY "waitlist_tenant" ON public.waitlist_entries
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- CLIENT SUBSCRIPTIONS — tenant isolation
-- ============================================================================

CREATE POLICY "client_subs_tenant" ON public.client_subscriptions
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- PAYMENTS — tenant isolation
-- ============================================================================

CREATE POLICY "payments_tenant" ON public.payments
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- INVOICES — tenant isolation
-- ============================================================================

CREATE POLICY "invoices_tenant" ON public.invoices
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- COMMISSIONS — tenant isolation
-- ============================================================================

CREATE POLICY "commissions_tenant" ON public.commissions
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- COUPONS — tenant isolation
-- ============================================================================

CREATE POLICY "coupons_tenant" ON public.coupons
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- EXERCISES — system library (public read) + tenant custom
-- ============================================================================

CREATE POLICY "exercises_system_read" ON public.exercises
    FOR SELECT USING (is_system = true);

CREATE POLICY "exercises_tenant" ON public.exercises
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- EXERCISE CATEGORIES — system + tenant
-- ============================================================================

CREATE POLICY "exercise_categories_system" ON public.exercise_categories
    FOR SELECT USING (is_system = true);

CREATE POLICY "exercise_categories_tenant" ON public.exercise_categories
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- TRAINING PLAN STRUCTURE — tenant isolation
-- ============================================================================

CREATE POLICY "training_weeks_tenant" ON public.training_plan_weeks
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "training_days_tenant" ON public.training_plan_days
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "training_groups_tenant" ON public.training_exercise_groups
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "training_exercises_tenant" ON public.training_plan_exercises
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "training_logs_tenant" ON public.training_logs
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "training_log_sets_tenant" ON public.training_log_sets
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- NOTIFICATIONS — user sees only their own
-- ============================================================================

CREATE POLICY "notifications_own" ON public.notifications
    FOR SELECT USING (
        user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "notifications_own_update" ON public.notifications
    FOR UPDATE USING (
        user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "notifications_tenant_insert" ON public.notifications
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================================
-- NOTIFICATION PREFERENCES — user sees only their own
-- ============================================================================

CREATE POLICY "notif_prefs_own" ON public.notification_preferences
    FOR ALL USING (
        user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    );

-- ============================================================================
-- NOTIFICATION TEMPLATES — system + tenant
-- ============================================================================

CREATE POLICY "notif_templates_system" ON public.notification_templates
    FOR SELECT USING (is_system = true);

CREATE POLICY "notif_templates_tenant" ON public.notification_templates
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- SAAS PLANS / MODULE CATALOG — public read (pricing page)
-- ============================================================================

CREATE POLICY "saas_plans_public_read" ON public.saas_plans
    FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "module_catalog_public_read" ON public.module_catalog
    FOR SELECT USING (is_active = true);

-- ============================================================================
-- SAAS SUBSCRIPTIONS — tenant sees own
-- ============================================================================

CREATE POLICY "saas_subs_tenant" ON public.saas_subscriptions
    FOR SELECT USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- MODULE ENTITLEMENTS — tenant sees own
-- ============================================================================

CREATE POLICY "module_ent_tenant" ON public.module_entitlements
    FOR SELECT USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- SAAS INVOICES — tenant sees own
-- ============================================================================

CREATE POLICY "saas_invoices_tenant" ON public.saas_invoices
    FOR SELECT USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- AUDIT LOGS — tenant isolation (read-only for admins)
-- ============================================================================

CREATE POLICY "audit_logs_tenant" ON public.audit_logs
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (user_has_role('owner') OR user_has_role('admin'))
    );

CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SENSITIVE DATA ACCESS LOG — admin only read, insert always allowed
-- ============================================================================

CREATE POLICY "sensitive_log_admin_read" ON public.sensitive_data_access_log
    FOR SELECT USING (
        tenant_id = get_current_tenant_id()
        AND (user_has_role('owner') OR user_has_role('admin'))
    );

CREATE POLICY "sensitive_log_insert" ON public.sensitive_data_access_log
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================================
-- AI REQUEST LOGS — tenant isolation
-- ============================================================================

CREATE POLICY "ai_logs_tenant" ON public.ai_request_logs
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "ai_logs_insert" ON public.ai_request_logs
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================================
-- EMBEDDINGS — tenant isolation
-- ============================================================================

CREATE POLICY "embeddings_tenant" ON public.embeddings
    FOR ALL USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('documents', 'documents', false, 52428800, NULL),
    ('exercises', 'exercises', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
    ('exports', 'exports', false, 104857600, NULL)
ON CONFLICT (id) DO NOTHING;

-- Avatars: public read, authenticated upload to own tenant folder
CREATE POLICY "avatars_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_tenant_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

-- Documents: tenant-isolated
CREATE POLICY "documents_tenant_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

CREATE POLICY "documents_tenant_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

CREATE POLICY "documents_tenant_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );

-- Exercises: system library public + tenant custom
CREATE POLICY "exercises_media_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'exercises'
        AND (
            (storage.foldername(name))[1] = 'system'
            OR (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
        )
    );

CREATE POLICY "exercises_media_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'exercises'
        AND (storage.foldername(name))[1] = (auth.jwt()->>'tenant_id')
    );
