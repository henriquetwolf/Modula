# MODULA HEALTH — Mapa de Integracoes Externas

## 1. Visao Geral

```
┌───────────────────────────────────────────────────────────────┐
│                     MODULA HEALTH                              │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Payments │  │ Messaging│  │ Calendar │  │ Storage  │      │
│  │ Stripe   │  │ WhatsApp │  │ Google   │  │ R2/S3    │      │
│  │ Asaas    │  │ Email    │  │ CalDAV   │  │          │      │
│  └────┬─────┘  │ SMS      │  └────┬─────┘  └────┬─────┘      │
│       │        │ Push     │       │              │            │
│       │        └────┬─────┘       │              │            │
│       │             │             │              │            │
│  ┌────▼─────────────▼─────────────▼──────────────▼─────┐      │
│  │              Integration Layer                       │      │
│  │         (Adapters + Event Handlers)                  │      │
│  └────┬─────────────┬─────────────┬──────────────┬─────┘      │
│       │             │             │              │            │
│  ┌────▼─────┐  ┌────▼────┐  ┌────▼─────┐  ┌────▼─────┐      │
│  │ Video    │  │ Search  │  │ AI/LLM   │  │ Analytics│      │
│  │ Daily.co │  │ Meili   │  │ OpenAI   │  │ PostHog  │      │
│  │          │  │ search  │  │ Anthropic│  │          │      │
│  └──────────┘  └─────────┘  └──────────┘  └──────────┘      │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Signature│  │ Ads      │  │ Fiscal   │  │ Feature  │      │
│  │ Clicksign│  │ Meta API │  │ Focus NFe│  │ Unleash  │      │
│  │ DocuSign │  │ Google   │  │ Nuvem    │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Catalogo de Integracoes

### 2.1 Pagamentos (Cliente Final)

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Stripe |
| **Alternativa** | Asaas (BR nativo), PagSeguro |
| **Uso** | Cobrar clientes finais (planos, pacotes, sessoes) |
| **Modulos** | mod.financial |
| **Metodos** | Pix, boleto, cartao de credito/debito |
| **Features** | Cobranca recorrente, links de pagamento, webhooks, customer portal |

**Integracao:**
```typescript
// Webhook handler
@Post('webhooks/stripe')
async handleStripeWebhook(@Body() body: any, @Headers('stripe-signature') sig: string) {
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.financialService.confirmPayment(event.data.object);
      await this.eventBus.publish(new PaymentReceivedEvent(/* ... */));
      break;
    case 'invoice.payment_failed':
      await this.financialService.markPaymentFailed(event.data.object);
      await this.eventBus.publish(new PaymentFailedEvent(/* ... */));
      break;
  }
}
```

### 2.2 Billing SaaS (Cobrar Tenants)

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Stripe Billing |
| **Alternativa** | Lago (OSS) |
| **Uso** | Cobrar assinatura SaaS dos tenants |
| **Modulos** | core.billing |
| **Features** | Planos, add-ons, trials, metering, customer portal, proration |

### 2.3 WhatsApp

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Evolution API (self-hosted) |
| **Alternativa** | Twilio, Z-API |
| **Uso** | Mensagens, lembretes de consulta, confirmacoes, reativacao |
| **Modulos** | mod.communication, core.notifications, mod.crm |
| **Custo** | Sem custo por mensagem (self-hosted) |

**Fluxos:**
- Lembrete de consulta (24h e 1h antes)
- Confirmacao/cancelamento pelo cliente
- Link de pagamento
- Onboarding de novo cliente
- Reativacao de clientes inativos
- Follow-up de leads

### 2.4 E-mail Transacional

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Resend |
| **Alternativa** | SendGrid |
| **Uso** | Notificacoes, onboarding, convites, recuperacao de senha |
| **Modulos** | core.notifications, core.auth, mod.communication |

**Templates:**
- Convite para plataforma
- Recuperacao de senha
- Confirmacao de agendamento
- Fatura disponivel
- Lembrete de pagamento
- Novo encaminhamento recebido
- Relatorio semanal

### 2.5 E-mail Marketing

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Resend + listas |
| **Alternativa** | Mailchimp |
| **Uso** | Campanhas de aquisicao, newsletters, promocoes |
| **Modulos** | mod.communication |

### 2.6 SMS

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Twilio |
| **Alternativa** | Zenvia |
| **Uso** | Lembretes criticos (fallback quando WhatsApp nao disponivel) |
| **Modulos** | core.notifications |

### 2.7 Calendario

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Google Calendar API |
| **Alternativa** | CalDAV |
| **Uso** | Sync bidirecional de agenda |
| **Modulos** | mod.agenda |
| **Sync** | Bidirecional — criar/atualizar/cancelar agendamentos |

### 2.8 Assinatura Digital

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Clicksign |
| **Alternativa** | DocuSign |
| **Uso** | Contratos, termos de consentimento, laudos |
| **Modulos** | mod.crm, core.consent, core.documents |

### 2.9 Object Storage

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Cloudflare R2 |
| **Alternativa** | AWS S3 |
| **Uso** | Arquivos, imagens, videos de exercicios, fotos de evolucao |
| **Modulos** | core.documents, ef.training, mod.portal |
| **Vantagem** | Sem egress fees (R2) |

### 2.10 Video (Teleconsulta)

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Daily.co |
| **Alternativa** | Twilio Video, Jitsi |
| **Uso** | Teleconsulta, atendimento remoto |
| **Modulos** | fisio.remote, nutri.remote |
| **Features** | WebRTC managed, SDK, gravacao (com consentimento) |

### 2.11 Analytics (Produto)

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | PostHog (self-hosted) |
| **Alternativa** | Amplitude |
| **Uso** | Product analytics, funil, retencao, feature usage |
| **Modulos** | Platform-wide |

### 2.12 Observabilidade

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Sentry + Better Stack |
| **Alternativa** | Datadog |
| **Uso** | Error tracking, APM, logs, uptime monitoring |
| **Modulos** | Platform-wide |

### 2.13 Search

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Meilisearch (Cloud) |
| **Alternativa** | Elasticsearch |
| **Uso** | Busca full-text (clientes, exercicios, protocolos, prontuario) |
| **Modulos** | core.clients, multi.library, core.records |

### 2.14 Ads / Marketing

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Meta Marketing API + Google Ads API |
| **Uso** | Tracking de conversao, importacao de leads |
| **Modulos** | mod.crm |
| **Features** | Pixel tracking, conversao offline, leads |

### 2.15 Feature Flags

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Unleash (self-hosted) |
| **Alternativa** | LaunchDarkly |
| **Uso** | Feature management, module activation |
| **Modulos** | core.billing, core.tenant |

### 2.16 AI/LLM

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | OpenAI API (GPT-4o, GPT-4o-mini) |
| **Alternativa** | Anthropic (Claude), Azure OpenAI |
| **Uso** | Copilotos, RAG, analytics |
| **Modulos** | ai.* |
| **Strategy** | OpenAI primary, Anthropic fallback |

### 2.17 Embeddings/RAG

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | OpenAI Embeddings (text-embedding-3-small) + pgvector |
| **Uso** | Busca semantica em biblioteca, protocolos, materiais |
| **Modulos** | ai.suite, multi.library |

### 2.18 Nota Fiscal

| Atributo | Detalhe |
|----------|---------|
| **Recomendado** | Focus NFe |
| **Alternativa** | Nuvem Fiscal |
| **Uso** | Emissao de NF-e/NFS-e |
| **Modulos** | mod.financial |
| **Fase** | P3+ (upsell) |

---

## 3. Padrao de Integracao

### 3.1 Adapter Pattern

Cada integracao implementa um adapter com interface definida:

```typescript
// Interface generica
interface PaymentGateway {
  createPayment(data: CreatePaymentDTO): Promise<PaymentResult>;
  confirmPayment(reference: string): Promise<PaymentConfirmation>;
  refund(paymentId: string, amount?: number): Promise<RefundResult>;
  createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResult>;
  handleWebhook(payload: any, signature: string): Promise<WebhookEvent>;
}

