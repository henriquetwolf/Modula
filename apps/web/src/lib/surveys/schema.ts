import { z } from 'zod'

export const QUESTION_TYPES = [
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'scale_0_10',
  'email',
  'number',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Texto curto',
  long_text: 'Texto longo',
  single_choice: 'Escolha única',
  multiple_choice: 'Múltipla escolha',
  scale_0_10: 'Escala 0 a 10',
  email: 'E-mail',
  number: 'Número',
}

export const CHOICE_TYPES: QuestionType[] = ['single_choice', 'multiple_choice']

export function isChoiceQuestion(type: QuestionType): boolean {
  return CHOICE_TYPES.includes(type)
}

export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(QUESTION_TYPES),
  label: z.string().trim().min(1, 'A pergunta precisa de um título'),
  description: z.string().trim().default(''),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1, 'Opção não pode ficar vazia')).default([]),
})

export type Question = z.infer<typeof questionSchema>

export const questionsSchema = z
  .array(questionSchema)
  .superRefine((questions, ctx) => {
    questions.forEach((question, index) => {
      if (isChoiceQuestion(question.type) && question.options.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'options'],
          message: 'Perguntas de escolha precisam de pelo menos 2 opções',
        })
      }
    })
  })

export const SURVEY_STATUSES = ['draft', 'published', 'closed'] as const
export type SurveyStatus = (typeof SURVEY_STATUSES)[number]

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  closed: 'Encerrado',
}

/** Texto do botao de envio quando a pesquisa nao define um proprio. */
export const DEFAULT_SUBMIT_LABEL = 'Enviar resposta'
export const SUBMIT_LABEL_MAX_LENGTH = 60

export const SURVEY_BRANDING_TEXT = 'Formulário criado com Modula Health'

export const LOGO_URL_MAX_LENGTH = 2000

export const surveyUpdateSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(200),
  description: z.string().trim().max(2000).default(''),
  submit_label: z
    .string()
    .trim()
    .max(SUBMIT_LABEL_MAX_LENGTH, `O texto do botão deve ter no máximo ${SUBMIT_LABEL_MAX_LENGTH} caracteres`)
    .default(''),
  logo_url: z
    .string()
    .trim()
    .max(LOGO_URL_MAX_LENGTH)
    .refine((value) => value === '' || z.url().safeParse(value).success, {
      message: 'Informe uma URL válida para a logo',
    })
    .default(''),
  show_branding: z.boolean().default(false),
  questions: questionsSchema,
  status: z.enum(SURVEY_STATUSES).optional(),
})

export type SurveyUpdateInput = z.infer<typeof surveyUpdateSchema>

export interface Survey {
  id: string
  title: string
  description: string | null
  /** Texto do botao de envio; null usa DEFAULT_SUBMIT_LABEL. */
  submit_label: string | null
  /** URL da imagem exibida acima do formulario publico. */
  logo_url: string | null
  /** Exibe o rodape "Formulario criado com Modula Health". */
  show_branding: boolean
  public_slug: string
  results_token: string
  questions: Question[]
  status: SurveyStatus
  created_at: string
  updated_at: string
}

export interface SurveyResponse {
  id: string
  answers: Record<string, AnswerValue>
  submitted_at: string
  /** Preenchido quando a resposta foi arquivada; null quando ativa. */
  archived_at: string | null
}

export type AnswerValue = string | string[]

/** Alfabeto sem caracteres ambiguos (0/O, 1/l/I) para links digitados a mao. */
const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

function randomString(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

/** Identificador curto do link publico de resposta: /f/{slug} */
export function generateSlug(): string {
  return randomString(10, SLUG_ALPHABET)
}

/** Token longo e imprevisivel do link publico de resultados: /r/{token} */
export function generateResultsToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + randomString(12, SLUG_ALPHABET)
}

export function createEmptyQuestion(type: QuestionType = 'short_text'): Question {
  return {
    id: crypto.randomUUID(),
    type,
    label: '',
    description: '',
    required: false,
    options: isChoiceQuestion(type) ? ['Opção 1', 'Opção 2'] : [],
  }
}

function buildFieldSchema(question: Question): z.ZodTypeAny {
  if (question.type === 'multiple_choice') {
    const allowed = new Set(question.options)
    return z
      .array(z.string())
      .default([])
      .superRefine((values, ctx) => {
        if (question.required && values.length === 0) {
          ctx.addIssue({ code: 'custom', message: 'Selecione ao menos uma opção' })
        }
        if (values.some((value) => !allowed.has(value))) {
          ctx.addIssue({ code: 'custom', message: 'Opção inválida' })
        }
      })
  }

  return z
    .string()
    .max(5000)
    .default('')
    .superRefine((value, ctx) => {
      if (value === '') {
        if (question.required) {
          ctx.addIssue({ code: 'custom', message: 'Campo obrigatório' })
        }
        return
      }

      switch (question.type) {
        case 'single_choice':
          if (!question.options.includes(value)) {
            ctx.addIssue({ code: 'custom', message: 'Opção inválida' })
          }
          break
        case 'scale_0_10': {
          const parsed = Number(value)
          if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) {
            ctx.addIssue({ code: 'custom', message: 'Informe um valor de 0 a 10' })
          }
          break
        }
        case 'number':
          if (!Number.isFinite(Number(value))) {
            ctx.addIssue({ code: 'custom', message: 'Informe um número válido' })
          }
          break
        case 'email':
          if (!z.email().safeParse(value).success) {
            ctx.addIssue({ code: 'custom', message: 'E-mail inválido' })
          }
          break
        default:
          if (question.required && value.trim().length === 0) {
            ctx.addIssue({ code: 'custom', message: 'Campo obrigatório' })
          }
          break
      }
    })
}

/**
 * Monta um validador de respostas a partir das perguntas salvas.
 * Usado no servidor para nao confiar no payload enviado pelo cliente.
 */
export function buildAnswersSchema(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const question of questions) {
    shape[question.id] = buildFieldSchema(question)
  }
  return z.object(shape)
}

/** Texto legivel de uma resposta, usado na tabela de resultados e no CSV. */
export function formatAnswer(value: AnswerValue | undefined): string {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
