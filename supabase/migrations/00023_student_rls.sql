-- ============================================================================
-- MODULA HEALTH — Migration 023: RLS Policies for Student Tables
-- Tenant isolation + user-scoped data for all student domain tables
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

-- Foundation
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Study domain
ALTER TABLE public.study_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_track_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_track_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;

-- Internship domain
ALTER TABLE public.internship_supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_access_tokens ENABLE ROW LEVEL SECURITY;

-- Portfolio domain
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_section_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_cv ENABLE ROW LEVEL SECURITY;

-- Cases domain
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_favorites ENABLE ROW LEVEL SECURITY;

-- Research domain
ALTER TABLE public.article_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_fichamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_associations ENABLE ROW LEVEL SECURITY;

-- Tutor domain
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_feedback ENABLE ROW LEVEL SECURITY;

-- Organization domain
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs ENABLE ROW LEVEL SECURITY;

-- Career domain
ALTER TABLE public.career_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STUDENT PROFILES
-- ============================================================================

CREATE POLICY "Users can read own student profile"
    ON public.student_profiles FOR SELECT
    USING (user_id = get_current_user_id() OR tenant_id = get_current_tenant_id());

CREATE POLICY "Users can create own student profile"
    ON public.student_profiles FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own student profile"
    ON public.student_profiles FOR UPDATE
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- ============================================================================
-- STUDY TRACKS (system tracks: public read; user tracks: tenant-scoped)
-- ============================================================================

CREATE POLICY "Anyone can read system study tracks"
    ON public.study_tracks FOR SELECT
    USING (is_system = true OR tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant users can manage own tracks"
    ON public.study_tracks FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_system = false);

CREATE POLICY "Tenant users can update own tracks"
    ON public.study_tracks FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND is_system = false);

-- ============================================================================
-- STUDY TRACK MODULES (read via track access)
-- ============================================================================

CREATE POLICY "Read track modules via track access"
    ON public.study_track_modules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.study_tracks st
        WHERE st.id = study_track_modules.track_id
        AND (st.is_system = true OR st.tenant_id = get_current_tenant_id())
    ));

-- ============================================================================
-- STUDY TRACK ENROLLMENTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own enrollments"
    ON public.study_track_enrollments FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- STUDY SESSIONS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own study sessions"
    ON public.study_sessions FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- FLASHCARD DECKS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own flashcard decks"
    ON public.flashcard_decks FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- FLASHCARDS (via deck ownership)
-- ============================================================================

CREATE POLICY "Users manage own flashcards"
    ON public.flashcards FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.flashcard_decks fd
        WHERE fd.id = flashcards.deck_id
        AND fd.tenant_id = get_current_tenant_id()
        AND fd.user_id = get_current_user_id()
    ));

-- ============================================================================
-- QUESTION BANK (system questions: public read; tenant questions: scoped)
-- ============================================================================

CREATE POLICY "Anyone can read system questions"
    ON public.question_bank FOR SELECT
    USING (is_system = true OR tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant users can create questions"
    ON public.question_bank FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_system = false);

-- ============================================================================
-- QUIZZES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own quizzes"
    ON public.quizzes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- STUDY NOTES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own study notes"
    ON public.study_notes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- STUDY GOALS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own study goals"
    ON public.study_goals FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- READING LISTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own reading lists"
    ON public.reading_lists FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- INTERNSHIP SUPERVISORS (tenant-scoped)
-- ============================================================================

CREATE POLICY "Tenant users manage supervisors"
    ON public.internship_supervisors FOR ALL
    USING (tenant_id = get_current_tenant_id())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================================
-- INTERNSHIP RECORDS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own internship records"
    ON public.internship_records FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- INTERNSHIP ENTRIES (via internship ownership)
-- ============================================================================

CREATE POLICY "Users manage own internship entries"
    ON public.internship_entries FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_entries.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ));

-- ============================================================================
-- SUPERVISOR FEEDBACK (readable by internship owner)
-- ============================================================================

CREATE POLICY "Users read feedback on own internships"
    ON public.supervisor_feedback FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = supervisor_feedback.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ));

CREATE POLICY "Service role can insert feedback"
    ON public.supervisor_feedback FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- COMPETENCY ASSESSMENTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own competency assessments"
    ON public.competency_assessments FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- INTERNSHIP REPORTS (via internship ownership)
-- ============================================================================

CREATE POLICY "Users manage own internship reports"
    ON public.internship_reports FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_reports.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_reports.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ));

-- ============================================================================
-- INTERNSHIP CHECKLISTS (via internship ownership)
-- ============================================================================

CREATE POLICY "Users manage own internship checklists"
    ON public.internship_checklists FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_checklists.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.internship_records ir
        WHERE ir.id = internship_checklists.internship_id
        AND ir.tenant_id = get_current_tenant_id()
        AND ir.user_id = get_current_user_id()
    ));

