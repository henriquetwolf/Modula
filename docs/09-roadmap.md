# MODULA HEALTH — MVP, Roadmap & End-to-End Flows

## 1. Recomendacao de MVP

### Escopo (3-4 meses com equipe de 4-5 devs)

**Foco: Personal Trainer** — maior mercado enderecavel e caso de uso mais simples. Valida core, billing, agenda e fluxo completo de avaliacao-prescricao-acompanhamento.

| Modulo | Funcionalidades no MVP |
|--------|----------------------|
| core.auth | Login email/senha, convite, recuperacao de senha |
| core.users | Cadastro de profissionais, roles basicos |
| core.clients | Cadastro completo, ficha 360 basica, busca |
| core.records | Timeline basica do prontuario |
| core.documents | Upload de arquivos, categorizacao |
| core.notifications | Central de notificacoes in-app |
| core.tenant | Config de empresa, 1 unidade |
| core.billing | Plano, modulos, integracao Stripe |
| core.portal | Portal basico do cliente |
| mod.agenda | Agenda individual, agendamento, confirmacao, check-in |
| mod.financial | Cobranca basica (Pix + cartao via Stripe), planos, pacotes |
| ef.evaluation | Avaliacao fisica basica (composicao corporal, testes) |
| ef.training | Prescricao de treino, biblioteca de exercicios, entrega no portal |

### Quick Wins do MVP

- Prescricao de treino com biblioteca de exercicios e entrega no app
- Agenda com confirmacao via WhatsApp (integracao basica)
- Cobranca recorrente via Pix
- Portal do cliente com treino e agenda

### O que NAO entra no MVP

- CRM, comunicacao avancada, analytics
- Fisioterapia, nutricao
- Multi-disciplinar
- AI Suite
- Multi-unidade
- Mobile app nativo (web responsivo apenas)

---

## 2. Roadmap Faseado

### Fase 1 — MVP Personal Trainer (Meses 1-4)

| Sprint | Entregas |
|--------|---------|
| **Sprint 1** (Sem 1-2) | Infraestrutura: monorepo, DB, auth, tenant basico |
| **Sprint 2** (Sem 3-4) | core.users, core.tenant, core.billing (Stripe) |
| **Sprint 3** (Sem 5-6) | core.clients, core.records basico, core.notifications |
| **Sprint 4** (Sem 7-8) | mod.agenda (individual + agendamento), core.documents |
| **Sprint 5** (Sem 9-10) | ef.evaluation basica, mod.financial basico (Pix + cartao) |
| **Sprint 6** (Sem 11-12) | ef.training (builder + biblioteca), core.portal basico |
| **Sprint 7** (Sem 13-14) | Integracao WhatsApp basica, polimento, testes |
| **Sprint 8** (Sem 15-16) | QA, beta testing, deploy em producao |

**Marco**: Personal trainers usando a plataforma para avaliar, prescrever treinos, agendar e cobrar.

### Fase 2 — Expansao EF + Fisioterapia (Meses 5-8)

| Modulo | Descricao |
|--------|-----------|
| ef.monitoring | Monitoramento e evolucao do cliente EF |
| ef.facility | Gestao de studio/academia (grade, turmas, check-in) |
| fisio.evaluation | Avaliacao fisioterapeutica completa |
| fisio.treatment | Plano terapeutico |
| fisio.progress | Evolucao clinica (SOAP) |
| fisio.exercises | Exercicios terapeuticos e programa domiciliar |
| mod.crm | CRM basico (leads, funil, propostas) |
| mod.communication | Comunicacao (WhatsApp avancado, campanhas basicas) |
| mod.portal | Portal expandido do cliente |

**Marco**: Fisioterapeutas e studios de pilates/funcional operando na plataforma.

### Fase 3 — Nutricao + Multi + AI v1 (Meses 9-12)

| Modulo | Descricao |
|--------|-----------|
| nutri.evaluation | Avaliacao nutricional |
| nutri.mealplan | Plano alimentar (builder) |
| nutri.progress | Evolucao nutricional |
| nutri.foodlog | Diario alimentar |
| nutri.outcomes | Desfechos nutricionais |
| nutri.office | Gestao de consultorio |
| multi.evaluation | Avaliacao integrada |
| multi.referral | Encaminhamentos |
| multi.habits | Monitoramento de habitos |
| multi.library | Biblioteca integrada |
| mod.analytics | BI e analytics basico |
| fisio.clinic | Gestao de clinica de fisioterapia |
| fisio.outcomes | Desfechos clinicos |
| ai.suite | AI Suite v1 (orquestrador + infra) |
| ai.copilot.ef | Copiloto EF v1 |
| ai.copilot.fisio | Copiloto Fisio v1 |
| ai.copilot.nutri | Copiloto Nutri v1 |

