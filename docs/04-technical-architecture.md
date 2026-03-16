# MODULA HEALTH — Technical Architecture

## 1. Technology Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend Web | Next.js 15 + React 19 + TypeScript | SSR, App Router, ecossistema maduro |
| UI Components | shadcn/ui + Tailwind CSS + Radix UI | Customizavel, acessivel, moderno |
| Mobile | React Native (Expo) + TypeScript | Code sharing com web, DX excelente |
| Backend | Node.js + NestJS + TypeScript | Modular por design, decorators, DI |
| ORM | Drizzle ORM | Type-safe, performante, migracao nativa |
| DB Principal | PostgreSQL 16 (Neon ou Supabase) | RLS, JSONB, pgvector, confiavel |
| Cache | Redis (Upstash) | Sessions, cache, rate limiting |
| Event Bus | BullMQ (Redis-backed) | Jobs, eventos async, retries |
| Object Storage | Cloudflare R2 | Compativel S3, sem egress fees |
| Auth | Better Auth ou Clerk | Multi-tenant auth, MFA, social login |
| Search | Meilisearch (Cloud) | Rapido, facil, typo-tolerant |
| Feature Flags | Unleash (self-hosted) | OSS, granular, API |
| Payments | Stripe + Asaas (BR) | Internacional + PIX nativo |
| WhatsApp | Evolution API (self-hosted) | Sem custo por mensagem |
| Email | Resend | DX moderno, barato |
| Video | Daily.co | WebRTC managed, SDK bom |
| AI/LLM | OpenAI (GPT-4o) + Anthropic (fallback) | Melhor custo-beneficio |
| Embeddings/RAG | OpenAI Embeddings + pgvector | Sem infra adicional |
| Analytics | PostHog (self-hosted) | Product analytics OSS |
| Observabilidade | Sentry + Better Stack | Errors + logs + uptime |
| CI/CD | GitHub Actions | Standard, integrado |
| Deploy | Vercel (web) + Railway/Render (API) | Managed, auto-scale |
| Monorepo | Turborepo | Fast builds, task caching |

---

## 2. Data Strategy

### 2.1 PostgreSQL — Banco Principal

#### Multi-tenant com Row-Level Security

```sql
-- Toda tabela de dados tem tenant_id
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON evaluations
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Setar tenant no inicio de cada request
SET LOCAL app.current_tenant = '<tenant-uuid>';
```

#### Indices e Performance

```sql
-- Indices compostos com tenant_id
CREATE INDEX idx_eval_tenant_client ON evaluations(tenant_id, client_id);
CREATE INDEX idx_eval_tenant_date ON evaluations(tenant_id, completed_at DESC);

-- Indices parciais por type
CREATE INDEX idx_eval_physical ON evaluations(client_id, completed_at)
    WHERE type = 'physical';

-- Indice GIN para queries em JSONB
CREATE INDEX idx_eval_metadata ON evaluations USING GIN (metadata);

-- Particionamento para tabelas de alto volume
CREATE TABLE audit_logs (
    id UUID,
    tenant_id UUID,
    created_at TIMESTAMPTZ,
    -- ...
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2024_q1 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

#### pgvector para AI/RAG

```sql
CREATE EXTENSION vector;

CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    source_type VARCHAR(50),  -- 'exercise', 'protocol', 'material'
    source_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),   -- OpenAI text-embedding-3-small
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_vector ON embeddings
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 2.2 Redis — Cache e Sessions

| Uso | TTL | Chave |
|-----|-----|-------|
| Sessions de usuario | 24h | `session:{sessionId}` |
| Feature flags (tenant) | 5min | `flags:{tenantId}` |
| Permissoes do usuario | 10min | `perms:{userId}:{tenantId}` |
| Config do tenant | 15min | `tenant:{tenantId}:config` |
| Rate limiting | Sliding window | `rate:{key}:{window}` |
| Cache de queries | 1-5min | `cache:{queryHash}` |

### 2.3 Meilisearch — Full-text Search

| Indice | Campos | Uso |
|--------|--------|-----|
| `clients` | name, email, cpf, tags | Busca de clientes |
| `exercises` | name, description, muscleGroup, category | Biblioteca de exercicios |
| `protocols` | name, description, specialty, area | Protocolos clinicos |
| `materials` | name, description, type, area | Materiais educativos |
| `records` | notes, entries (text content) | Busca no prontuario |

### 2.4 Object Storage (S3/R2)

