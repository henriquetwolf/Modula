# MODULA HEALTH

Plataforma SaaS modular, multi-tenant e multiunidade para profissionais e estudantes de **Educacao Fisica**, **Fisioterapia** e **Nutricao**.

## Visao Geral

O Modula Health e um **modular monolith evolutivo** que permite compra modular por funcionalidades, ativacao progressiva de modulos, integracao nativa entre areas, e uma camada transversal de IA.

### Numeros do Projeto

| Metrica | Valor |
|---------|-------|
| Modulos totais | 55 |
| Funcionalidades | ~950+ |
| Entidades de dominio | ~120+ |
| Eventos de dominio | ~180+ |
| Telas estimadas | ~250+ |

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Frontend Web | Next.js 15 + React 19 + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS + Radix UI |
| Mobile | React Native (Expo) + TypeScript |
| Backend | Node.js + NestJS + TypeScript |
| ORM | Drizzle ORM |
| DB Principal | PostgreSQL 16 (RLS + JSONB + pgvector) |
| Cache | Redis (Upstash) |
| Event Bus | BullMQ (Redis-backed) |
| AI/LLM | OpenAI GPT-4o + Anthropic (fallback) |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions |
| Deploy | Vercel (web) + Railway (API) |

## Documentacao Arquitetural

Toda a documentacao tecnica esta em [`/docs`](./docs/):

| Documento | Conteudo |
|----------|---------|
| [00 - Executive Summary](./docs/00-executive-summary.md) | Visao geral, decisao arquitetural, stack |
| [01 - Product Architecture](./docs/01-product-architecture.md) | Diagrama, hierarquia de modulos, dependencias |
| [02 - Module Catalog](./docs/02-module-catalog.md) | 55 modulos detalhados (13 atributos cada) |
| [03 - Domain Model](./docs/03-domain-model.md) | Bounded contexts, entidades, JSONB strategy |
| [04 - Technical Architecture](./docs/04-technical-architecture.md) | Stack, data strategy, monorepo, API, testes |
| [05 - Permissions & Security](./docs/05-permissions-security.md) | RBAC+ABAC, multi-tenant, LGPD |
| [06 - AI Architecture](./docs/06-ai-architecture.md) | Orquestracao, copilotos, RAG, guardrails |
| [07 - Integrations](./docs/07-integrations.md) | 18 integracoes externas mapeadas |
| [08 - UX Architecture](./docs/08-ux-architecture.md) | Navegacao adaptativa, dashboards, mapa de paginas |
| [09 - Roadmap](./docs/09-roadmap.md) | MVP, roadmap faseado, fluxos E2E, riscos |

## Prototipos Interativos

Dashboards HTML interativos em [`/prototypes`](./prototypes/):

- `dashboard-profissional.html` — Personal Trainer / Fisioterapeuta / Nutricionista
- `dashboard-gestor.html` — Owner / Manager de studio/clinica
- `dashboard-cliente.html` — Cliente / Paciente (mobile-first)
- `dashboard-estudante.html` — Estudante em estagio
- `dashboard-admin-master.html` — Admin da plataforma (god-mode)

## Roadmap

| Fase | Periodo | Foco |
|------|---------|------|
| **MVP** | Meses 1-4 | Personal Trainer (13 modulos core) |
| **Fase 2** | Meses 5-8 | Fisioterapia + Studio + CRM |
| **Fase 3** | Meses 9-12 | Nutricao + Multi + AI v1 |
| **Fase 4** | Meses 13-18 | Enterprise + Educacao + AI completa |

## Arquitetura

```
Modular Monolith Evolutivo
├── Core Obrigatorio (11 modulos)
├── Modulos Compartilhados (7 modulos)
├── Educacao Fisica (6 modulos)
├── Fisioterapia (8 modulos)
├── Nutricao (9 modulos)
├── Multidisciplinares (5 modulos)
└── AI Suite (9 modulos)
```

## Licenca

Proprietario — Modula Health. Todos os direitos reservados.