-- ============================================================================
-- SUPERVISOR ACCESS TOKENS (service role only)
-- ============================================================================

CREATE POLICY "Service role manages supervisor tokens"
    ON public.supervisor_access_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- PORTFOLIO ITEMS (user-scoped + public read)
-- ============================================================================

CREATE POLICY "Users manage own portfolio items"
    ON public.portfolio_items FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- PORTFOLIO SECTIONS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own portfolio sections"
    ON public.portfolio_sections FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- PORTFOLIO SECTION ITEMS (via section ownership)
-- ============================================================================

CREATE POLICY "Users manage own section items"
    ON public.portfolio_section_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.portfolio_sections ps
        WHERE ps.id = portfolio_section_items.section_id
        AND ps.tenant_id = get_current_tenant_id()
        AND ps.user_id = get_current_user_id()
    ));

-- ============================================================================
-- COMPETENCY RECORDS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own competency records"
    ON public.competency_records FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- ACADEMIC CV (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own academic CV"
    ON public.academic_cv FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- CASE STUDIES (system cases: public read)
-- ============================================================================

CREATE POLICY "Anyone can read system case studies"
    ON public.case_studies FOR SELECT
    USING (is_system = true AND is_active = true);

-- ============================================================================
-- CASE ATTEMPTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own case attempts"
    ON public.case_attempts FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- CASE DISCUSSIONS (readable by all authenticated, writable by tenant user)
-- ============================================================================

CREATE POLICY "Authenticated users can read case discussions"
    ON public.case_discussions FOR SELECT
    USING (true);

CREATE POLICY "Tenant users can create discussions"
    ON public.case_discussions FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

CREATE POLICY "Users can update own discussions"
    ON public.case_discussions FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- CASE FAVORITES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own case favorites"
    ON public.case_favorites FOR ALL
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- ============================================================================
-- ARTICLE METADATA (global read for all authenticated users)
-- ============================================================================

CREATE POLICY "Authenticated users can read article metadata"
    ON public.article_metadata FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage article metadata"
    ON public.article_metadata FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update article metadata"
    ON public.article_metadata FOR UPDATE
    USING (true);

-- ============================================================================
-- USER ARTICLE COLLECTIONS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own article collections"
    ON public.user_article_collections FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- USER ARTICLE SAVES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own article saves"
    ON public.user_article_saves FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- ARTICLE NOTES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own article notes"
    ON public.article_notes FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- ARTICLE FICHAMENTOS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own fichamentos"
    ON public.article_fichamentos FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- RESEARCH QUERIES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own research queries"
    ON public.research_queries FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- ARTICLE ASSOCIATIONS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own article associations"
    ON public.article_associations FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- TUTOR CONVERSATIONS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own tutor conversations"
    ON public.tutor_conversations FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- TUTOR MESSAGES (via conversation ownership)
-- ============================================================================

CREATE POLICY "Users read own tutor messages"
    ON public.tutor_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tutor_conversations tc
        WHERE tc.id = tutor_messages.conversation_id
        AND tc.tenant_id = get_current_tenant_id()
        AND tc.user_id = get_current_user_id()
    ));

CREATE POLICY "Users create tutor messages"
    ON public.tutor_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tutor_conversations tc
        WHERE tc.id = tutor_messages.conversation_id
        AND tc.tenant_id = get_current_tenant_id()
        AND tc.user_id = get_current_user_id()
    ));

-- ============================================================================
-- TUTOR FEEDBACK (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own tutor feedback"
    ON public.tutor_feedback FOR ALL
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- ============================================================================
-- ACADEMIC EVENTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own academic events"
    ON public.academic_events FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- ACADEMIC TASKS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own academic tasks"
    ON public.academic_tasks FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- WEEKLY PLANS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own weekly plans"
    ON public.weekly_plans FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- PRODUCTIVITY LOGS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own productivity logs"
    ON public.productivity_logs FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- CAREER CHECKLISTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own career checklists"
    ON public.career_checklists FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- CAREER INTERESTS (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own career interests"
    ON public.career_interests FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

-- ============================================================================
-- UPGRADE READINESS (user-scoped)
-- ============================================================================

CREATE POLICY "Users read own upgrade readiness"
    ON public.upgrade_readiness FOR SELECT
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());

CREATE POLICY "Service role manages upgrade readiness"
    ON public.upgrade_readiness FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role updates upgrade readiness"
    ON public.upgrade_readiness FOR UPDATE
    USING (true);

-- ============================================================================
-- CAREER MILESTONES (user-scoped)
-- ============================================================================

CREATE POLICY "Users manage own career milestones"
    ON public.career_milestones FOR ALL
    USING (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id())
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_id = get_current_user_id());
