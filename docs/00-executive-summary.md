# MODULA HEALTH — Executive Summary & Product Architecture Overview

## 1. Visao Geral do Produto

O **MODULA HEALTH** e uma plataforma SaaS modular para profissionais e estudantes de **Educacao Fisica**, **Fisioterapia** e **Nutricao**. Opera como modular monolith evolutivo com core obrigatorio e modulos compraveis, suportando desde autonomos ate centros multidisciplinares.

### Proposta de Valor

A plataforma combina em um unico ecossistema:

- Gestao operacional (agenda, unidades, equipe)
- Gestao comercial (CRM, funil, propostas, contratos)
- Gestao financeira (cobranca, comissoes, DRE)
- Avaliacao profissional (fisica, fisioterapeutica, nutricional)
- Prescricao (treinos, planos terapeuticos, planos alimentares)
- Acompanhamento e evolucao (monitoramento, desfechos clinicos)
- Educacao e formacao (cursos, estagio, supervisao)
- Coordenacao multidisciplinar (encaminhamentos, plano integrado)
- Inteligencia Artificial transversal (copilotos por area, analytics preditivo)
- Business Intelligence (dashboards, relatorios, metricas)

### Publico-Alvo

| Segmento | Perfil | Exemplo |
|----------|--------|---------|
| Autonomo | Profissional individual | Personal trainer, nutricionista solo |
| Equipe pequena | 2-5 profissionais | Studio de pilates, consultorio nutricional |
| Medio porte | 5-20 profissionais | Academia, clinica de fisioterapia |
| Grande porte | 20+ profissionais, multiplas unidades | Rede de clinicas, centro multidisciplinar |
| Academico | Estudantes + supervisores | Universidades com campo de estagio |
| Enterprise | Grandes operacoes + white-label | Franquias, redes nacionais |

---

## 2. Decisao Arquitetural Central

### Recomendacao: Modular Monolith Evolutivo

**Por que nao microservices desde o inicio?**

1. **Pragmatismo**: A complexidade operacional de microservices e desproporcional para uma equipe inicial de 4-5 devs
2. **Velocidade**: Monolito modular permite compartilhar tipos, validacoes e transacoes ACID trivialmente
3. **Deploy unico**: Cada modulo tem boundaries claras mas deploya como unidade
4. **Evolucao**: Modulos que precisam de escala independente (AI Suite, Analytics) podem ser extraidos quando necessario
5. **Event-driven desde o dia 1**: Eventos de dominio internos facilitam eventual extracao de servicos

### Alternativa futura: Microservices Seletivos

Na fase Enterprise (meses 13-18+), os seguintes modulos sao candidatos a extracao:

- **AI Service** — escala independente, GPU-bound
- **Analytics Service** — queries pesadas, read-replicas
- **Video Service** — WebRTC, streaming

---

## 3. Arquitetura de Alto Nivel

```
                    ┌─────────────────────────────────────┐
                    │           CLIENTES                   │
                    │  Web (Next.js) │ Mobile (React Native)│
                    │  Portal do Cliente                   │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │       API Gateway / BFF              │
                    └───────────────┬─────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
    ┌─────▼─────┐          ┌───────▼───────┐          ┌─────▼─────┐
    │   CORE    │          │  COMPARTILHADOS│          │  DOMINIO  │
    │ Obrigatorio│          │  (compraveis)  │          │(especificos│
    ├───────────┤          ├───────────────┤          ├───────────┤
    │ Auth      │          │ CRM           │          │ Ed.Fisica │
    │ Users     │          │ Agenda        │          │ Fisio     │
    │ Clients   │          │ Financeiro    │          │ Nutricao  │
    │ Records   │          │ Comunicacao   │          └───────────┘
    │ Documents │          │ Analytics     │
    │ Consent   │          │ Educacao      │     ┌───────────────┐
    │ Notif.    │          │ Portal App    │     │ MULTIDISCIPLINAR│
    │ Tenant    │          └───────────────┘     │ Aval.Integrada │
    │ Billing   │                                │ Care Path      │
    │ Audit     │          ┌───────────────┐     │ Habitos        │
    │ Portal    │          │   AI SUITE    │     │ Encaminhamento │
    └───────────┘          │ Orquestrador  │     │ Biblioteca     │
                           │ 8 Copilotos   │     └───────────────┘
                           └───────────────┘
          │                         │                         │
    ┌─────▼─────────────────────────▼─────────────────────────▼──┐
    │                    INFRAESTRUTURA                           │
    │  PostgreSQL │ Redis │ BullMQ │ S3/R2 │ Meilisearch │pgvector│
    └────────────────────────────────────────────────────────────┘
```