**Marco**: Centros multidisciplinares com EF + Fisio + Nutri operando integrados, com IA basica.

### Fase 4 — Enterprise + Educacao + AI Completa (Meses 13-18)

| Modulo | Descricao |
|--------|-----------|
| mod.education | Educacao e estagio completo |
| ef.performance | Performance esportiva |
| ef.school | Educacao fisica escolar |
| fisio.specialties | Especialidades fisioterapeuticas |
| fisio.remote | Telemonitoramento |
| nutri.supplements | Suplementacao |
| nutri.specialties | Especialidades nutricionais |
| nutri.remote | Teleatendimento |
| multi.careplan | Plano integrado de cuidado |
| ai.copilot.commercial | Copiloto comercial |
| ai.copilot.ops | Copiloto operacional |
| ai.copilot.multi | Copiloto multidisciplinar |
| ai.copilot.tutor | AI Tutor |
| ai.copilot.analytics | AI Analytics |
| White-label | Dominio customizado, branding completo |
| Video/Teleconsulta | Integracao Daily.co |
| Analytics avancado | Dashboards customizaveis, relatorios |

**Marco**: Plataforma completa com todos os 55 modulos, white-label e enterprise.

---

## 3. Fluxos End-to-End

### Flow 1: Lead to Client (CRM → Agenda → Financial → Training)

```
1. Lead preenche formulario na landing page
   → Evento: LeadCreated
   
2. CRM cria lead no funil, atribui a consultor
   → AI sugere melhor abordagem (lead scoring)
   
3. Consultor agenda avaliacao gratuita
   → Evento: AppointmentScheduled
   → WhatsApp: confirmacao automatica
   
4. Cliente comparece → check-in → avaliacao fisica
   → Evento: EvaluationCompleted
   
5. Profissional gera proposta de plano/pacote
   → Evento: ProposalCreated
   
6. Cliente aceita → contrato digital assinado
   → Evento: ContractSigned
   
7. Cobranca gerada automaticamente
   → Evento: PaymentCreated
   → Link de pagamento via WhatsApp
   
8. Pagamento confirmado
   → Evento: PaymentReceived
   
9. Cliente recebe acesso ao portal
   → Treino entregue
   → Evento: PlanActivated
```

### Flow 2: Jornada Multidisciplinar

```
1. Paciente faz avaliacao fisioterapeutica
   → Plano terapeutico ativo
   
2. Apos melhora funcional, fisio encaminha para EF
   → Evento: ReferralCreated
   → Notificacao para profissional de EF
   
3. Profissional de EF aceita o encaminhamento
   → Ve resumo do caso (AI consolida)
   
4. Avaliacao fisica realizada
   → Treino prescrito COM restricoes do fisio
   
5. Fisioterapeuta encaminha para nutricionista
   → Evento: ReferralCreated
   
6. Nutricionista ve caso integrado
   → Avaliacao nutricional → Plano alimentar
   
7. Care Path integrado ativo
   → Gestores veem progresso consolidado
   → AI monitora alinhamento entre profissionais
```

### Flow 3: Estudante em Estagio

```
1. Preceptor cria trilha de estagio
   → Atribui a estudante
   
2. Estudante realiza atendimentos supervisionados
   → Cada atendimento gera registro no diario
   
3. Preceptor revisa e da feedback
   → Nota e comentarios registrados
   
4. AI Tutor auxilia com duvidas tecnicas
   → Chat interativo sobre o caso
   
5. Estudante monta portfolio com casos
   → Vinculos com registros de estagio
   
6. Avaliacao de competencias pelo supervisor
   → Rubricas preenchidas
   → Certificado gerado ao concluir trilha
```

### Flow 4: Gestor Acompanha Operacao

```
1. Dashboard executivo mostra metricas consolidadas
   
2. AI Analytics alerta: "Taxa de reativacao de inativos caiu 15%"
   
3. Gestor drilla down por unidade
   → Identifica unidade problematica
   
4. Ve metricas de ocupacao, churn, ticket medio por profissional
   
5. Cria campanha de reativacao via mod.communication
   → Sequencia automatizada: WhatsApp + Email
   
6. Acompanha conversao no CRM e receita no financeiro
   → AI sugere ajustes na campanha
```

### Flow 5: Ciclo de Vida do Modulo (Ativacao/Desativacao)

```
1. Owner ve catalogo de modulos no billing
   → Features "ghost" com preview
   
2. Clica em "Testar por 14 dias" no modulo CRM
   → Evento: TrialStarted
   → Feature flag ativada
   → UI adapta sidebar e funcionalidades
   
3. Durante o trial, usa o CRM normalmente
   → Dados criados normalmente
   
4. Trial expira
   → Evento: TrialExpired
   → Notificacao: "Seu trial de CRM expirou. Ative para continuar."
   
5a. Owner ativa: flag permanente, acesso restaurado
5b. Owner nao ativa: dados retidos (soft-lock), UI oculta
   → Se ativar no futuro, dados estao la
```

