-- ============================================================================
-- MODULA HEALTH — Migration 020: Scientific Research & Academic Library
-- Article metadata (global cache), user collections, notes, fichamentos
-- ============================================================================

-- ============================================================================
-- ARTICLE METADATA (shared global cache — no tenant_id)
-- ============================================================================

CREATE TABLE public.article_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiers (deduplication keys)
    doi text UNIQUE,
    pmid text UNIQUE,
    pmcid text,
    openalex_id text,
    semantic_scholar_id text,

    -- Core metadata
    title text NOT NULL,
    abstract text,
    authors jsonb NOT NULL DEFAULT '[]',
    journal_name text,
    journal_issn text,
    publisher text,

    -- Publication info
    publication_date date,
    publication_year smallint,
    volume text,
    issue text,
    pages text,

    -- Classification
    study_type varchar(50),
    language varchar(10) DEFAULT 'en',
    keywords text[] NOT NULL DEFAULT '{}',
    mesh_terms text[] NOT NULL DEFAULT '{}',
    concepts jsonb NOT NULL DEFAULT '[]',

    -- Access
    is_open_access boolean NOT NULL DEFAULT false,
    oa_url text,
    license text,
    doi_url text,

    -- Metrics
    cited_by_count integer DEFAULT 0,
    references_count integer DEFAULT 0,

    -- Provenance
    source_apis text[] NOT NULL DEFAULT '{}',
    raw_data jsonb NOT NULL DEFAULT '{}',

    -- Search
    embedding vector(1536),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(abstract, '')), 'B')
    ) STORED,

    fetched_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER article_metadata_updated_at
    BEFORE UPDATE ON public.article_metadata
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Core indexes
CREATE INDEX idx_article_doi ON public.article_metadata(doi) WHERE doi IS NOT NULL;
CREATE INDEX idx_article_pmid ON public.article_metadata(pmid) WHERE pmid IS NOT NULL;
CREATE INDEX idx_article_year ON public.article_metadata(publication_year);
CREATE INDEX idx_article_oa ON public.article_metadata(is_open_access) WHERE is_open_access = true;

-- Search indexes
CREATE INDEX idx_article_search_vector ON public.article_metadata USING GIN (search_vector);
CREATE INDEX idx_article_keywords ON public.article_metadata USING GIN (keywords);
CREATE INDEX idx_article_mesh ON public.article_metadata USING GIN (mesh_terms);

-- Similarity (deduplication)
CREATE INDEX idx_article_title_trgm ON public.article_metadata USING GIN (title gin_trgm_ops);

-- Vector search
CREATE INDEX idx_article_embedding ON public.article_metadata
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- USER ARTICLE COLLECTIONS
-- ============================================================================

CREATE TABLE public.user_article_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    title varchar(200) NOT NULL,
    description text,
    color varchar(7),
    is_default boolean NOT NULL DEFAULT false,
    article_count integer NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_article_collections_updated_at
    BEFORE UPDATE ON public.user_article_collections
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_user_collections_user ON public.user_article_collections(tenant_id, user_id);

-- ============================================================================
-- USER ARTICLE SAVES
-- ============================================================================

CREATE TABLE public.user_article_saves (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    article_id uuid NOT NULL REFERENCES public.article_metadata(id) ON DELETE CASCADE,
    collection_id uuid REFERENCES public.user_article_collections(id) ON DELETE SET NULL,

    tags text[] NOT NULL DEFAULT '{}',
    notes text,
    is_favorite boolean NOT NULL DEFAULT false,
    read_status varchar(20) NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread', 'reading', 'read')),

    saved_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_saves_unique ON public.user_article_saves(tenant_id, user_id, article_id);
CREATE INDEX idx_user_saves_user ON public.user_article_saves(tenant_id, user_id, saved_at DESC);
CREATE INDEX idx_user_saves_collection ON public.user_article_saves(collection_id);
CREATE INDEX idx_user_saves_favorite ON public.user_article_saves(tenant_id, user_id)
    WHERE is_favorite = true;

-- ============================================================================
-- ARTICLE NOTES (highlights, comments, questions)
-- ============================================================================

CREATE TABLE public.article_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    article_id uuid NOT NULL REFERENCES public.article_metadata(id) ON DELETE CASCADE,

    content text NOT NULL,
    highlight_text text,
    note_type varchar(20) NOT NULL DEFAULT 'comment' CHECK (note_type IN ('highlight', 'comment', 'question', 'insight')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER article_notes_updated_at
    BEFORE UPDATE ON public.article_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_article_notes_user_article ON public.article_notes(tenant_id, user_id, article_id);

-- ============================================================================
-- ARTICLE FICHAMENTOS (structured summaries)
-- ============================================================================

CREATE TABLE public.article_fichamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    article_id uuid NOT NULL REFERENCES public.article_metadata(id) ON DELETE CASCADE,

    -- Structured fichamento fields
    objective text,
    methodology text,
    main_findings text,
    conclusions text,
    limitations text,
    relevance_to_practice text,
    study_level varchar(50),
    personal_notes text,

    -- AI generation metadata
    is_ai_generated boolean NOT NULL DEFAULT false,
    ai_model varchar(50),
    ai_prompt_tokens integer,
    ai_completion_tokens integer,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER article_fichamentos_updated_at
    BEFORE UPDATE ON public.article_fichamentos
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE UNIQUE INDEX idx_fichamentos_user_article ON public.article_fichamentos(tenant_id, user_id, article_id);

-- ============================================================================
-- RESEARCH QUERIES (search history)
-- ============================================================================

CREATE TABLE public.research_queries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    query_text text NOT NULL,
    filters jsonb NOT NULL DEFAULT '{}',
    results_count integer NOT NULL DEFAULT 0,
    apis_searched text[] NOT NULL DEFAULT '{}',

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_queries_user ON public.research_queries(tenant_id, user_id, created_at DESC);

-- ============================================================================
-- ARTICLE ASSOCIATIONS (links to other entities)
-- ============================================================================

CREATE TYPE article_assoc_target AS ENUM (
    'case_study', 'study_track', 'internship', 'discipline', 'portfolio_item', 'study_note'
);

CREATE TABLE public.article_associations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    article_id uuid NOT NULL REFERENCES public.article_metadata(id) ON DELETE CASCADE,

    target_type article_assoc_target NOT NULL,
    target_id uuid NOT NULL,
    notes text,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_article_assoc_unique ON public.article_associations(user_id, article_id, target_type, target_id);
CREATE INDEX idx_article_assoc_target ON public.article_associations(target_type, target_id);