---

## 4. Principios Fundamentais

### Modularidade
- Core obrigatorio como base para todos os tenants
- Modulos como unidades de compra, ativacao e permissao
- Feature flags controlam visibilidade e acesso em runtime
- Dados nunca deletados em desativacao de modulo (soft-lock)

### Multi-tenancy
- Row-Level Security (RLS) com `tenant_id` em todas as tabelas
- Hierarquia: Tenant > Company > Unit
- Isolamento logico garantido pelo PostgreSQL

### Seguranca
- RBAC + ABAC hibrido para permissoes granulares
- Dados sensiveis com classificacao de nivel (1-4)
- Audit trail completa e imutavel
- LGPD-compliant com consentimentos explicitos

### IA Responsavel
- Human-in-the-loop: toda sugestao e rascunho para revisao
- Guardrails rigorosos: sem diagnosticos, sem prescricoes autonomas
- Permissoes: IA so acessa dados autorizados do usuario
- Auditoria completa de prompts e respostas

---

## 5. Numeros do Projeto

| Metrica | Valor |
|---------|-------|
| Total de modulos | 55 |
| Core obrigatorio | 11 modulos |
| Modulos compraveis | 44 modulos |
| Compartilhados | 34 modulos (62%) |
| Especificos EF | 8 modulos (15%) |
| Especificos Fisio | 10 modulos (18%) |
| Especificos Nutri | 11 modulos (20%) |
| Funcionalidades estimadas | ~950+ |
| Entidades de dominio | ~120+ |
| Eventos de dominio | ~180+ |
| Telas estimadas | ~250+ |
| Bundles comerciais | 11 |

### Distribuicao por Prioridade

| Fase | Periodo | Modulos | Foco |
|------|---------|---------|------|
| P0 — MVP | Meses 1-4 | 13 modulos | Personal Trainer (EF) |
| P1 — Complemento | Meses 3-5 | 3 modulos | Portal expandido, consentimentos |
| P2 — Fase 2 | Meses 5-8 | 9 modulos | Fisioterapia + CRM + Studio |
| P3 — Fase 3 | Meses 9-12 | 16 modulos | Nutricao + Multi + AI v1 |
| P4 — Enterprise | Meses 13-18 | 14 modulos | Especialidades + AI completa |

---

## 6. Stack Tecnologica (Resumo)

| Camada | Tecnologia |
|--------|-----------|
| Frontend Web | Next.js 15 + React 19 + TypeScript |
| UI | shadcn/ui + Tailwind CSS + Radix UI |
| Mobile | React Native (Expo) + TypeScript |
| Backend | Node.js + NestJS + TypeScript |
| ORM | Drizzle ORM |
| DB Principal | PostgreSQL 16 (Neon ou Supabase) |
| Cache | Redis (Upstash) |
| Event Bus | BullMQ (Redis-backed) |
| Storage | Cloudflare R2 |
| Search | Meilisearch |
| AI/LLM | OpenAI GPT-4o + Anthropic (fallback) |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions |
| Deploy | Vercel (web) + Railway (API) |

---

## 7. Modelo de Monetizacao

### Planos SaaS

| Plano | Publico | Modulos |
|-------|---------|---------|
| Starter | Autonomo | Core + Agenda + 1 area (EF/Fisio/Nutri basico) |
| Pro | Equipe | Starter + CRM + Financeiro + Portal + Monitoramento |
| Studio/Clinica | Medio porte | Pro + Facility/Clinic + Comunicacao + Analytics |
| Enterprise | Grande porte | Todos os modulos + Multi + AI Suite + Analytics |
| Academico | Instituicoes | Core + Educacao + areas de avaliacao |

### Mecanismos de Receita

- **Assinatura base** por plano
- **Modulos adicionais** (compra individual)
- **Bundles** com desconto
- **Add-ons** (AI Suite, Analytics avancado)
- **Limites por plano** (usuarios, clientes, storage)
- **Trials** de 7/14/30 dias por modulo
- **White-label** (Enterprise)

---

## Documentos Relacionados

- [01 — Product Architecture](./01-product-architecture.md)
- [02 — Module Catalog](./02-module-catalog.md)
- [03 — Domain Model](./03-domain-model.md)
- [04 — Technical Architecture](./04-technical-architecture.md)
- [05 — Permissions & Security](./05-permissions-security.md)
- [06 — AI Architecture](./06-ai-architecture.md)
- [07 — Integrations](./07-integrations.md)
- [08 — UX Architecture](./08-ux-architecture.md)
- [09 — Roadmap](./09-roadmap.md)