| Bucket | Conteudo | Acesso |
|--------|----------|--------|
| `documents` | Exames, laudos, contratos, certificados | Privado (signed URLs) |
| `media` | Fotos de evolucao, diario alimentar | Privado |
| `exercises` | Videos e imagens de exercicios | Publico (CDN) |
| `exports` | Relatorios PDF, exportacoes | Privado (expiravel) |
| `avatars` | Fotos de perfil | Publico |

---

## 3. Monorepo Structure

```
modula-health/
├── apps/
│   ├── web/                     # Next.js 15 frontend
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Login, registro, recovery
│   │   │   ├── (dashboard)/     # Dashboard por perfil
│   │   │   ├── (professional)/  # Area do profissional
│   │   │   ├── (manager)/       # Area do gestor
│   │   │   ├── (client)/        # Portal do cliente
│   │   │   ├── (student)/       # Area do estudante
│   │   │   └── (admin)/         # Admin do sistema
│   │   ├── components/          # Componentes React
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilitarios
│   │   └── styles/              # Global styles
│   │
│   ├── mobile/                  # React Native (Expo)
│   │   ├── app/                 # Expo Router
│   │   ├── components/          # Componentes RN
│   │   └── hooks/               # Hooks compartilhados
│   │
│   └── api/                     # NestJS backend
│       └── src/
│           ├── core/            # Modulos core
│           │   ├── auth/
│           │   │   ├── auth.module.ts
│           │   │   ├── auth.controller.ts
│           │   │   ├── auth.service.ts
│           │   │   ├── guards/
│           │   │   ├── strategies/
│           │   │   └── dto/
│           │   ├── users/
│           │   ├── clients/
│           │   ├── records/
│           │   ├── documents/
│           │   ├── consent/
│           │   ├── notifications/
│           │   ├── tenant/
│           │   ├── billing/
│           │   ├── audit/
│           │   └── portal/
│           │
│           ├── modules/         # Modulos compartilhados
│           │   ├── crm/
│           │   ├── agenda/
│           │   ├── financial/
│           │   ├── communication/
│           │   ├── analytics/
│           │   ├── education/
│           │   └── portal-app/
│           │
│           ├── domains/         # Modulos de dominio
│           │   ├── fitness/
│           │   │   ├── evaluation/
│           │   │   ├── training/
│           │   │   ├── monitoring/
│           │   │   ├── performance/
│           │   │   ├── facility/
│           │   │   └── school/
│           │   ├── physio/
│           │   │   ├── evaluation/
│           │   │   ├── treatment/
│           │   │   ├── progress/
│           │   │   ├── exercises/
│           │   │   ├── specialties/
│           │   │   ├── clinic/
│           │   │   ├── remote/
│           │   │   └── outcomes/
│           │   ├── nutrition/
│           │   │   ├── evaluation/
│           │   │   ├── mealplan/
│           │   │   ├── progress/
│           │   │   ├── foodlog/
│           │   │   ├── supplements/
│           │   │   ├── specialties/
│           │   │   ├── remote/
│           │   │   ├── outcomes/
│           │   │   └── office/
│           │   └── multidisciplinary/
│           │       ├── evaluation/
│           │       ├── careplan/
│           │       ├── habits/
│           │       ├── referral/
│           │       └── library/
│           │
│           ├── ai/              # AI Suite
│           │   ├── orchestrator/
│           │   ├── copilots/
│           │   │   ├── commercial/
│           │   │   ├── ops/
│           │   │   ├── fitness/
│           │   │   ├── physio/
│           │   │   ├── nutrition/
│           │   │   ├── multi/
│           │   │   ├── tutor/
│           │   │   └── analytics/
│           │   └── rag/
│           │
│           ├── shared/          # Shared infrastructure
│           │   ├── database/
│           │   │   ├── drizzle.config.ts
│           │   │   ├── schema/
│           │   │   └── migrations/
│           │   ├── events/
│           │   │   ├── event-bus.module.ts
│           │   │   └── handlers/
│           │   ├── guards/
│           │   │   ├── tenant.guard.ts
│           │   │   ├── module.guard.ts
│           │   │   ├── permission.guard.ts
│           │   │   └── rate-limit.guard.ts
│           │   ├── interceptors/
│           │   │   ├── audit.interceptor.ts
│           │   │   └── tenant.interceptor.ts
│           │   └── utils/
│           │
│           └── infra/           # Infrastructure config
│               ├── config/
│               ├── queue/
│               ├── storage/
│               └── search/
│
├── packages/                    # Shared packages
│   ├── shared-types/            # TypeScript types
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── events/
│   │   │   ├── api/
│   │   │   └── enums/
│   │   └── package.json
│   │
│   ├── ui/                      # Design system
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   ├── validators/              # Zod schemas
│   │   ├── src/
│   │   │   ├── evaluation.schema.ts
│   │   │   ├── plan.schema.ts
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── config/                  # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── tools/
│   ├── migrations/              # DB migrations
│   └── seeds/                   # Seed data
│
├── turbo.json                   # Turborepo config
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace
└── README.md
```

