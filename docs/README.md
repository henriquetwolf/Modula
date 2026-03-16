# MODULA HEALTH — Documentacao Arquitetural

> Plataforma SaaS modular, multi-tenant e multiunidade para profissionais e estudantes de Educacao Fisica, Fisioterapia e Nutricao.

---

## Indice de Documentos

| # | Documento | Descricao |
|---|----------|-----------|
| 00 | [Executive Summary](./00-executive-summary.md) | Visao geral do produto, decisao arquitetural, numeros, stack e monetizacao |
| 01 | [Product Architecture](./01-product-architecture.md) | Diagrama de arquitetura, hierarquia de modulos, dependencias, bundles comerciais |
| 02 | [Module Catalog](./02-module-catalog.md) | Inventario completo dos 55 modulos com funcionalidades, entidades, eventos e telas |
| 03 | [Domain Model](./03-domain-model.md) | Bounded contexts, entidades centrais, relacoes, regras de extensao JSONB |
| 04 | [Technical Architecture](./04-technical-architecture.md) | Stack, data strategy, monorepo, API, event bus, testes, migracoes, observabilidade |
| 05 | [Permissions & Security](./05-permissions-security.md) | RBAC+ABAC, 7 camadas de permissao, multi-tenant, billing, feature flags, LGPD |
| 06 | [AI Architecture](./06-ai-architecture.md) | Orquestracao, copilotos, RAG, guardrails, quotas, feedback loop, monitoramento |
| 07 | [Integrations](./07-integrations.md) | Mapa completo de integracoes externas com recomendacoes e prioridades |
| 08 | [UX Architecture](./08-ux-architecture.md) | Navegacao adaptativa, dashboards por perfil, ficha 360, mapa de paginas |
| 09 | [Roadmap](./09-roadmap.md) | MVP, roadmap faseado, fluxos end-to-end, riscos, tradeoffs, metricas |
| 10 | [Student Architecture](./10-student-architecture.md) | Arquitetura completa do Modula Health Student: modulos, billing, permissoes, IA, pesquisa cientifica, UX, dominio e migracao para profissional |

---

## Resumo do Projeto

| Metrica | Valor |
|---------|-------|
| Modulos totais | 64 (55 pro + 9 student) |
| Core obrigatorio | 11 |
| Modulos compraveis | 44 pro + 9 student |
| Funcionalidades | ~950+ |
| Entidades de dominio | ~120+ |
| Eventos de dominio | ~180+ |
| Telas estimadas | ~250+ |
| Bundles comerciais | 11 |

## Stack Principal

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Mobile | React Native (Expo) |
| Backend | NestJS + TypeScript |
| Banco | PostgreSQL 16 (RLS + JSONB + pgvector) |
| Cache | Redis |
| Events | BullMQ |
| AI | OpenAI + Anthropic |
| Monorepo | Turborepo |

## Roadmap

| Fase | Periodo | Foco |
|------|---------|------|
| MVP | Meses 1-4 | Personal Trainer (13 modulos) |
| Fase 2 | Meses 5-8 | Fisioterapia + Studio + CRM (9 modulos) |
| Fase 3 | Meses 9-12 | Nutricao + Multi + AI v1 (16 modulos) |
| Fase 4 | Meses 13-18 | Enterprise + Educacao + AI completa (14 modulos) |

---

## Prototipos Interativos

Dashboards HTML interativos disponveis em `/prototypes/`:

| Dashboard | Arquivo |
|-----------|---------|
| Profissional | `dashboard-profissional.html` |
| Gestor | `dashboard-gestor.html` |
| Cliente/Paciente | `dashboard-cliente.html` |
| Estudante | `dashboard-estudante.html` |
| Admin Master | `dashboard-admin-master.html` |

---

*Documentacao gerada para o projeto MODULA HEALTH.*
*Arquitetura: Modular Monolith Evolutivo.*
*Decisao: TypeScript full-stack, PostgreSQL com RLS, AI transversal com guardrails.*
