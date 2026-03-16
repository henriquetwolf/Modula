# MODULA HEALTH — Module Catalog Completo

> Inventario funcional detalhado dos 55 modulos do MODULA HEALTH.
> Cada modulo documenta: nome, categoria, publico-alvo, compartilhado/especifico, funcionalidades, entidades, dependencias, eventos emitidos/consumidos, telas, valor percebido, prioridade e potencial de upsell.

---

## Indice

- [CAMADA 1: Core Obrigatorio (11 modulos)](#camada-1-core-obrigatorio)
- [CAMADA 2: Modulos Compartilhados (7 modulos)](#camada-2-modulos-compartilhados)
- [CAMADA 3: Educacao Fisica (6 modulos)](#camada-3-educacao-fisica)
- [CAMADA 4: Fisioterapia (8 modulos)](#camada-4-fisioterapia)
- [CAMADA 5: Nutricao (9 modulos)](#camada-5-nutricao)
- [CAMADA 6: Multidisciplinares (5 modulos)](#camada-6-multidisciplinares)
- [CAMADA 7: AI Suite (9 modulos)](#camada-7-ai-suite)
- [Visao Panoramica Consolidada](#visao-panoramica-consolidada)

---

## CAMADA 1: Core Obrigatorio

### M01 — core.auth — Autenticacao e Acesso

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Todos os usuarios |
| **Tipo** | Compartilhado — transversal |
| **Prioridade** | P0 — Sprint 1 |
| **Upsell** | Nenhum (MFA premium como upsell minor) |
| **Valor percebido** | Fundamental |

**Funcionalidades:**
- Login por e-mail/senha e social (Google, Apple)
- Logout e invalidacao de sessao
- Recuperacao de senha por e-mail
- MFA opcional (TOTP, SMS)
- Gerenciamento de sessoes ativas
- Convite de usuarios por e-mail com link de ativacao
- Autenticacao por tenant (resolucao por subdominio ou slug)
- Associacao usuario-empresa-unidade no login
- Token refresh automatico
- Rate limiting de tentativas de login
- Bloqueio de conta por tentativas excessivas
- Gestao de credenciais (alteracao de senha, revogacao de sessoes)

**Entidades:** User, AuthCredential, Session, MFAConfig, Invitation, PasswordResetToken

**Dependencias:** Nenhuma (modulo raiz)

**Eventos emitidos:** UserLoggedIn, UserLoggedOut, UserInvited, UserActivated, PasswordChanged, MFAEnabled, LoginFailed, AccountLocked

**Eventos consumidos:** TenantCreated (para provisionar owner)

**Telas:**
- Login (com resolucao de tenant)
- Registro / aceite de convite
- Recuperacao de senha
- Configuracao de MFA
- Sessoes ativas

---

### M02 — core.users — Gestao de Usuarios

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Admins, owners, gestores |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 1-2 |
| **Upsell** | Limites de quantidade de usuarios por plano |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Cadastro de usuario com papel (role)
- Edicao de dados do usuario
- Ativacao / inativacao de conta
- Perfil profissional (registro, especialidades, formacao, certificados, bio, foto, assinatura digital)
- Perfil academico (instituicao, curso, periodo, orientador)
- Perfil administrativo (cargo, permissoes)
- Vinculo com uma ou mais unidades
- Vinculo com profissao (CREF, CREFITO, CRN)
- Permissoes por papel e por unidade
- Dados de contratacao (CLT, PJ, autonomo)
- Dados para repasse/comissao
- Disponibilidade (horarios, dias)
- Upload de documentos pessoais
- Listagem e busca de usuarios
- Importacao em lote (CSV)

**Entidades:** User, ProfessionalProfile, StudentProfile, AdminProfile, UnitMembership, Role, ProfessionRegistration, UserDocument

**Dependencias:** core.auth

**Eventos emitidos:** UserCreated, UserUpdated, UserDeactivated, UserReactivated, RoleAssigned, UnitMembershipChanged, ProfessionalProfileUpdated

**Eventos consumidos:** UserActivated (core.auth), UnitCreated (core.tenant)

**Telas:**
- Lista de usuarios (filtros por role, profissao, unidade, status)
- Formulario de cadastro/edicao
- Perfil profissional detalhado
- Gestao de vinculos com unidades
- Gestao de papeis e permissoes

---

### M03 — core.clients — Cadastro Unificado

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Profissionais, recepcionistas, gestores |
| **Tipo** | Compartilhado — entidade unica para todas as areas |
| **Prioridade** | P0 — Sprint 2-3 |
| **Upsell** | Limite de clientes por plano; campos customizados premium |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Cadastro completo (dados pessoais, CPF, nascimento, sexo, foto)
- Multiplos contatos (telefone, e-mail, WhatsApp)
- Responsaveis legais (menores/incapazes)
- Contato de emergencia
- Upload de documentos
- Endereco completo
- Observacoes gerais
- Status do relacionamento (lead, ativo, inativo, ex-cliente, pendente)
- Tags e segmentacao customizavel
- Campos customizados por tenant
- Vinculo com multiplos profissionais
- Vinculo com unidade(s)
- Historico geral de interacoes
- Busca e filtros avancados
- Importacao em lote (CSV)
- Merge de cadastros duplicados
- Ficha resumida com visao 360

**Entidades:** ClientProfile, ClientContact, Guardian, EmergencyContact, ClientDocument, ClientAddress, ClientTag, ClientProfessionalLink, CustomField

**Dependencias:** core.users

**Eventos emitidos:** ClientCreated, ClientUpdated, ClientStatusChanged, ClientLinkedToProfessional, ClientMerged

**Eventos consumidos:** LeadConverted (mod.crm), ContractSigned (mod.financial)

**Telas:**
- Lista de clientes (filtros, busca, tags)
- Ficha completa 360
- Formulario de cadastro/edicao
- Gestao de vinculos profissionais
- Gestao de tags e segmentacao
- Importacao em lote

---

### M04 — core.records — Prontuario Base Unificado

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Profissionais de todas as areas, gestores clinicos |
| **Tipo** | Compartilhado — timeline unificada com extensoes |
| **Prioridade** | P0 — Sprint 3-4 |
| **Upsell** | Showcase para modulos clinicos |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Timeline cronologica do cliente (todos os eventos cross-module)
- Documentos anexados ao prontuario
- Observacoes gerais por profissional
- Dados sensiveis com controle de acesso (flag sensitive)
- Registro de consentimentos vinculados
- Termos assinados
- Historico de atendimentos, encaminhamentos, anexos
- Impressao/exportacao de prontuario
- Filtro de timeline por tipo, profissional, area
- Busca no prontuario
- Versionamento de registros (imutabilidade com versao)

**Entidades:** MedicalRecord, TimelineEvent, RecordEntry, RecordAttachment, RecordVersion

**Dependencias:** core.clients

**Eventos emitidos:** RecordEntryCreated, RecordViewed, RecordExported, SensitiveDataAccessed

**Eventos consumidos:** EvaluationCompleted, SessionCompleted, ProgressNoteCreated, ReferralCreated, DocumentUploaded

**Telas:**
- Timeline do prontuario
- Visualizacao de entrada individual
- Filtros de timeline
- Exportacao/impressao

---

### M05 — core.documents — Documentos e Anexos

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Todos os profissionais, gestores, clientes |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 3-4 |
| **Upsell** | Limite de storage (5GB free, 50GB pro, ilimitado enterprise) |
| **Valor percebido** | Medio-alto |

**Funcionalidades:**
- Upload de arquivos (imagens, PDFs, videos, documentos)
- Categorizacao por tipo (exame, laudo, contrato, foto, certificado, receita)
- Controle de acesso por profissional e sensibilidade
- Visualizacao inline (preview de imagem/PDF)
- Versionamento basico (substituicao com historico)
- Associacao a prontuario, avaliacao, atendimento, contrato, plano
- Metadados (data, autor, categoria, descricao)
- Busca por nome e categoria
- Download individual e em lote
- Limite de storage por plano
- Scan de virus em upload

**Entidades:** Document, DocumentVersion, DocumentCategory, DocumentAccess

**Dependencias:** core.records

**Eventos emitidos:** DocumentUploaded, DocumentViewed, DocumentDeleted, DocumentShared

**Eventos consumidos:** EvaluationCompleted, ContractSigned

**Telas:**
- Gerenciador de documentos do cliente
- Upload modal (drag and drop, categorizacao)
- Visualizador de documento
- Lista com filtros

---

### M06 — core.consent — Consentimentos e LGPD

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Profissionais, clientes/pacientes, compliance |
| **Tipo** | Compartilhado |
| **Prioridade** | P1 — Sprint 4-5 |
| **Upsell** | Templates premium, assinatura digital avancada |
| **Valor percebido** | Medio (critico para compliance) |

**Funcionalidades:**
- Aceite de termos de uso
- Consentimento para coleta/tratamento de dados pessoais
- Consentimento para dados sensiveis de saude
- Aceite de atendimento presencial e remoto
- Trilha de consentimentos (quem, quando, qual termo, IP, dispositivo)
- Templates customizaveis por tenant
- Exportacao (PDF)
- Revogacao com registro
- Notificacao de termos atualizados
- Bloqueio de funcionalidades se consentimento pendente
- Assinatura digital

**Entidades:** ConsentTemplate, ConsentRecord, ConsentRevocation, TermVersion

**Dependencias:** core.clients

**Eventos emitidos:** ConsentGranted, ConsentRevoked, TermUpdated, ConsentExported

**Eventos consumidos:** ClientCreated

**Telas:**
- Painel de consentimentos do cliente
- Formulario de aceite
- Gestao de templates (admin)
- Historico de consentimentos
- Aceite no portal do cliente

---

### M07 — core.notifications — Notificacoes

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Todos os usuarios |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 3+ |
| **Upsell** | Habilita modulo de comunicacao |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Central de notificacoes in-app
- Notificacoes de sistema, agenda, financeiras, clinicas, entre profissionais
- Badge de contagem de nao lidas
- Marcar como lida / marcar todas
- Preferencias por tipo e canal
- Historico de notificacoes
- Push notifications (mobile)
- Agrupamento de similares

**Entidades:** Notification, NotificationPreference, NotificationChannel, NotificationTemplate

**Dependencias:** core.auth

**Eventos emitidos:** NotificationSent, NotificationRead, NotificationPreferenceChanged

**Eventos consumidos:** AppointmentScheduled, PaymentReceived, PaymentOverdue, EvaluationCompleted, ReferralCreated, MessageReceived, LeadAssigned

**Telas:**
- Central de notificacoes (dropdown + pagina)
- Preferencias
- Badge no header

---

### M08 — core.tenant — Configuracoes do Tenant

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Owner, admin |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 2 |
| **Upsell** | White-label (dominio customizado), multiplas unidades |
| **Valor percebido** | Medio-alto |

**Funcionalidades:**
- Dados da empresa (razao social, CNPJ, endereco)
- Marca (logotipo, cores, favicon)
- Gestao de unidades (CRUD com endereco, telefone, CNPJ filial)
- Horarios de funcionamento por unidade
- Politicas operacionais (antecedencia, tolerancia de atraso)
- Templates por modulo
- Preferencias de integracoes
- Preferencias operacionais (moeda, fuso, idioma)
- Subdominio customizado
- Gestao de feature flags (modulos ativos)
- Gestao de equipe por unidade

**Entidades:** Tenant, Company, Unit, TenantBranding, TenantPolicy, TenantTemplate, IntegrationConfig

**Dependencias:** core.auth

**Eventos emitidos:** TenantCreated, TenantUpdated, UnitCreated, UnitUpdated, PolicyChanged, BrandingUpdated

**Eventos consumidos:** Nenhum direto

**Telas:**
- Configuracoes gerais
- Gestao de marca/branding
- Gestao de unidades
- Politicas e regras
- Gestao de templates
- Integracoes ativas
- Modulos e plano

---

### M09 — core.billing — Billing do SaaS

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Owner, admin do tenant |
| **Tipo** | Compartilhado (billing da plataforma) |
| **Prioridade** | P0 — Sprint 2-3 |
| **Upsell** | Este modulo E o motor de upsell |
| **Valor percebido** | Medio |

**Funcionalidades:**
- Plano contratado (nome, preco, modulos inclusos)
- Modulos ativos (listagem com status)
- Status da assinatura (ativa, trial, suspensa, cancelada)
- Historico de cobrancas
- Upgrade/downgrade de plano
- Trial de modulos (7/14/30 dias)
- Consumo de recursos (storage, AI, usuarios)
- Portal de pagamento (Stripe Customer Portal)
- Cupons de desconto
- Bundles disponiveis
- Alertas de vencimento e cobranca falha
- Bloqueio gracioso (somente leitura apos inadimplencia)
- Reativacao pos-pagamento

**Entidades:** SaaSSubscription, SaaSPlan, ModuleEntitlement, SaaSInvoice, SaaSPayment, Trial, UsageRecord, Coupon

**Dependencias:** core.tenant

**Eventos emitidos:** SubscriptionCreated, SubscriptionUpgraded, SubscriptionDowngraded, ModuleActivated, ModuleDeactivated, TrialStarted, TrialExpired, SaaSPaymentFailed, SaaSPaymentReceived, GracePeriodStarted

**Eventos consumidos:** Webhooks do Stripe/gateway

**Telas:**
- Painel de assinatura
- Catalogo de modulos e bundles
- Historico de faturas
- Gestao de trial
- Alertas de pagamento

---

### M10 — core.audit — Auditoria

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Admins, compliance, suporte interno |
| **Tipo** | Compartilhado |
| **Prioridade** | P1 — Sprint 4-5 |
| **Upsell** | Retencao estendida (5+ anos), alertas de compliance |
| **Valor percebido** | Baixo dia a dia, critico compliance |

**Funcionalidades:**
- Trilha de acoes (quem fez o que, quando, onde)
- Historico de alteracao (diff antes/depois)
- Logs de acesso (login, logout, falhas)
- Logs de alteracao de dados sensiveis
- Logs de ativacao/desativacao de modulos
- Logs de exportacao e acesso cross-profissional
- Filtros por usuario, acao, recurso, data
- Retencao configuravel
- Exportacao para compliance
- Imutabilidade (append-only)
- Alertas de acoes suspeitas

**Entidades:** AuditLog, AuditEntry, AuditAlert

**Dependencias:** Nenhuma (subscriber universal)

**Eventos emitidos:** AuditAlertTriggered

**Eventos consumidos:** Todos os eventos de todos os modulos

**Telas:**
- Log de auditoria (tabela paginada)
- Detalhe de entrada (diff)
- Exportacao
- Configuracao de retencao

---

### M11 — core.portal — Portal Base do Cliente

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Core Obrigatorio |
| **Publico-alvo** | Clientes, pacientes, alunos, responsaveis legais |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 4-5 |
| **Upsell** | Portal expandido (mod.portal) |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Perfil pessoal (visualizacao e edicao basica)
- Agenda pessoal (proximas sessoes)
- Documentos recebidos
- Central de notificacoes
- Pagamentos (faturas, historico, link)
- Historico basico de atendimentos
- Mensagens com profissionais
- Consentimentos e termos
- Login com credenciais proprias
- Area "meu progresso" (placeholder)

**Entidades:** Reutiliza ClientProfile, Notification, Payment, ConsentRecord, Message

**Dependencias:** core.clients

**Eventos emitidos:** PortalAccessed, ClientProfileUpdated, ConsentAccepted

**Eventos consumidos:** AppointmentScheduled, PaymentCreated, DocumentShared, NotificationSent

**Telas:**
- Dashboard do cliente
- Minha agenda
- Meus pagamentos
- Meus documentos
- Minhas mensagens
- Meu perfil
- Termos e consentimentos

---

## CAMADA 2: Modulos Compartilhados

### M12 — mod.crm — CRM e Comercial

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Consultores, gestores, recepcionistas, owners |
| **Tipo** | Compartilhado entre todas as areas |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | AI comercial, integracoes com ads, automacoes |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Captacao de leads (formularios embeddable, landing pages, widgets)
- Formularios de interesse customizaveis
- Funil comercial visual (Kanban) com estagios configuraveis
- Pipeline por tipo de servico
- Estagios de lead (novo, contato, agendado, avaliado, proposta, fechado, perdido)
- Origem do lead (organico, indicacao, Meta Ads, Google Ads, WhatsApp)
- Historico completo de interacoes
- Tarefas de follow-up com lembretes
- Agenda comercial (acoes do dia)
- Distribuicao automatica de leads (round-robin, por unidade, por servico)
- Propostas com templates
- Contratos digitais com assinatura
- Onboarding do novo cliente (checklist configuravel)
- Campanhas de aquisicao com tracking
- Tags e segmentacao, campos customizados
- Integracoes: WhatsApp, Meta Ads, Google Ads, e-mail marketing
- Paineis de conversao (taxa por etapa, origem, consultor)
- Relatorios comerciais (volume, conversao, tempo de ciclo, receita)
- Motivos de perda, reativacao de leads perdidos

**Entidades:** Lead, Pipeline, PipelineStage, LeadInteraction, FollowUpTask, Proposal, Contract, Campaign, LeadSource, LeadTag

**Dependencias:** core (clients, users, tenant)

**Eventos emitidos:** LeadCreated, LeadStageChanged, LeadAssigned, ProposalCreated, ProposalAccepted, ContractSigned, LeadConverted, LeadLost, CampaignLaunched

**Eventos consumidos:** AppointmentScheduled, PaymentReceived, ClientCreated

**Telas:**
- Funil Kanban (drag and drop)
- Lista de leads
- Ficha do lead
- Painel de tarefas do dia
- Editor de propostas
- Gestao de contratos
- Dashboard comercial
- Gestao de campanhas
- Configuracao de pipelines
- Relatorios

---

### M13 — mod.agenda — Agenda e Operacao

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Profissionais, recepcionistas, gestores, clientes |
| **Tipo** | Compartilhado |
| **Prioridade** | P0 — Sprint 3-5 (MVP) |
| **Upsell** | Multi-sala, Google Calendar, AI otimizacao |
| **Valor percebido** | Altissimo |

**Funcionalidades:**
- Agenda individual (dia, semana, mes)
- Agenda coletiva (aulas em grupo, turmas)
- Agenda por unidade e por sala/recurso
- Tipos configuraveis: sessao, consulta, aula, retorno, reavaliacao, grupo
- Recorrencia (semanal, quinzenal, mensal, personalizada)
- Bloqueio de horarios
- Janela de atendimento
- Encaixe com aprovacao
- Lista de espera com notificacao
- Confirmacao automatica via WhatsApp/push/e-mail
- Reagendamento com historico
- Cancelamento com motivo
- Regras de antecedencia
- Controle de no-show
- Check-in presencial (manual ou QR code)
- Controle de presenca
- Controle de salas, boxes, estacoes
- Controle de lotacao
- Mapa operacional da unidade
- Agendamento online self-service
- Duracoes e cores configuraveis

**Entidades:** Appointment, Session, RecurrenceRule, TimeSlot, WaitListEntry, CheckIn, Room, Resource, ScheduleBlock, GroupClass

**Dependencias:** core (clients, users, tenant)

**Eventos emitidos:** AppointmentScheduled, AppointmentConfirmed, AppointmentCancelled, AppointmentRescheduled, NoShowMarked, CheckInCompleted, WaitListNotified, SessionStarted, SessionCompleted

**Eventos consumidos:** ClientCreated, PaymentReceived, ModuleActivated

**Telas:**
- Calendario principal (dia/semana/mes)
- Modal de agendamento rapido
- Lista de espera
- Mapa de ocupacao
- Configuracao de disponibilidade
- Gestao de salas/recursos
- Check-in / presenca
- Agenda no portal do cliente
- Relatorio de ocupacao e no-show

---

### M14 — mod.financial — Financeiro e Cobranca

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Gestores, owners, recepcionistas, autonomos |
| **Tipo** | Compartilhado (cobrar cliente final) |
| **Prioridade** | P0 — Sprint 5-7 (MVP) |
| **Upsell** | NF-e, regua avancada, DRE, multi-gateway, split |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Planos de atendimento (mensal, trimestral, semestral, anual)
- Pacotes de sessoes
- Assinaturas e cobranca recorrente automatica
- Cobranca avulsa
- Metodos: Pix, boleto, cartao
- Links de pagamento (WhatsApp)
- Controle de recebiveis
- Gestao de inadimplencia
- Regua de cobranca configuravel
- Descontos, cupons, creditos, estornos
- Repasse para profissionais (%, fixo, por sessao)
- Comissao configuravel
- Fluxo de caixa, DRE simplificado
- Relatorios financeiros
- Emissao de recibos
- Integracao NF-e
- Contratos atrelados a cobrancas
- Pacotes multidisciplinares
- Bundles com preco especial

**Entidades:** Payment, Invoice, Subscription, Plan, Package, Commission, Discount, Coupon, Credit, Refund, CashFlowEntry, Receipt, FinancialReport

**Dependencias:** core (clients, users, tenant)

**Eventos emitidos:** PaymentCreated, PaymentReceived, PaymentOverdue, PaymentFailed, SubscriptionCreated, SubscriptionCancelled, CommissionCalculated, InvoiceGenerated, RefundProcessed

**Eventos consumidos:** ContractSigned, SessionCompleted, AppointmentCancelled

**Telas:**
- Dashboard financeiro
- Lista de cobrancas
- Gestao de planos e pacotes
- Regua de cobranca
- Repasses e comissoes
- Fluxo de caixa
- DRE
- Relatorios financeiros
- Pagamento no portal do cliente

---

### M15 — mod.communication — Comunicacao e Relacionamento

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Profissionais, gestores, recepcionistas, marketing |
| **Tipo** | Compartilhado |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | Automacoes avancadas, WhatsApp Business API, SMS, AI |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Chat interno entre profissionais
- Mensagens 1:1 e para grupos/turmas
- Envio via WhatsApp, e-mail, push, SMS
- Campanhas de comunicacao (sequencias automatizadas)
- Automacoes por evento (onboarding, aniversario, reativacao, inadimplencia)
- Lembretes automaticos (consulta, pagamento)
- Mensagens de reativacao e onboarding
- Pesquisas de satisfacao pos-atendimento
- NPS periodico
- Templates configuraveis
- Segmentacao de audiencia
- Historico completo por cliente
- Envio de materiais educativos
- Opt-out/unsubscribe

**Entidades:** Message, Conversation, Campaign, Automation, Template, Audience, SurveyResponse, NPSScore, CommunicationLog

**Dependencias:** core (clients, notifications)

**Eventos emitidos:** MessageSent, MessageDelivered, MessageRead, CampaignSent, SurveyCompleted, NPSCollected, AutomationTriggered

**Eventos consumidos:** AppointmentScheduled, PaymentOverdue, ClientStatusChanged, ClientCreated, SessionCompleted

**Telas:**
- Inbox de mensagens
- Chat
- Editor de campanhas
- Gestao de automacoes (builder visual)
- Gestao de templates
- Relatorio de metricas
- Pesquisas e NPS
- Configuracao de canais

---

### M16 — mod.analytics — BI e Analytics

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Owners, gestores, coordenadores |
| **Tipo** | Compartilhado |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | Dashboards avancados, relatorios customizados, AI Analytics |
| **Valor percebido** | Muito alto para gestores |

**Funcionalidades:**
- Dashboards financeiros, comerciais, operacionais, tecnicos
- Metricas por profissao, unidade, profissional
- KPIs: ticket medio, churn, retencao, conversao, ocupacao, produtividade, aderencia
- Exportacao (PDF, CSV, Excel)
- Filtros avancados
- Relatorios customizados (builder)
- Comparativos por periodo
- Coortes de retencao
- Performance de bundles e pacotes
- Alertas automaticos
- Agendamento de relatorios por e-mail

**Entidades:** Dashboard, Widget, Metric, Report, ReportSchedule, Alert, DataSnapshot

**Dependencias:** core (todos os modulos como fonte)

**Eventos emitidos:** AlertTriggered, ReportGenerated, DashboardViewed

**Eventos consumidos:** Todos os eventos agregados

**Telas:**
- Dashboard executivo, financeiro, comercial, operacional, por profissional
- Builder de relatorios
- Alertas
- Exportacao

---

### M17 — mod.education — Educacao, Formacao e Estagio

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Estudantes, professores, orientadores, preceptores, instituicoes |
| **Tipo** | Compartilhado entre EF, Fisio, Nutri |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI Tutor, simulados adaptativos, certificacoes, plano institucional |
| **Valor percebido** | Alto para nicho academico |

**Funcionalidades:**
- Trilhas de aprendizagem
- Cursos com modulos e aulas
- Banco de questoes (objetivas, dissertativas)
- Simulados com tempo e correcao
- Flashcards para revisao
- Casos praticos
- Avaliacoes academicas com nota e feedback
- Diario de estagio
- Supervisao de estagio
- Feedback estruturado do preceptor
- Avaliacao de competencias por rubrica
- Portfolio digital
- Certificados de conclusao
- Forums e grupos de estudo
- Cronograma e plano de estudo personalizado
- Progresso em trilhas (%, badges)
- Ranking (gamificacao leve)

**Entidades:** Course, Module, Lesson, Question, Quiz, Flashcard, CaseStudy, InternshipRecord, InternshipDiary, CompetencyAssessment, Portfolio, Certificate, Forum, StudyGroup, StudyPlan

**Dependencias:** core (users, clients)

**Eventos emitidos:** CourseEnrolled, LessonCompleted, QuizCompleted, InternshipEntryCreated, FeedbackGiven, CertificateIssued, CompetencyAssessed

**Eventos consumidos:** UserCreated (estudante), SessionCompleted

**Telas:**
- Catalogo de cursos/trilhas
- Player de aula
- Simulados e quizzes
- Flashcards
- Diario de estagio
- Painel do preceptor
- Portfolio
- Avaliacao de competencias
- Forum
- Cronograma/plano de estudo

---

### M18 — mod.portal — Portal/App Expandido

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Modulo Compartilhado (compravel) |
| **Publico-alvo** | Clientes, pacientes, alunos, atletas |
| **Tipo** | Compartilhado |
| **Prioridade** | P1 — Fase 2 |
| **Upsell** | App white-label, assistente AI do cliente |
| **Valor percebido** | Altissimo |

**Funcionalidades:**
- Tudo do core.portal +
- Treinos/exercicios com video (se ef.training ativo)
- Plano alimentar (se nutri.mealplan ativo)
- Plano terapeutico e exercicios domiciliares (se fisio ativo)
- Registro de execucao de treino
- Diario alimentar com fotos
- Check-ins de sintomas
- Registro de habitos diarios
- Metas pessoais e progresso
- Indicadores de adesao
- Graficos de evolucao
- Fotos de evolucao (antes/depois)
- Upload de documentos/exames
- Diario pessoal
- Feedback ao profissional
- Materiais educativos
- Notificacoes push personalizadas

**Entidades:** Reutiliza clinicos; adiciona ClientCheckIn, HabitLog, GoalProgress, EvolutionPhoto

**Dependencias:** core.portal + modulos clinicos ativos

**Eventos emitidos:** TrainingLogged, FoodLogCreated, CheckInCompleted, HabitLogged, GoalUpdated, PhotoUploaded, FeedbackSubmitted

**Eventos consumidos:** PlanActivated, TrainingPrescribed, MealPlanCreated, ExerciseProgramAssigned

**Telas:**
- Dashboard expandido
- Meu treino do dia (com videos)
- Meu plano alimentar
- Meus exercicios terapeuticos
- Diario (alimentar, sintomas, habitos)
- Minha evolucao (graficos, fotos)
- Minhas metas
- Check-in rapido (widget)

---

## CAMADA 3: Educacao Fisica

### M19 — ef.evaluation — Avaliacao Fisica e Funcional

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico |
| **Publico-alvo** | Personal trainers, preparadores, professores de EF |
| **Tipo** | Especifico de EF (estende Evaluation) |
| **Prioridade** | P0 — Sprint 4-6 (MVP) |
| **Upsell** | AI leitura automatica, protocolos avancados, bioimpedancia |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Anamnese esportiva
- PAR-Q
- Historico esportivo
- Objetivos do cliente
- Composicao corporal (peso, altura, IMC)
- Circunferencias
- Dobras cutaneas (Pollock 3/7, Jackson-Pollock, Guedes)
- Bioimpedancia
- Avaliacao postural (checklist + fotos)
- Mobilidade articular
- Flexibilidade (banco de Wells, goniometria)
- Estabilidade e controle motor
- Testes funcionais (FMS, overhead squat)
- Testes de forca (1RM, 10RM, isometricos)
- Testes de potencia (salto vertical, medicine ball)
- Testes de resistencia (Cooper, shuttle run)
- Testes cardiorrespiratorios (VO2 estimado)
- Comparativos entre avaliacoes
- Protocolos customizaveis
- Relatorios PDF com graficos
- Fotos da avaliacao

**Entidades:** PhysicalEvaluation, BodyComposition, SkinFold, CircumferenceMeasure, PosturalAssessment, FunctionalTest, StrengthTest, CardioTest, EvaluationProtocol

**Dependencias:** core (clients, records)

**Eventos emitidos:** PhysicalEvaluationCompleted, PhysicalEvaluationScheduled, BodyCompositionRecorded

**Eventos consumidos:** AppointmentScheduled, ClientCreated

**Telas:**
- Formulario multi-step wizard
- Dashboard de resultados
- Comparativo de avaliacoes
- Gestao de protocolos
- Relatorio PDF

---

### M20 — ef.training — Prescricao de Treino

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico |
| **Publico-alvo** | Personal trainers, preparadores, professores |
| **Tipo** | Especifico de EF (estende Plan) |
| **Prioridade** | P0 — Sprint 5-7 (MVP) |
| **Upsell** | AI geracao, biblioteca expandida, periodizacao avancada |
| **Valor percebido** | Altissimo |

**Funcionalidades:**
- Biblioteca de exercicios (500+ padrao)
- Exercicios proprios
- Videos demonstrativos, imagens, instrucoes
- Montagem: series, repeticoes, carga, RPE, RIR
- Intervalo, cadencia, tempo sob tensao
- Splits (A/B/C/D)
- Treino por objetivo e perfil
- Progressoes e regressoes
- Metodos avancados (drop set, rest-pause, bi-set, tri-set, cluster)
- Periodizacao basica (linear, ondulada)
- Templates reutilizaveis
- Entrega no app/portal
- Feedback do aluno
- Historico de cargas
- Controle de execucao (checklist)
- Duplicacao e adaptacao
- Impressao PDF

**Entidades:** TrainingPlan, TrainingSession, ExerciseSet, ExerciseLibraryItem, TrainingTemplate, TrainingFeedback, LoadHistory

**Dependencias:** ef.evaluation

**Eventos emitidos:** TrainingPrescribed, TrainingUpdated, TrainingDelivered, TrainingFeedbackReceived, LoadRecorded

**Eventos consumidos:** PhysicalEvaluationCompleted, TrainingLogged

**Telas:**
- Builder (drag and drop)
- Biblioteca (busca, filtros, favoritos)
- Editor de exercicio
- Visualizacao do treino do cliente
- Historico de prescritos
- Templates
- Ficha PDF
- Treino no portal/app (com videos)

---

### M21 — ef.monitoring — Monitoramento e Evolucao EF

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico |
| **Publico-alvo** | Personal trainers, preparadores, clientes |
| **Tipo** | Especifico de EF |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | AI evasao, resumos semanais, gamificacao |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Frequencia de treinos
- Adesao ao programa (%)
- Registro de dor pos-treino, fadiga, sono, disposicao, humor
- Metas do cliente
- Check-ins periodicos
- Fotos de evolucao (timeline comparativa)
- Evolucao de peso, medidas, performance
- Alertas de risco de evasao
- Score de engajamento
- Relatorios de progresso

**Entidades:** FitnessProgress, TrainingLog, BodyMetric, EvolutionPhoto, EngagementScore, ClientGoal

**Dependencias:** ef.training

**Eventos emitidos:** ProgressRecorded, GoalAchieved, EvasionRiskDetected, EngagementScoreUpdated

**Eventos consumidos:** TrainingLogged, CheckInCompleted, PhysicalEvaluationCompleted

**Telas:**
- Dashboard de evolucao
- Fotos de evolucao
- Painel de metas
- Alertas de engajamento
- Relatorio PDF

---

### M22 — ef.performance — Performance Esportiva

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico (nicho) |
| **Publico-alvo** | Preparadores fisicos, treinadores, atletas |
| **Tipo** | Especifico de EF — extensao avancada |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI sobrecarga, wearables, plano enterprise esportivo |
| **Valor percebido** | Muito alto (nicho) |

**Funcionalidades:**
- Calendario competitivo
- Periodizacao avancada (micro, meso, macrociclo)
- Carga: interna (PSE, TRIMP) e externa (volume, intensidade)
- Wellness questionnaire
- Gestao de elenco/atletas
- Sessoes por equipe/grupo
- Testes esportivos especificos
- Relatorios individuais e coletivos
- ACWR (aguda vs cronica)
- Controle de lesoes
- Integracao futura com wearables

**Entidades:** CompetitionCalendar, Periodization, Microcycle, Mesocycle, Macrocycle, TrainingLoad, WellnessCheck, Team, Athlete, SportTest, InjuryRecord

**Dependencias:** ef.evaluation

**Eventos emitidos:** WellnessCheckCompleted, LoadAlertTriggered, CompetitionScheduled, InjuryRecorded

**Eventos consumidos:** TrainingLogged, PhysicalEvaluationCompleted

**Telas:**
- Calendario de periodizacao
- Dashboard do atleta
- Gestao de equipe
- Testes esportivos
- ACWR
- Relatorios

---

### M23 — ef.facility — Gestao de Studio/Academia/Box

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico |
| **Publico-alvo** | Gestores de studio, donos de academia |
| **Tipo** | Especifico de EF |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | Multi-unidade, AI otimizacao de grade, check-in biometrico |
| **Valor percebido** | Muito alto para studios/academias |

**Funcionalidades:**
- Grade de aulas (quadro semanal)
- Gestao de professores
- Gestao de turmas
- Matriculas
- Planos de academia (mensal, trimestral, anual, day-use)
- Gestao de salas/espacos
- Controle de lotacao
- Check-in por QR code
- Presenca por turma
- Lista de espera
- Gestao multiunidade
- Repasse por aula/hora
- Indicadores operacionais
- Escala e substituicoes
- Supervisao tecnica
- Relatorios

**Entidades:** ClassSchedule, ClassSession, Enrollment, FacilityPlan, AttendanceRecord, InstructorSchedule, FacilityRoom

**Dependencias:** mod.agenda

**Eventos emitidos:** ClassCreated, EnrollmentCreated, AttendanceRecorded, CapacityReached, InstructorAssigned

**Eventos consumidos:** AppointmentScheduled, PaymentReceived, CheckInCompleted

**Telas:**
- Grade semanal
- Gestao de turmas e matriculas
- Lotacao por aula
- Check-in
- Dashboard operacional
- Equipe e escala
- Relatorios

---

### M24 — ef.school — Educacao Fisica Escolar

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Educacao Fisica — Especifico (nicho) |
| **Publico-alvo** | Professores de EF escolar, coordenadores pedagogicos |
| **Tipo** | Especifico de EF |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI plano de aula, banco de atividades premium, plano institucional |
| **Valor percebido** | Medio-alto (nicho) |

**Funcionalidades:**
- Planejamento de aula estruturado
- Plano pedagogico por bimestre/trimestre/semestre
- Diario de classe
- Presenca por turma
- Avaliacao motora (PROESP-BR)
- Conteudo por faixa etaria
- Objetivos pedagogicos (BNCC)
- Calendario escolar e eventos esportivos
- Eventos internos (interclasses, gincanas)
- Relatorios para coordenacao
- Banco de atividades por faixa etaria

**Entidades:** LessonPlan, PedagogicalPlan, ClassDiary, MotorAssessment, SchoolEvent, ActivityBank

**Dependencias:** core (users, clients)

**Eventos emitidos:** LessonPlanCreated, MotorAssessmentCompleted, SchoolEventCreated

**Telas:**
- Planejamento de aulas
- Diario de classe
- Avaliacao motora
- Banco de atividades
- Relatorios pedagogicos
- Calendario de eventos

---

## CAMADA 4: Fisioterapia

### M25 — fisio.evaluation — Avaliacao Fisioterapeutica

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas |
| **Tipo** | Especifico de Fisio (estende Evaluation) |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | AI resumo, banco de escalas premium, integracao com exames |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Anamnese clinica completa (queixa principal, HDA, HPP, HF, medicamentos, exames)
- Diagnostico medico (CID) e hipoteses funcionais (CIF)
- Dor: EVA, mapa corporal, fatores agravantes/atenuantes
- Red flags
- Avaliacao postural
- Avaliacao funcional
- ADM por articulacao
- Forca muscular (escala Oxford)
- Testes ortopedicos especiais
- Testes neurologicos
- Marcha, equilibrio (Berg, Tinetti)
- Escalas validadas (DASH, Oswestry, WOMAC, SF-36)
- Funcionalidade e incapacidade (Barthel, FIM)
- Protocolos customizaveis
- Reavaliacao com comparativo
- Relatorios PDF
- Fotos clinicas

**Entidades:** PhysioEvaluation, PainAssessment, PosturalAssessment, ROMAssessment, MuscleStrengthTest, OrthopedicTest, NeurologicalTest, ClinicalScale, FunctionalAssessment

**Dependencias:** core (clients, records)

**Eventos emitidos:** PhysioEvaluationCompleted, RedFlagIdentified, ReevaluationCompleted, ScaleApplied

**Eventos consumidos:** AppointmentScheduled, ClientCreated

**Telas:**
- Formulario multi-step
- Mapa de dor interativo (body map)
- Testes por regiao/articulacao
- Escalas clinicas
- Comparativo de reavaliacoes
- Relatorio PDF

---

### M26 — fisio.treatment — Plano Terapeutico e Conduta

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas |
| **Tipo** | Especifico de Fisio (estende Plan) |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | AI sugestao de conduta, protocolos baseados em evidencia |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Objetivos terapeuticos (curto, medio, longo prazo)
- Plano estruturado (fases, condutas, frequencia)
- Condutas por sessao (tecnicas, recursos, tempo)
- Tecnicas catalogadas
- Recursos terapeuticos
- Frequencia de atendimento
- Fases (aguda, subaguda, funcional, retorno ao esporte)
- Progressao funcional (criterios de avanco)
- Protocolos por patologia
- Metas terapeuticas mensuraveis
- Plano domiciliar
- Orientacoes ao paciente
- Registro de resposta ao tratamento
- Export do plano

**Entidades:** TherapeuticPlan, TreatmentPhase, SessionConduct, TherapeuticTechnique, TherapeuticGoal, HomeProgramLink

**Dependencias:** fisio.evaluation

**Eventos emitidos:** TreatmentPlanCreated, TreatmentPhaseAdvanced, TreatmentGoalAchieved, TreatmentPlanUpdated

**Eventos consumidos:** PhysioEvaluationCompleted, ReevaluationCompleted

**Telas:**
- Editor de plano terapeutico
- Catalogo de tecnicas
- Plano domiciliar
- Progresso por fase
- Relatorio PDF

---

### M27 — fisio.progress — Evolucao Clinica

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas |
| **Tipo** | Especifico de Fisio (estende ProgressNote) |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | AI geracao de evolucao, assinatura ICP-Brasil |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Evolucao por sessao (estruturado)
- Formato SOAP
- Resposta clinica, intercorrencias
- Dor (EVA por sessao), funcionalidade, adesao
- Historico cronologico
- Assinatura digital
- Exportacao de relatorio clinico
- Prontuario fisioterapeutico completo
- Templates reutilizaveis
- Texto assistido (frases prontas)

**Entidades:** ClinicalProgress, SOAPNote, SessionOutcome, ClinicalSignature

**Dependencias:** fisio.treatment

**Eventos emitidos:** ProgressNoteCreated, SessionOutcomeRecorded, ClinicalReportExported

**Eventos consumidos:** SessionCompleted, TreatmentPhaseAdvanced

**Telas:**
- Formulario SOAP
- Timeline de evolucoes
- Relatorio clinico PDF
- Templates

---

### M28 — fisio.exercises — Exercicios Terapeuticos

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas, pacientes |
| **Tipo** | Especifico de Fisio |
| **Prioridade** | P2 — Fase 2 |
| **Upsell** | Biblioteca premium, AI adaptacao, videos personalizados |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Biblioteca (300+ exercicios terapeuticos)
- Videos, instrucoes, ilustracoes
- Montagem de programa domiciliar
- Checklist de execucao para paciente
- Feedback de dor e dificuldade
- Progressoes/regressoes
- Restricoes e precaucoes
- Monitoramento de adesao domiciliar
- Entrega no portal/app
- PDF com imagens

**Entidades:** TherapeuticExercise, HomeProgram, HomeProgramExercise, ExerciseFeedback, DomiciliaryAdherence

**Dependencias:** fisio.treatment

**Eventos emitidos:** HomeProgramAssigned, ExerciseFeedbackReceived, DomiciliaryAdherenceRecorded

**Eventos consumidos:** TreatmentPlanCreated, TreatmentPhaseAdvanced

**Telas:**
- Biblioteca de exercicios
- Builder de programa domiciliar
- Programa no portal do paciente
- Dashboard de adesao
- PDF

---

### M29 — fisio.specialties — Especialidades Fisioterapeuticas

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico (submodulos) |
| **Publico-alvo** | Fisioterapeutas especialistas |
| **Tipo** | Especifico por especialidade |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | Submodulos individuais, AI por especialidade |
| **Valor percebido** | Alto para especialistas |

**Especialidades:**
- **Ortopedia/Traumato:** Protocolos pos-cirurgicos, escalas (IKDC, Lysholm, ASES)
- **Neurofuncional:** Escalas neuro (Ashworth, NIHSS, Fugl-Meyer), espasticidade, marcha neuro
- **Respiratoria:** Peak flow, MIP/MEP, manobras de higiene bronquica, ventilometria
- **Pelvica:** Assoalho pelvico, diario miccional, escalas de incontinencia, biofeedback
- **Geriatria:** Avaliacao geriatrica ampla, risco de queda (TUG, Berg), fragilidade
- **Pediatria:** Denver, Alberta, marcos motores, estimulacao

**Entidades:** SpecialtyProtocol, SpecialtyScale, SpecialtyAssessment

**Dependencias:** fisio.evaluation

**Telas:**
- Avaliacoes por especialidade
- Protocolos por especialidade
- Escalas (formularios)
- Relatorios tematicos

---

### M30 — fisio.clinic — Gestao de Clinica

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Donos/gestores de clinica |
| **Tipo** | Especifico de Fisio |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | Multi-unidade, integracao TISS, AI produtividade |
| **Valor percebido** | Muito alto para clinicas |

**Funcionalidades:**
- Agenda clinica por fisio e por sala/box
- Gestao de salas e boxes
- Gestao de convenios (tabelas, autorizacoes, guias TISS)
- Particular vs convenio
- Pacotes de sessoes
- Controle de autorizacoes
- Gestao de equipe
- Produtividade por profissional
- Repasse/comissao
- Taxa de ocupacao
- Relatorios de faturamento (particular + convenio)

**Entidades:** ClinicRoom, InsurancePlan, Authorization, TISSGuide, SessionPackage, ProductivityMetric

**Dependencias:** mod.agenda

**Telas:**
- Agenda por sala/box
- Convenios e autorizacoes
- Dashboard operacional
- Produtividade
- Faturamento
- Equipe

---

### M31 — fisio.remote — Telemonitoramento

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas, pacientes remotos |
| **Tipo** | Especifico de Fisio |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI analise de sintomas, monitoramento continuo |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Videochamada integrada
- Check-ins remotos
- Plano domiciliar digital
- Videos personalizados
- Reavaliacao remota
- Monitoramento de sintomas
- Acompanhamento pos-alta
- Educacao do paciente
- Agendamento de teleconsulta
- Registro no prontuario
- Consentimento de teleatendimento

**Entidades:** TeleSession, RemoteCheckIn, SymptomMonitor, PostDischargeFollowUp

**Dependencias:** fisio.treatment

**Telas:**
- Sala de teleconsulta
- Dashboard de pacientes remotos
- Check-in remoto
- Monitoramento de sintomas
- Agendamento

---

### M32 — fisio.outcomes — Desfechos Clinicos

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Fisioterapia — Especifico |
| **Publico-alvo** | Fisioterapeutas, coordenadores, gestores |
| **Tipo** | Especifico de Fisio |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI interpretacao, relatorios para convenios, benchmarking |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Evolucao de dor, funcionalidade, incapacidade, mobilidade, equilibrio, AVDs
- Metas clinicas com tracking
- Comparativo de reavaliacoes (graficos longitudinais)
- Relatorio de alta
- Relatorio para convenios
- Indicadores agregados (por profissional, patologia, unidade)

**Entidades:** ClinicalOutcome, OutcomeMetric, DischargeReport, OutcomeIndicator

**Dependencias:** fisio.progress

**Telas:**
- Dashboard de desfechos
- Relatorio de alta PDF
- Indicadores agregados
- Comparativo pre/pos

---

## CAMADA 5: Nutricao

### M33 — nutri.evaluation — Avaliacao Nutricional

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas |
| **Tipo** | Especifico de Nutricao (estende Evaluation) |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI resumo, analise automatizada de recordatorio |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Anamnese alimentar completa
- Recordatorio 24h
- Questionario de frequencia alimentar
- Historico clinico
- Rotina do paciente
- Preferencias e restricoes
- Alergias e intolerancias
- Suplementacao atual
- Sinais e sintomas
- Antropometria
- Composicao corporal
- Exames laboratoriais
- Avaliacao de ingestao calorica/macros
- Protocolos customizaveis
- Reavaliacoes com comparativo
- Graficos e relatorios PDF

**Entidades:** NutritionEvaluation, FoodRecall, FoodFrequency, AllergyRecord, LabExam, NutritionalAnthropometry, SymptomChecklist

**Dependencias:** core (clients, records)

**Eventos emitidos:** NutritionEvaluationCompleted, LabExamRecorded, ReevaluationCompleted

**Telas:**
- Formulario multi-step
- Recordatorio alimentar
- Exames laboratoriais
- Antropometria
- Comparativo de reavaliacoes
- Relatorio PDF

---

### M34 — nutri.mealplan — Plano Alimentar

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas |
| **Tipo** | Especifico de Nutricao (estende Plan) |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI montagem, banco de receitas premium, calculo automatico |
| **Valor percebido** | Altissimo |

**Funcionalidades:**
- Montagem de plano alimentar (refeicoes, horarios, alimentos, quantidades)
- Metas nutricionais (kcal, proteinas, carbs, gorduras)
- Equivalencias e substituicoes
- Lista de alimentos permitidos/evitados
- Orientacoes nutricionais
- Materiais de apoio (receitas, dicas, guias)
- Estrategias por objetivo
- Plano por dia e por semana
- Adaptacoes por rotina/preferencias
- Fases (adaptacao, desenvolvimento, manutencao)
- Distribuicao de macros
- Prescricao de suplementacao
- Guias alimentares de referencia
- Entrega no portal, PDF
- Templates reutilizaveis
- Banco de receitas

**Entidades:** NutritionPlan, Meal, MealItem, FoodEquivalence, NutritionalGoal, MealPlanTemplate, Recipe

**Dependencias:** nutri.evaluation

**Eventos emitidos:** MealPlanCreated, MealPlanUpdated, MealPlanDelivered

**Telas:**
- Builder (drag and drop)
- Calculadora nutricional
- Equivalencias
- Templates
- Banco de receitas
- Visualizacao do paciente
- PDF

---

### M35 — nutri.progress — Evolucao Nutricional

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas |
| **Tipo** | Especifico de Nutricao (estende ProgressNote) |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI deteccao de padroes, resumos entre consultas |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Evolucao por consulta
- Peso, medidas, composicao corporal por consulta
- Exames de acompanhamento
- Adesao ao plano (% relatada)
- Sintomas e bem-estar
- Disposicao, fome e saciedade
- Check-ins entre consultas
- Reavaliacoes formais
- Metas nutricionais e tracking
- Timeline cronologica
- Graficos de evolucao

**Entidades:** NutritionProgress, WeightRecord, LabFollowUp, AdherenceRecord, WellbeingCheck

**Dependencias:** nutri.mealplan

**Telas:**
- Formulario de evolucao
- Graficos (peso, medidas, exames)
- Timeline
- Dashboard de adesao

---

### M36 — nutri.foodlog — Diario Alimentar

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Pacientes, nutricionistas |
| **Tipo** | Especifico de Nutricao |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI analise do diario, reconhecimento de alimentos por foto |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Diario alimentar (registro por refeicao)
- Fotos das refeicoes
- Registro de agua
- Registro de sintomas GI
- Registro de fome/saciedade
- Horarios das refeicoes
- Checklist de habitos diarios
- Metas diarias
- Feedback do nutricionista
- Historico completo
- Relatorios semanais de aderencia

**Entidades:** FoodLog, FoodLogEntry, FoodPhoto, WaterLog, SymptomLog, HungerSatietyRecord, DailyChecklist

**Dependencias:** nutri.mealplan

**Telas:**
- Diario alimentar (mobile-friendly)
- Registro de agua
- Registro de sintomas
- Checklist do dia
- Historico timeline
- Painel do nutricionista

---

### M37 — nutri.supplements — Suplementacao

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas |
| **Tipo** | Especifico de Nutricao |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | Banco premium, AI rotina |
| **Valor percebido** | Medio |

**Funcionalidades:**
- Cadastro de suplementos
- Protocolos por objetivo
- Horarios e forma de uso
- Recomendacoes, materiais
- Tracking de adesao
- Calendario de suplementacao
- Vinculacao ao plano alimentar
- Alertas de interacoes
- Entrega no portal

**Entidades:** SupplementPrescription, Supplement, SupplementProtocol, SupplementSchedule, SupplementAdherence

**Dependencias:** nutri.evaluation

**Telas:**
- Cadastro/selecao de suplementos
- Prescricao
- Calendario do paciente
- Portal do paciente

---

### M38 — nutri.specialties — Especialidades da Nutricao

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico (submodulos) |
| **Publico-alvo** | Nutricionistas especialistas |
| **Tipo** | Especifico por especialidade |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | Submodulos individuais, AI, plano premium |
| **Valor percebido** | Alto para especialistas |

**Especialidades:**
- **Esportiva:** Periodizacao nutricional, pre/intra/pos-treino, hidratacao, ergogenicos
- **Emagrecimento/Comportamental:** Escalas comportamentais, mindful eating, humor/emocao
- **Clinica:** Protocolos por patologia (DM, HAS, renal, hepatica), dieta especifica, exames
- **Materno-Infantil:** Avaliacao gestacional, curvas de crescimento, intro alimentar, amamentacao
- **Funcional/Integrativa:** Detox, hipersensibilidades, modulacao intestinal
- **Hospitalar:** Triagem (NRS-2002, MNA), terapia nutricional, dietas hospitalares

**Entidades:** NutriSpecialtyProtocol, NutriSpecialtyAssessment, NutriSpecialtyIndicator

**Dependencias:** nutri.evaluation

**Telas:** Avaliacoes, protocolos, indicadores, relatorios por especialidade

---

### M39 — nutri.remote — Teleatendimento Nutricional

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas, pacientes remotos |
| **Tipo** | Especifico de Nutricao |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI resumo de consulta, monitoramento continuo |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Consulta online via video
- Onboarding remoto
- Plano alimentar digital
- Check-ins assincronos
- Mensagens assincronas
- Diario alimentar remoto
- Agendamento de video
- Materiais e orientacoes
- Consentimento de teleatendimento
- Registro no prontuario

**Entidades:** TeleNutritionSession, RemoteOnboarding, AsyncCheckIn

**Dependencias:** nutri.mealplan

**Telas:** Sala de teleconsulta, dashboard remoto, check-in, onboarding

---

### M40 — nutri.outcomes — Desfechos Nutricionais

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Nutricionistas, gestores clinicos |
| **Tipo** | Especifico de Nutricao |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI interpretacao, benchmarking |
| **Valor percebido** | Medio-alto |

**Funcionalidades:**
- Evolucao de peso, composicao corporal, adesao, sintomas, metas, exames
- Progresso clinico e nutricional consolidado
- Relatorios de resultado PDF
- Comparacao longitudinal multi-parametro
- Indicadores agregados

**Entidades:** NutritionOutcome, OutcomeChart, NutritionDischargeReport

**Dependencias:** nutri.progress

**Telas:** Dashboard desfechos, graficos, relatorios, indicadores

---

### M41 — nutri.office — Gestao de Consultorio

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Nutricao — Especifico |
| **Publico-alvo** | Donos/gestores de consultorio |
| **Tipo** | Especifico de Nutricao |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | Multi-unidade, AI previsao de ocupacao |
| **Valor percebido** | Alto para multiplos nutricionistas |

**Funcionalidades:**
- Agenda nutricional
- Gestao de retornos
- Pacotes de consultas
- Equipe de nutricionistas
- Produtividade
- Repasse/comissao
- Multiunidade
- Controle operacional
- Relatorios de ocupacao e financeiros

**Entidades:** NutriOfficeConfig, ConsultationPackage, NutriProductivity

**Dependencias:** mod.agenda

**Telas:** Agenda, dashboard operacional, produtividade, equipe, financeiro

---

## CAMADA 6: Multidisciplinares

### M42 — multi.evaluation — Avaliacao Integrada

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Multidisciplinar |
| **Publico-alvo** | Equipes multi, coordenadores, gestores clinicos |
| **Tipo** | Compartilhado (requer 2+ modulos de avaliacao) |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI resumo multidisciplinar, plano enterprise |
| **Valor percebido** | Muito alto — diferenciador principal |

**Funcionalidades:**
- Visao consolidada (EF + Fisio + Nutri em uma tela)
- Historico integrado por data
- Objetivos compartilhados
- Avaliacao multidisciplinar agregada
- Highlights por area
- Alertas interprofissionais
- Consolidado de restricoes e metas
- Dados consolidados de todos os dominios
- Timeline integrada

**Entidades:** IntegratedEvaluation, InterdisciplinaryAlert, SharedGoal, ConsolidatedRestriction

**Dependencias:** 2+ entre ef.evaluation, fisio.evaluation, nutri.evaluation

**Telas:**
- Ficha integrada 360
- Timeline unificada
- Alertas interprofissionais
- Metas compartilhadas
- Restricoes consolidadas

---

### M43 — multi.careplan — Plano Integrado de Cuidado

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Multidisciplinar |
| **Publico-alvo** | Equipes multi, coordenadores |
| **Tipo** | Compartilhado |
| **Prioridade** | P4 — Fase 4 |
| **Upsell** | AI coordenacao, plano enterprise premium |
| **Valor percebido** | Muito alto |

**Funcionalidades:**
- Objetivos compartilhados
- Plano multidisciplinar (visao macro)
- Fases de atendimento
- Cronograma integrado
- Metas por area com responsavel
- Visao macro do caso
- Transicao entre fases
- Plano combinado EF + Fisio + Nutri
- Reunioes de equipe
- Notas de alinhamento

**Entidades:** IntegratedPlan, CarePhase, PhaseCriteria, TeamNote, CarePathMilestone

**Dependencias:** multi.evaluation

**Telas:**
- Care path visual
- Plano integrado
- Cronograma
- Metas e milestones
- Notas de alinhamento

---

### M44 — multi.habits — Monitoramento de Habitos e Adesao

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Multidisciplinar |
| **Publico-alvo** | Todos os profissionais, clientes/pacientes |
| **Tipo** | Compartilhado |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI padroes, previsao de evasao, gamificacao avancada |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Registro de sono, dor, fadiga, estresse, humor, disposicao, agua
- Habitos customizaveis
- Adesao a treino, plano alimentar, programa domiciliar
- Check-ins recorrentes
- Relatorios de comportamento
- Alertas para profissionais
- Gamificacao (streaks, badges)

**Entidades:** HabitLog, SleepLog, PainLog, StressLog, MoodLog, WaterLog, AdherenceScore, HabitStreak

**Dependencias:** core (clients)

**Telas:**
- Check-in rapido (portal)
- Dashboard de habitos
- Painel do profissional
- Relatorios de comportamento
- Configuracao de habitos

---

### M45 — multi.referral — Encaminhamento Multidisciplinar

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Multidisciplinar |
| **Publico-alvo** | Profissionais de todas as areas |
| **Tipo** | Compartilhado |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | AI sugestao, sintese automatica |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Encaminhamento interno
- Solicitacao formal com resumo e justificativa
- Aceite/recusa pelo destino
- Status tracking (pendente, aceito, em atendimento, concluido)
- Handoff interno
- Historico por cliente
- Comentarios, anexos compartilhados
- Notificacoes

**Entidades:** Referral, ReferralNote, ReferralAttachment, ReferralStatus

**Dependencias:** core (clients, users)

**Telas:**
- Formulario de encaminhamento
- Inbox de recebidos
- Historico
- Detalhes
- Notificacoes

---

### M46 — multi.library — Biblioteca Integrada

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Multidisciplinar |
| **Publico-alvo** | Todos os profissionais |
| **Tipo** | Compartilhado |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | Biblioteca premium, AI recomendacao, marketplace |
| **Valor percebido** | Alto |

**Funcionalidades:**
- Biblioteca unificada (exercicios fitness + terapeuticos)
- Materiais educativos
- Protocolos clinicos e tecnicos
- Videos, imagens, orientacoes textuais
- Templates reutilizaveis
- Categorizacao por area
- Filtros avancados
- Favoritos
- Conteudo proprio do tenant + padrao da plataforma
- Busca semantica
- Compartilhamento com cliente

**Entidades:** LibraryItem, ExerciseItem, ProtocolItem, EducationalMaterial, LibraryCategory, LibraryFavorite, TenantContent, PlatformContent

**Dependencias:** core

**Telas:**
- Biblioteca unificada
- Visualizacao de item
- Gestao de conteudo proprio
- Favoritos
- Compartilhamento

---

## CAMADA 7: AI Suite

### M47 — ai.suite — AI Orquestrador

| Atributo | Detalhe |
|----------|---------|
| **Categoria** | AI — Add-on Premium |
| **Publico-alvo** | Todos com modulo ativo |
| **Tipo** | Compartilhado — transversal |
| **Prioridade** | P3 — Fase 3 |
| **Upsell** | Quotas, modelos premium, RAG customizado |
| **Valor percebido** | Alto (infraestrutura) |

**Funcionalidades:**
- Orquestrador de requisicoes
- Context builder
- Permission check
- Prompt engine
- LLM gateway (OpenAI, Anthropic)
- Response processor (guardrails)
- Audit logger
- Rate limiting e quotas por plano
- Dashboard de uso
- Configuracao por tenant
- RAG engine (embeddings + busca)
- Feedback loop

**Entidades:** AIRequest, AIResponse, AIFeedback, AIQuota, AIConfig, Embedding, RAGDocument

**Dependencias:** core

**Telas:** Dashboard de uso, configuracoes, log, feedback

---

### M48 — ai.copilot.commercial — Copiloto Comercial

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P4 — Fase 4 |
| **Dependencias** | ai.suite + mod.crm |

**Capacidades:** Lead scoring, sugestao de acao, geracao de mensagens, pipeline forecasting, alerta de lead frio, resumo de lead, sugestao de oferta, analise de perda

---

### M49 — ai.copilot.ops — Copiloto Operacional

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P4 — Fase 4 |
| **Dependencias** | ai.suite + mod.agenda |

**Capacidades:** Otimizacao de agenda, previsao de faltas, alerta de ociosidade, remanejamento, insights de ocupacao, previsao de demanda, alerta de sobrecarga

---

### M50 — ai.copilot.ef — Copiloto Educacao Fisica

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P3 — Fase 3 |
| **Dependencias** | ai.suite + ef.training |

**Capacidades:** Geracao de treino, sugestao de progressao, substituicao inteligente, leitura automatica de avaliacao, resumo do cliente, alerta de aderencia, explicacao do racional, ajuste por feedback

---

### M51 — ai.copilot.fisio — Copiloto Fisioterapia

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P3 — Fase 3 |
| **Dependencias** | ai.suite + fisio.evaluation |

**Capacidades:** Resumo de avaliacao, SOAP assistido, organizacao do caso, sintese de alta, progressao assistida, red flags, sugestao de escalas, padronizacao de texto, resumo pre-atendimento

---

### M52 — ai.copilot.nutri — Copiloto Nutricao

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P3 — Fase 3 |
| **Dependencias** | ai.suite + nutri.evaluation |

**Capacidades:** Resumo de anamnese, montagem de plano, analise de diario, variacoes de cardapio, adaptacao por restricoes, substituicoes, resumo entre consultas, alerta de adesao, feedback assistido

---

### M53 — ai.copilot.multi — Copiloto Multidisciplinar

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P4 — Fase 4 |
| **Dependencias** | ai.suite + multi.evaluation |

**Capacidades:** Resumo consolidado cross-domain, alertas de desalinhamento, sugestao de encaminhamento, visao integrada, identificacao de conflitos, consolidacao para handoff, apoio a coordenacao

---

### M54 — ai.copilot.tutor — AI Tutor Academico

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P4 — Fase 4 |
| **Dependencias** | ai.suite + mod.education |

**Capacidades:** Explicacao de conteudos, casos comentados, simulados adaptativos, plano de estudo personalizado, apoio em estagio, correcao comentada, feedback sobre relatorios, tutoria interativa (chat)

---

### M55 — ai.copilot.analytics — AI Analytics

| Atributo | Detalhe |
|----------|---------|
| **Prioridade** | P4 — Fase 4 |
| **Dependencias** | ai.suite + mod.analytics |

**Capacidades:** Perguntas em linguagem natural, explicacao de dashboards, insights executivos, previsoes, sugestoes de acao, deteccao de anomalias, comparacao inteligente, resumo narrativo, alertas preditivos

---

## Visao Panoramica Consolidada

### Por Camada

| Camada | Modulos | Compartilhados | Especificos |
|--------|---------|----------------|-------------|
| Core | 11 | 11 | 0 |
| Compartilhados | 7 | 7 | 0 |
| Ed. Fisica | 6 | 0 | 6 |
| Fisioterapia | 8 | 0 | 8 |
| Nutricao | 9 | 0 | 9 |
| Multidisciplinar | 5 | 5 | 0 |
| AI Suite | 9 | 6 | 3 |
| **Total** | **55** | **29** | **26** |

### Por Prioridade

| Prioridade | Modulos | Periodo |
|------------|---------|---------|
| P0 (MVP) | core.auth, core.users, core.clients, core.records, core.documents, core.notifications, core.tenant, core.billing, core.portal, mod.agenda, mod.financial, ef.evaluation, ef.training | Meses 1-4 |
| P1 | core.consent, core.audit, mod.portal | Meses 3-5 |
| P2 | mod.crm, mod.communication, ef.monitoring, ef.facility, fisio.evaluation, fisio.treatment, fisio.progress, fisio.exercises, ef.school (reordenado) | Meses 5-8 |
| P3 | mod.analytics, fisio.clinic, fisio.outcomes, nutri.evaluation, nutri.mealplan, nutri.progress, nutri.foodlog, nutri.outcomes, nutri.office, multi.evaluation, multi.habits, multi.referral, multi.library, ai.suite, ai.copilot.ef, ai.copilot.fisio, ai.copilot.nutri | Meses 9-12 |
| P4 | mod.education, ef.performance, ef.school, fisio.specialties, fisio.remote, nutri.supplements, nutri.specialties, nutri.remote, multi.careplan, ai.copilot.commercial, ai.copilot.ops, ai.copilot.multi, ai.copilot.tutor, ai.copilot.analytics | Meses 13-18 |