---

## 4. API Strategy

### 4.1 Abordagem Hibrida

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **REST** | CRUD e operacoes simples (90% das rotas) | `GET /api/v1/clients`, `POST /api/v1/evaluations` |
| **tRPC** | Type-safety end-to-end (frontend-backend) | Dashboard queries, formularios complexos |
| **Webhooks** | Integracoes externas | Stripe webhooks, Evolution API |
| **SSE** | Notificacoes real-time | Central de notificacoes, atualizacoes de agenda |

### 4.2 Versionamento

```
API-Version: 2024-01-15
```

Headers-based versioning para permitir evolucao gradual sem quebrar clientes existentes.

### 4.3 Estrutura de Endpoint REST

```
# Core
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/users
POST   /api/v1/clients
GET    /api/v1/clients/:id
GET    /api/v1/clients/:id/records

# Modulos
GET    /api/v1/agenda/appointments
POST   /api/v1/agenda/appointments
GET    /api/v1/crm/leads
POST   /api/v1/crm/leads
GET    /api/v1/financial/payments

# Dominios
POST   /api/v1/ef/evaluations
POST   /api/v1/ef/training-plans
POST   /api/v1/fisio/evaluations
POST   /api/v1/nutri/evaluations
POST   /api/v1/nutri/meal-plans

# AI
POST   /api/v1/ai/copilot/ef/suggest-training
POST   /api/v1/ai/copilot/fisio/generate-soap
POST   /api/v1/ai/copilot/nutri/suggest-plan
POST   /api/v1/ai/analytics/query
```

### 4.4 Module Guard Middleware

```typescript
async function moduleGuard(moduleCode: string) {
  return async (req, res, next) => {
    const tenant = req.tenant;
    const isActive = await featureService.isModuleActive(tenant.id, moduleCode);
    if (!isActive) return res.status(403).json({ error: 'Module not active' });
    next();
  };
}

// NestJS decorator
@UseGuards(ModuleGuard('ef.training'))
@Controller('ef/training-plans')
export class TrainingPlanController {
  // ...
}
```

### 4.5 Tenant Resolution Middleware

```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const tenantSlug = req.headers['x-tenant-slug'] || extractFromSubdomain(req);
    const tenant = await this.tenantService.resolveBySlug(tenantSlug);

    if (!tenant) throw new NotFoundException('Tenant not found');

    req.tenant = tenant;

    await this.db.execute(
      sql`SET LOCAL app.current_tenant = ${tenant.id}`
    );

    next();
  }
}
```

---

## 5. Event Bus Architecture

### 5.1 BullMQ Configuration

```typescript
const eventBusConfig = {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
};
```

### 5.2 Event Publishing

```typescript
@Injectable()
export class EventPublisher {
  constructor(private readonly queue: Queue) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    await this.queue.add(event.type, {
      id: randomUUID(),
      type: event.type,
      tenantId: event.tenantId,
      payload: event.payload,
      metadata: {
        timestamp: new Date().toISOString(),
        userId: event.userId,
        correlationId: event.correlationId,
      },
    });
  }
}
```

### 5.3 Event Consumption

```typescript
@Processor('domain-events')
export class NotificationEventHandler {
  @Process('AppointmentScheduled')
  async handleAppointmentScheduled(job: Job<AppointmentScheduledEvent>) {
    const { payload, metadata } = job.data;
    await this.notificationService.send({
      userId: payload.clientId,
      type: 'appointment_reminder',
      data: { date: payload.scheduledAt, professional: payload.professionalName },
    });
  }

  @Process('PaymentOverdue')
  async handlePaymentOverdue(job: Job<PaymentOverdueEvent>) {
    // Enviar lembrete de pagamento
  }
}
```

---

## 6. Testing Strategy

### 6.1 Piramide de Testes

| Tipo | Ferramenta | Cobertura | Foco |
|------|-----------|-----------|------|
| Unit | Vitest | Logica de dominio, validacoes, transformacoes | Rapido, isolado |
| Integration | Vitest + testcontainers | APIs com banco real, fluxos entre modulos | Realista |
| E2E Web | Playwright | Fluxos criticos end-to-end | Confianca de usuario |
| E2E Mobile | Detox | Fluxos mobile | Confianca mobile |
| RLS | Suite dedicada | Isolamento multi-tenant | Seguranca |
| Contract | Pact ou custom | Contratos entre modulos | Estabilidade |

