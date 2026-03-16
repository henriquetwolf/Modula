-- ============================================================================
-- MODULA HEALTH — Migration 014: Allow users to read their own profile
-- Without requiring tenant_id in JWT (needed for post-onboarding flow)
-- ============================================================================

-- Users can always read their own profile by auth_user_id
CREATE POLICY "user_profiles_own_select" ON public.user_profiles
    FOR SELECT USING (auth_user_id = auth.uid());

-- Users can read their own professional profile
CREATE POLICY "professional_profiles_own_select" ON public.professional_profiles
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
    );