// Adapter Stripe
@Injectable()
class StripePaymentAdapter implements PaymentGateway {
  async createPayment(data: CreatePaymentDTO): Promise<PaymentResult> {
    const intent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'brl',
      metadata: { tenantId: data.tenantId, clientId: data.clientId },
    });
    return { id: intent.id, status: 'pending', checkoutUrl: intent.url };
  }
}

// Adapter Asaas
@Injectable()
class AsaasPaymentAdapter implements PaymentGateway {
  async createPayment(data: CreatePaymentDTO): Promise<PaymentResult> {
    // Implementacao com Asaas API
  }
}
```

### 3.2 Configuration por Tenant

Cada tenant pode ter configuracoes diferentes de integracao:

```typescript
interface TenantIntegrationConfig {
  payments: {
    provider: 'stripe' | 'asaas';
    apiKey: string; // encrypted
    webhookSecret: string; // encrypted
  };
  messaging: {
    whatsapp: {
      provider: 'evolution' | 'twilio';
      instanceId: string;
      apiKey: string;
    };
    email: {
      provider: 'resend' | 'sendgrid';
      apiKey: string;
      fromEmail: string;
      fromName: string;
    };
  };
  calendar: {
    provider: 'google' | 'caldav' | null;
    credentials: string; // encrypted OAuth token
  };
}
```

---

## 4. Tabela de Prioridade de Integracoes

| Prioridade | Integracao | Fase |
|-----------|-----------|------|
| P0 (MVP) | Stripe (pagamentos), Resend (email), Cloudflare R2 (storage) | Meses 1-4 |
| P0 (MVP) | Meilisearch (search), Redis/BullMQ (events), PostgreSQL | Meses 1-4 |
| P1 | Evolution API (WhatsApp), Google Calendar | Meses 3-6 |
| P1 | Sentry + Better Stack (observabilidade) | Meses 1-2 |
| P2 | Clicksign (assinatura), PostHog (analytics), Unleash (flags) | Meses 5-8 |
| P3 | OpenAI API (AI), pgvector (RAG), Daily.co (video) | Meses 9-12 |
| P3 | Meta/Google Ads APIs | Meses 9-12 |
| P4 | Focus NFe (nota fiscal), Anthropic (AI fallback) | Meses 13-18 |
| P4 | Asaas (gateway BR alternativo), SMS (Twilio) | Meses 13-18 |

---

## 5. Webhooks Recebidos

| Fonte | Endpoint | Eventos |
|-------|----------|---------|
| Stripe | `/webhooks/stripe` | payment_intent.succeeded, invoice.payment_failed, customer.subscription.updated |
| Asaas | `/webhooks/asaas` | PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED |
| Evolution API | `/webhooks/whatsapp` | message.received, message.sent, status.update |
| Clicksign | `/webhooks/clicksign` | document.signed, document.refused |
| Google Calendar | `/webhooks/gcal` | event.created, event.updated, event.deleted |

---

## 6. Webhooks Enviados

Para integracoes externas com sistemas dos tenants:

| Evento | Payload | Uso |
|--------|---------|-----|
| `client.created` | ClientProfile | Sincronizar com sistema externo |
| `appointment.scheduled` | Appointment | Integracao com sistemas legados |
| `payment.received` | Payment | ERP do tenant |
| `evaluation.completed` | Evaluation (sem dados sensiveis) | Relatorios externos |