---

## 4. Riscos e Mitigacoes

### Riscos Tecnicos

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| **Bugs de RLS** | Critico — vazamento de dados | Media | Testes automatizados de isolamento em TODAS as tabelas, nunca query sem tenant_id |
| **Performance JSONB** | Alto — queries lentas | Media | Indices GIN, materialized views, cache Redis, indices parciais |
| **Complexidade de escopo** | Alto — atraso, feature creep | Alta | MVP enxuto, delivery incremental, prioridade rigorosa |
| **AI guardrails falham** | Alto — sugestao clinica inadequada | Media | Disclaimers, human-in-the-loop, logging completo, review periodica |
| **Escalabilidade do monolito** | Medio — gargalos | Baixa (inicialmente) | Event-driven desde dia 1, path de extracao definido |
| **Vendor lock-in LLM** | Medio — custo/disponibilidade | Media | Abstraction layer (LLM Gateway), fallback para Anthropic |

### Riscos de Negocio

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| **Adocao baixa** | Alto | UX simples, onboarding guiado, templates prontos, suporte proativo |
| **Resistencia a tecnologia** | Medio | Interface intuitiva, treinamento, quick wins visiveis |
| **Regulacao LGPD** | Alto | Audit trail completa, consentimentos explicitos, criptografia, DPO |
| **Concorrencia** | Medio | Diferenciador multidisciplinar + AI + modularidade |
| **Churn de tenants** | Alto | Dados retidos em soft-lock, facilitar retorno, comunicacao proativa |

### Tradeoffs Assumidos

| Decisao | Alternativa | Justificativa |
|---------|-------------|---------------|
| **Monolito modular** | Microservices | Velocidade inicial, complexidade adequada para equipe pequena (2-3 anos) |
| **JSONB para extensoes** | Tabelas separadas | Flexibilidade vs performance — JSONB com indices GIN e suficiente |
| **React Native (Expo)** | Nativo | Velocidade de desenvolvimento vs performance — RN e suficiente para este tipo de app |
| **PostgreSQL** | MongoDB | Consistencia + SQL + RLS + JSONB = melhor dos dois mundos |
| **Managed services** | Self-hosted completo | Controle vs custo operacional — managed no inicio, escala depois |
| **TypeScript full-stack** | Multi-linguagem | Uniformidade, code sharing, menor curva de aprendizado |

---

## 5. Metricas de Sucesso por Fase

### Fase 1 (MVP)

| Metrica | Target |
|---------|--------|
| Tenants ativos (personal trainers) | 50+ |
| Clientes cadastrados (total) | 500+ |
| Treinos prescritos/mes | 200+ |
| Pagamentos processados/mes | R$ 50K+ |
| NPS dos profissionais | > 40 |
| Uptime | > 99.5% |

### Fase 2

| Metrica | Target |
|---------|--------|
| Tenants ativos | 200+ |
| Profissionais na plataforma | 300+ |
| Modulos ativos (media por tenant) | 5+ |
| MRR (Monthly Recurring Revenue) | R$ 30K+ |

### Fase 3

| Metrica | Target |
|---------|--------|
| Tenants ativos | 500+ |
| Profissoes representadas | 3 (EF, Fisio, Nutri) |
| Centros multidisciplinares | 20+ |
| AI requests/mes | 5000+ |
| MRR | R$ 100K+ |

### Fase 4

| Metrica | Target |
|---------|--------|
| Tenants ativos | 1000+ |
| Usuarios totais | 10.000+ |
| MRR | R$ 300K+ |
| Modulos ativos total | 15.000+ |
| ARR | R$ 3.6M+ |
| Instituicoes academicas | 10+ |

---

## 6. Equipe Recomendada

### MVP (Fase 1)

| Role | Qtd | Responsabilidade |
|------|-----|-----------------|
| Tech Lead / Fullstack Senior | 1 | Arquitetura, backend, code review |
| Fullstack Developer | 2 | Frontend + Backend features |
| Frontend Developer | 1 | UI/UX, design system, portal |
| DevOps / Infra | 0.5 | CI/CD, deploy, monitoring |
| Product Designer | 0.5 | UX research, wireframes, UI |
| Product Manager | 1 | Roadmap, prioridade, stakeholders |

### Fase 2-3

Adicionar:
- +1-2 Backend developers
- +1 Mobile developer (React Native)
- +1 QA Engineer
- +0.5 Data Engineer (analytics)
- +0.5 AI Engineer (copilots)

### Fase 4

Adicionar:
- +2-3 Fullstack developers
- +1 AI/ML Engineer
- +1 Security Engineer
- +1 SRE
- Growth/Marketing (time separado)
