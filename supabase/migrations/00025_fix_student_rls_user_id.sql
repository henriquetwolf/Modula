-- ============================================================================
-- MODULA HEALTH — Migration 025: Fix RLS user_id mismatch in student tables
--
-- Problem: get_current_user_id() returns auth.uid() (auth.users.id)
-- but user_id columns in student tables reference user_profiles.id.
-- These are different UUIDs, so all RLS policies silently fail.
--
-- Solution: Create get_current_user_profile_id() that resolves the correct ID,
-- then drop & recreate all affected policies from migration 00023.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================================
-- STUDENT PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own student profile" ON public.student_profiles;
CREATE POLICY "Users can read own student profile"
    ON public.student_profiles FOR SELECT
    USING (user_id = get_current_user_profile_id() OR tenant_id = get_current_tenant_id());

DROP POLICY IF EXISTS "Users can create own student profile" ON public.student_profiles;
CREATE POLICY "Users can create own student profile"
    ON public.student_profiles FOR INSERT
    WITH CHECK (user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users can update own student profile" ON public.student_profiles;
CREATE POLICY "Users can update own student profile"
    ON public.student_profiles FOR UPDATE
    USING (user_id = get_current_user_profile_id())
    WITH CHECK (user_id = get_current_user_profile_id());

-- ============================================================================
-- STUDY DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own enrollments" ON public.study_track_enrollments;
CREATE POLICY "Users manage own enrollments"
    ON public.study_track_enrollments FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own study sessions" ON public.study_sessions;
CREATE POLICY "Users manage own study sessions"
    ON public.study_sessions FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own flashcard decks" ON public.flashcard_decks;
CREATE POLICY "Users manage own flashcard decks"
    ON public.flashcard_decks FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own flashcards" ON public.flashcards;
CREATE POLICY "Users manage own flashcards"
    ON public.flashcards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own flashcards" ON public.flashcards;
CREATE POLICY "Users insert own flashcards"
    ON public.flashcards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users update own flashcards" ON public.flashcards;
CREATE POLICY "Users update own flashcards"
    ON public.flashcards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users delete own flashcards" ON public.flashcards;
CREATE POLICY "Users delete own flashcards"
    ON public.flashcards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users manage own quizzes" ON public.quizzes;
CREATE POLICY "Users manage own quizzes"
    ON public.quizzes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own study notes" ON public.study_notes;
CREATE POLICY "Users manage own study notes"
    ON public.study_notes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own study goals" ON public.study_goals;
CREATE POLICY "Users manage own study goals"
    ON public.study_goals FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own reading lists" ON public.reading_lists;
CREATE POLICY "Users manage own reading lists"
    ON public.reading_lists FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

-- ============================================================================
-- INTERNSHIP DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own internship records" ON public.internship_records;
CREATE POLICY "Users manage own internship records"
    ON public.internship_records FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own internship entries" ON public.internship_entries;
CREATE POLICY "Users manage own internship entries"
    ON public.internship_entries FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own internship entries" ON public.internship_entries;
CREATE POLICY "Users insert own internship entries"
    ON public.internship_entries FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users update own internship entries" ON public.internship_entries;
CREATE POLICY "Users update own internship entries"
    ON public.internship_entries FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users delete own internship entries" ON public.internship_entries;
CREATE POLICY "Users delete own internship entries"
    ON public.internship_entries FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users read own supervisor feedback" ON public.supervisor_feedback;
CREATE POLICY "Users read own supervisor feedback"
    ON public.supervisor_feedback FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = supervisor_feedback.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users manage own competency assessments" ON public.competency_assessments;
CREATE POLICY "Users manage own competency assessments"
    ON public.competency_assessments FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own internship reports" ON public.internship_reports;
CREATE POLICY "Users manage own internship reports"
    ON public.internship_reports FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_reports.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own internship reports" ON public.internship_reports;
CREATE POLICY "Users insert own internship reports"
    ON public.internship_reports FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_reports.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users update own internship reports" ON public.internship_reports;
CREATE POLICY "Users update own internship reports"
    ON public.internship_reports FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_reports.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users manage own internship checklists" ON public.internship_checklists;
CREATE POLICY "Users manage own internship checklists"
    ON public.internship_checklists FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_checklists.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own internship checklists" ON public.internship_checklists;
CREATE POLICY "Users insert own internship checklists"
    ON public.internship_checklists FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_checklists.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users update own internship checklists" ON public.internship_checklists;
CREATE POLICY "Users update own internship checklists"
    ON public.internship_checklists FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_checklists.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_profile_id()
    ));

-- ============================================================================
-- PORTFOLIO DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own portfolio items" ON public.portfolio_items;
CREATE POLICY "Users manage own portfolio items"
    ON public.portfolio_items FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own portfolio sections" ON public.portfolio_sections;
