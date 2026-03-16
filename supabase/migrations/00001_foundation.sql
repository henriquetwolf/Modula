-- ============================================================================
-- MODULA HEALTH — Migration 001: Foundation
-- Extensions, helper functions, triggers, enums
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector for AI/RAG
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- trigram similarity for search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE profession_type AS ENUM ('ef', 'physio', 'nutrition');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect', 'archived');
CREATE TYPE evaluation_type AS ENUM ('physical', 'physio', 'nutrition', 'integrated');
CREATE TYPE evaluation_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE plan_type AS ENUM ('training', 'therapeutic', 'nutrition', 'integrated');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded', 'partially_paid');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'bank_slip', 'cash', 'transfer');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'trial');
CREATE TYPE document_category AS ENUM ('evaluation', 'consent', 'prescription', 'report', 'photo', 'exam', 'contract', 'other');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'action_required');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'whatsapp', 'sms', 'push');
CREATE TYPE consent_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
CREATE TYPE sensitive_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE saas_plan_tier AS ENUM ('starter', 'professional', 'business', 'enterprise');
CREATE TYPE module_entitlement_status AS ENUM ('active', 'trial', 'expired', 'cancelled');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE weekday_type AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Extract tenant_id from JWT (Supabase Auth)
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt()->>'tenant_id')::uuid,
    (current_setting('app.current_tenant', true))::uuid
  );
$$;

-- Extract user_id from JWT (Supabase Auth)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Generate slug from text
CREATE OR REPLACE FUNCTION public.slugify(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(
        translate($1, 'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ',
                      'aaaaaaeeeeiiiioooouuuuyyncAAAAAAEEEEIIIIOOOOUUUUYYNC'),
        '[^a-z0-9\-]', '-', 'g'),
      '-+', '-', 'g')
  );
$$;

-- NOTE: user_has_role() and user_in_unit() are created in 00003_users.sql
-- because they depend on tables defined there (user_roles, roles, unit_memberships)