### 6.2 Testes de RLS (Criticos)

```typescript
describe('RLS Isolation', () => {
  it('should not allow Tenant A to access Tenant B data', async () => {
    // Setup: criar dados para Tenant A e Tenant B
    const tenantA = await createTenant('A');
    const tenantB = await createTenant('B');
    const clientA = await createClient(tenantA.id);
    const clientB = await createClient(tenantB.id);

    // Act: tentar acessar client de B como A
    await db.execute(sql`SET LOCAL app.current_tenant = ${tenantA.id}`);
    const result = await db.select().from(clients).where(eq(clients.id, clientB.id));

    // Assert: nenhum resultado
    expect(result).toHaveLength(0);
  });

  it('should isolate evaluations between tenants', async () => {
    // Similar pattern for each table
  });
});
```

### 6.3 Testes de Contrato entre Modulos

```typescript
describe('Module Contract: ef.training -> ef.evaluation', () => {
  it('should access evaluation data through module interface only', async () => {
    const evaluation = await evaluationModule.getById(evalId);
    expect(evaluation).toMatchSchema(EvaluationPublicInterface);
  });

  it('should not access internal evaluation repository directly', () => {
    // Verificar que o modulo de treino nao importa internals da avaliacao
  });
});
```

---

## 7. Database Migrations

### 7.1 Drizzle Kit

```typescript
// drizzle.config.ts
export default defineConfig({
  schema: './src/shared/database/schema/*',
  out: './tools/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
```

### 7.2 Migrations por Modulo

```
tools/migrations/
├── core/
│   ├── 0001_create_tenants.sql
│   ├── 0002_create_users.sql
│   ├── 0003_create_clients.sql
│   ├── 0004_create_evaluations_base.sql
│   └── 0005_create_audit_logs.sql
├── modules/
│   ├── crm/
│   │   ├── 0001_create_leads.sql
│   │   └── 0002_create_pipelines.sql
│   ├── agenda/
│   │   ├── 0001_create_appointments.sql
│   │   └── 0002_create_rooms.sql
│   └── financial/
│       └── 0001_create_payments.sql
├── domains/
│   ├── fitness/
│   ├── physio/
│   └── nutrition/
└── ai/
    └── 0001_create_embeddings.sql
```

### 7.3 Regras de Migracao

1. Cada migracao tem rollback obrigatorio
2. Migracoes de dados separadas de schema
3. Migracoes testadas em ambiente de staging antes de producao
4. Feature flags para migracoes de longa duracao (blue-green)
5. Cada modulo mantem suas proprias migracoes

---

## 8. Observability

### 8.1 Logging

```typescript
// Structured logging com contexto
logger.info('Evaluation completed', {
  tenantId: tenant.id,
  userId: user.id,
  clientId: client.id,
  evaluationType: 'physical',
  duration: endTime - startTime,
  module: 'ef.evaluation',
});
```

### 8.2 Metrics

| Metrica | Tipo | Uso |
|---------|------|-----|
| `http_request_duration` | Histogram | Latencia de API |
| `db_query_duration` | Histogram | Performance de queries |
| `event_processing_time` | Histogram | Tempo de processamento de eventos |
| `active_tenants` | Gauge | Tenants ativos |
| `ai_requests_total` | Counter | Requisicoes de IA |
| `module_activation_total` | Counter | Ativacoes de modulo |
| `rls_violation_attempts` | Counter | Tentativas de violacao de RLS |

### 8.3 Error Tracking

```typescript
// Sentry com contexto de tenant
Sentry.setContext('tenant', {
  id: tenant.id,
  slug: tenant.slug,
  plan: tenant.plan,
});

Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

---

## 9. Security Checklist

- [ ] RLS ativado em todas as tabelas com `tenant_id`
- [ ] Testes automatizados de isolamento de tenant
- [ ] Rate limiting por tenant e por usuario
- [ ] HTTPS obrigatorio
- [ ] Headers de seguranca (HSTS, CSP, X-Frame-Options)
- [ ] Validacao de input com Zod em todas as rotas
- [ ] Sanitizacao de output (XSS prevention)
- [ ] SQL injection prevention (parametrized queries via Drizzle)
- [ ] CORS configurado por tenant
- [ ] Audit trail em todas as operacoes sensiveis
- [ ] Criptografia de dados sensiveis at-rest
- [ ] Rotacao de secrets/keys
- [ ] Backup automatizado com teste de restore
- [ ] Vulnerability scanning (Snyk/Dependabot)
- [ ] Penetration testing antes de launch