CREATE POLICY "Users manage own portfolio sections"
    ON public.portfolio_sections FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own portfolio section items" ON public.portfolio_section_items;
CREATE POLICY "Users manage own portfolio section items"
    ON public.portfolio_section_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own portfolio section items" ON public.portfolio_section_items;
CREATE POLICY "Users insert own portfolio section items"
    ON public.portfolio_section_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users update own portfolio section items" ON public.portfolio_section_items;
CREATE POLICY "Users update own portfolio section items"
    ON public.portfolio_section_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users delete own portfolio section items" ON public.portfolio_section_items;
CREATE POLICY "Users delete own portfolio section items"
    ON public.portfolio_section_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users manage own competency records" ON public.competency_records;
CREATE POLICY "Users manage own competency records"
    ON public.competency_records FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own academic CV" ON public.academic_cv;
CREATE POLICY "Users manage own academic CV"
    ON public.academic_cv FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

-- ============================================================================
-- CASES DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own case attempts" ON public.case_attempts;
CREATE POLICY "Users manage own case attempts"
    ON public.case_attempts FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Tenant users can create discussions" ON public.case_discussions;
CREATE POLICY "Tenant users can create discussions"
    ON public.case_discussions FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users can update own discussions" ON public.case_discussions;
CREATE POLICY "Users can update own discussions"
    ON public.case_discussions FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own case favorites" ON public.case_favorites;
CREATE POLICY "Users manage own case favorites"
    ON public.case_favorites FOR ALL
    USING (user_id = get_current_user_profile_id())
    WITH CHECK (user_id = get_current_user_profile_id());

-- ============================================================================
-- RESEARCH DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own article collections" ON public.user_article_collections;
CREATE POLICY "Users manage own article collections"
    ON public.user_article_collections FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own article saves" ON public.user_article_saves;
CREATE POLICY "Users manage own article saves"
    ON public.user_article_saves FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own article notes" ON public.article_notes;
CREATE POLICY "Users manage own article notes"
    ON public.article_notes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own fichamentos" ON public.article_fichamentos;
CREATE POLICY "Users manage own fichamentos"
    ON public.article_fichamentos FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own research queries" ON public.research_queries;
CREATE POLICY "Users manage own research queries"
    ON public.research_queries FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own article associations" ON public.article_associations;
CREATE POLICY "Users manage own article associations"
    ON public.article_associations FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

-- ============================================================================
-- TUTOR DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Users manage own tutor conversations"
    ON public.tutor_conversations FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users read own tutor messages" ON public.tutor_messages;
CREATE POLICY "Users read own tutor messages"
    ON public.tutor_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tutor_conversations tc
        WHERE tc.id = tutor_messages.conversation_id
        AND tc.tenant_id = get_current_tenant_id()
        AND tc.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users insert own tutor messages" ON public.tutor_messages;
CREATE POLICY "Users insert own tutor messages"
    ON public.tutor_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tutor_conversations tc
        WHERE tc.id = tutor_messages.conversation_id
        AND tc.tenant_id = get_current_tenant_id()
        AND tc.user_id = get_current_user_profile_id()
    ));

DROP POLICY IF EXISTS "Users manage own tutor feedback" ON public.tutor_feedback;
CREATE POLICY "Users manage own tutor feedback"
    ON public.tutor_feedback FOR ALL
    USING (user_id = get_current_user_profile_id())
    WITH CHECK (user_id = get_current_user_profile_id());

-- ============================================================================
-- ORGANIZATION DOMAIN
-- ============================================================================

DROP POLICY IF EXISTS "Users manage own academic events" ON public.academic_events;
CREATE POLICY "Users manage own academic events"
    ON public.academic_events FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own academic tasks" ON public.academic_tasks;
CREATE POLICY "Users manage own academic tasks"
    ON public.academic_tasks FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own weekly plans" ON public.weekly_plans;
CREATE POLICY "Users manage own weekly plans"
    ON public.weekly_plans FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own productivity logs" ON public.productivity_logs;
CREATE POLICY "Users manage own productivity logs"
    ON public.productivity_logs FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own career checklists" ON public.career_checklists;
CREATE POLICY "Users manage own career checklists"
    ON public.career_checklists FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own career interests" ON public.career_interests;
CREATE POLICY "Users manage own career interests"
    ON public.career_interests FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users read own upgrade readiness" ON public.upgrade_readiness;
CREATE POLICY "Users read own upgrade readiness"
    ON public.upgrade_readiness FOR SELECT
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());

DROP POLICY IF EXISTS "Users manage own career milestones" ON public.career_milestones;
CREATE POLICY "Users manage own career milestones"
    ON public.career_milestones FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_profile_id());
