export interface PermissionAction {
  key: string
  label: string
}

export interface PermissionResource {
  resource: string
  label: string
  actions: PermissionAction[]
}

export interface PermissionModule {
  moduleCode: string
  label: string
  resources: PermissionResource[]
}

const STANDARD_ACTIONS: PermissionAction[] = [
  { key: 'create', label: 'Criar' },
  { key: 'read', label: 'Visualizar' },
  { key: 'update', label: 'Editar' },
  { key: 'delete', label: 'Excluir' },
  { key: 'export', label: 'Exportar' },
]

const READ_ONLY_ACTIONS: PermissionAction[] = [
  { key: 'read', label: 'Visualizar' },
]

const CRUD_ACTIONS: PermissionAction[] = [
  { key: 'create', label: 'Criar' },
  { key: 'read', label: 'Visualizar' },
  { key: 'update', label: 'Editar' },
  { key: 'delete', label: 'Excluir' },
]

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    moduleCode: 'core.clients',
    label: 'Clientes',
    resources: [
      { resource: 'client_profiles', label: 'Cadastro de Clientes', actions: STANDARD_ACTIONS },
    ],
  },
  {
    moduleCode: 'core.records',
    label: 'Prontuario',
    resources: [
      { resource: 'evaluations', label: 'Avaliacoes', actions: STANDARD_ACTIONS },
      { resource: 'plans', label: 'Planos', actions: STANDARD_ACTIONS },
      { resource: 'progress_notes', label: 'Notas de Evolucao', actions: CRUD_ACTIONS },
    ],
  },
  {
    moduleCode: 'core.documents',
    label: 'Documentos',
    resources: [
      { resource: 'documents', label: 'Documentos e Anexos', actions: CRUD_ACTIONS },
    ],
  },
  {
    moduleCode: 'core.users',
    label: 'Equipe',
    resources: [
      { resource: 'user_profiles', label: 'Usuarios', actions: CRUD_ACTIONS },
    ],
  },
  {
    moduleCode: 'mod.agenda',
    label: 'Agenda',
    resources: [
      { resource: 'appointments', label: 'Agendamentos', actions: STANDARD_ACTIONS },
    ],
  },
  {
    moduleCode: 'mod.financial',
    label: 'Financeiro',
    resources: [
      { resource: 'payments', label: 'Pagamentos', actions: STANDARD_ACTIONS },
    ],
  },
  {
    moduleCode: 'ef.training',
    label: 'Treinos (EF)',
    resources: [
      { resource: 'training_plans', label: 'Planos de Treino', actions: CRUD_ACTIONS },
      { resource: 'exercises', label: 'Exercicios', actions: READ_ONLY_ACTIONS },
    ],
  },
  {
    moduleCode: 'core.billing',
    label: 'Plano SaaS',
    resources: [
      { resource: 'saas_subscriptions', label: 'Assinatura', actions: [
        { key: 'read', label: 'Visualizar' },
        { key: 'update', label: 'Editar' },
      ]},
    ],
  },
  {
    moduleCode: 'core.audit',
    label: 'Auditoria',
    resources: [
      { resource: 'audit_logs', label: 'Logs de Auditoria', actions: READ_ONLY_ACTIONS },
    ],
  },
]

export const SYSTEM_ROLES = [
  'platform_admin',
  'owner',
  'admin',
  'manager',
  'professional',
  'reception',
  'intern',
  'student',
  'client',
] as const

export type SystemRole = (typeof SYSTEM_ROLES)[number]

export const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'Admin da Plataforma',
  owner: 'Dono',
  admin: 'Administrador',
  manager: 'Gestor',
  professional: 'Profissional',
  reception: 'Recepcionista',
  intern: 'Estagiario',
  student: 'Estudante',
  client: 'Cliente',
}

export const PROFESSION_LABELS: Record<string, string> = {
  ef: 'Educacao Fisica',
  physio: 'Fisioterapia',
  nutrition: 'Nutricao',
}
