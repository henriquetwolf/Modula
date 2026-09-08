-- ============================================================================
-- MODULA HEALTH — Migration 031: Sorteio (Encontro Brasileiro de Pilates)
-- Listas de inscritos, premios atrelados a uma lista e registro de premiados.
-- Cada CPF so pode ser premiado uma vez (validado na aplicacao + indice unico).
-- ============================================================================

-- ============================================================================
-- RAFFLE LISTS — segmentos de inscritos (ex.: Geral e uma lista reservada)
-- ============================================================================

CREATE TABLE public.raffle_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    name varchar(120) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER raffle_lists_updated_at
    BEFORE UPDATE ON public.raffle_lists
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_raffle_lists_tenant ON public.raffle_lists(tenant_id, sort_order);

-- ============================================================================
-- RAFFLE PARTICIPANTS — inscritos importados (nome completo + CPF)
-- ============================================================================

CREATE TABLE public.raffle_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    list_id uuid NOT NULL REFERENCES public.raffle_lists(id) ON DELETE CASCADE,

    full_name varchar(200) NOT NULL,
    -- Somente digitos, normalizado na importacao
    cpf varchar(14) NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now()
);

-- Reimportar a mesma lista nao duplica inscritos
CREATE UNIQUE INDEX idx_raffle_participants_unique ON public.raffle_participants(list_id, cpf);
CREATE INDEX idx_raffle_participants_list ON public.raffle_participants(list_id, full_name);
CREATE INDEX idx_raffle_participants_tenant_cpf ON public.raffle_participants(tenant_id, cpf);

-- ============================================================================
-- RAFFLE PRIZES — cada premio sorteia dentro de uma unica lista
-- ============================================================================

CREATE TABLE public.raffle_prizes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    list_id uuid NOT NULL REFERENCES public.raffle_lists(id) ON DELETE CASCADE,

    name varchar(200) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,

    status varchar(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'drawn')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER raffle_prizes_updated_at
    BEFORE UPDATE ON public.raffle_prizes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE INDEX idx_raffle_prizes_tenant ON public.raffle_prizes(tenant_id, sort_order);
CREATE INDEX idx_raffle_prizes_list ON public.raffle_prizes(list_id);

-- ============================================================================
-- RAFFLE DRAWS — premiados confirmados
-- Nome e CPF sao copiados no momento da confirmacao para preservar o resultado
-- mesmo que o inscrito seja removido depois.
-- ============================================================================

CREATE TABLE public.raffle_draws (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    prize_id uuid NOT NULL UNIQUE REFERENCES public.raffle_prizes(id) ON DELETE CASCADE,
    participant_id uuid REFERENCES public.raffle_participants(id) ON DELETE SET NULL,

    full_name varchar(200) NOT NULL,
    cpf varchar(14) NOT NULL,

    drawn_at timestamptz NOT NULL DEFAULT now()
);

-- Uma pessoa (CPF) so pode ganhar um premio por tenant
CREATE UNIQUE INDEX idx_raffle_draws_unique_cpf ON public.raffle_draws(tenant_id, cpf);
CREATE INDEX idx_raffle_draws_tenant ON public.raffle_draws(tenant_id, drawn_at DESC);

-- ============================================================================
-- RLS — isolamento por tenant
-- ============================================================================

ALTER TABLE public.raffle_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "raffle_lists_tenant" ON public.raffle_lists
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "raffle_participants_tenant" ON public.raffle_participants
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "raffle_prizes_tenant" ON public.raffle_prizes
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "raffle_draws_tenant" ON public.raffle_draws
    FOR ALL USING (tenant_id = get_current_tenant_id());
