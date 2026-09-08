-- ============================================================================
-- MODULA HEALTH — Migration 032: Sorteio com multiplas unidades por premio
-- Um premio pode ter N unidades e sortear os N ganhadores de uma so vez.
-- ============================================================================

-- Quantas unidades cada premio distribui (quantos ganhadores ele tem).
ALTER TABLE public.raffle_prizes
    ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

ALTER TABLE public.raffle_prizes
    DROP CONSTRAINT IF EXISTS raffle_prizes_quantity_check;
ALTER TABLE public.raffle_prizes
    ADD CONSTRAINT raffle_prizes_quantity_check CHECK (quantity >= 1 AND quantity <= 1000);

-- Antes cada premio tinha no maximo um premiado (prize_id UNIQUE em raffle_draws).
-- Agora um premio pode ter varios premiados, entao removemos a unicidade do
-- prize_id e mantemos apenas um indice comum para as buscas por premio.
ALTER TABLE public.raffle_draws
    DROP CONSTRAINT IF EXISTS raffle_draws_prize_id_key;

CREATE INDEX IF NOT EXISTS idx_raffle_draws_prize ON public.raffle_draws(prize_id);

-- Continua valendo: uma pessoa (CPF) so pode ganhar uma vez por tenant
-- (indice idx_raffle_draws_unique_cpf, criado na migration 031).
