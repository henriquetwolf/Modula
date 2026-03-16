-- ============================================================================
-- MODULA HEALTH — Migration 013: Seed Data
-- System roles, SaaS plans, module catalog, exercise categories
-- ============================================================================

-- ============================================================================
-- SYSTEM ROLES
-- ============================================================================

INSERT INTO public.roles (name, display_name, description, is_system, hierarchy_level) VALUES
    ('platform_admin', 'Admin da Plataforma', 'Acesso total ao sistema (Modula Health)', true, 100),
    ('owner',          'Dono',                'Proprietario do tenant',                   true, 90),
    ('admin',          'Administrador',        'Administrador do tenant',                  true, 80),
    ('manager',        'Gestor',              'Gestor de unidade(s)',                     true, 70),
    ('professional',   'Profissional',        'Profissional de saude',                    true, 50),
    ('intern',         'Estagiario',          'Estudante em estagio supervisionado',      true, 30),
    ('reception',      'Recepcionista',       'Atendimento e recepcao',                   true, 40),
    ('student',        'Estudante',           'Estudante (mod.education)',                true, 20),
    ('client',         'Cliente',             'Cliente/paciente/aluno',                   true, 10);

-- ============================================================================
-- DEFAULT ROLE PERMISSIONS (professional role as example)
-- ============================================================================

INSERT INTO public.role_permissions (role_id, module_code, resource, actions) VALUES
    -- Owner: full access to everything
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.clients', 'client_profiles', '{create,read,update,delete,export}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.records', 'evaluations', '{create,read,update,delete,export}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.records', 'plans', '{create,read,update,delete,export}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'mod.agenda', 'appointments', '{create,read,update,delete,export}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'mod.financial', 'payments', '{create,read,update,delete,export}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.users', 'user_profiles', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.billing', 'saas_subscriptions', '{read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'core.audit', 'audit_logs', '{read}'),

    -- Professional: clinical operations
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'core.clients', 'client_profiles', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'core.records', 'evaluations', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'core.records', 'plans', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'core.records', 'progress_notes', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'core.documents', 'documents', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'mod.agenda', 'appointments', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'ef.training', 'training_plans', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'ef.training', 'exercises', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'professional'), 'mod.financial', 'payments', '{read}'),

    -- Reception: scheduling + check-in
    ((SELECT id FROM public.roles WHERE name = 'reception'), 'core.clients', 'client_profiles', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'reception'), 'mod.agenda', 'appointments', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'reception'), 'mod.financial', 'payments', '{create,read}'),

    -- Client: self-service portal
    ((SELECT id FROM public.roles WHERE name = 'client'), 'core.records', 'evaluations', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'client'), 'core.records', 'plans', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'client'), 'mod.agenda', 'appointments', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'client'), 'mod.financial', 'payments', '{read}');

-- ============================================================================
-- MODULE CATALOG
-- ============================================================================

INSERT INTO public.module_catalog (code, name, description, category, is_core, price_monthly_cents, trial_days, sort_order) VALUES
    -- Core (always active, included in all plans)
    ('core.auth',           'Autenticacao',              'Login, MFA, recuperacao de senha',               'core', true, 0, 0, 1),
    ('core.users',          'Gestao de Usuarios',        'Cadastro de profissionais e equipe',             'core', true, 0, 0, 2),
    ('core.clients',        'Cadastro de Clientes',      'Ficha 360 unificada de clientes',                'core', true, 0, 0, 3),
    ('core.records',        'Prontuario Base',           'Timeline e registros clinicos base',              'core', true, 0, 0, 4),
    ('core.documents',      'Documentos e Anexos',       'Upload e gestao de arquivos',                    'core', true, 0, 0, 5),
    ('core.consent',        'Consentimentos LGPD',       'Termos de consentimento e LGPD',                 'core', true, 0, 0, 6),
    ('core.notifications',  'Notificacoes',              'Central de notificacoes in-app',                  'core', true, 0, 0, 7),
    ('core.tenant',         'Config do Tenant',          'Configuracoes da empresa e unidades',             'core', true, 0, 0, 8),
    ('core.billing',        'Billing SaaS',              'Gestao de plano e modulos SaaS',                  'core', true, 0, 0, 9),
    ('core.audit',          'Auditoria',                 'Logs de auditoria e rastreabilidade',             'core', true, 0, 0, 10),
    ('core.portal',         'Portal Base',               'Portal basico do cliente/paciente',               'core', true, 0, 0, 11),

    -- Shared modules (optional, purchasable)
    ('mod.crm',            'Modula CRM',                'Funil de vendas, leads, propostas',               'shared', false, 4900, 14, 20),
    ('mod.agenda',         'Modula Agenda',             'Agendamento, confirmacao, check-in',              'shared', false, 3900, 14, 21),
    ('mod.financial',      'Modula Financeiro',         'Cobrancas, pagamentos, repasses',                 'shared', false, 4900, 14, 22),
    ('mod.communication',  'Modula Comunicacao',        'WhatsApp, email, campanhas',                      'shared', false, 3900, 14, 23),
    ('mod.analytics',      'Modula Analytics',          'BI, dashboards, relatorios',                      'shared', false, 5900, 14, 24),
    ('mod.education',      'Modula Education',          'Estagio, supervisao, trilhas',                    'shared', false, 3900, 14, 25),
    ('mod.portal',         'Modula Portal App',         'Portal avancado do cliente',                      'shared', false, 2900, 14, 26),

    -- EF Domain
    ('ef.evaluation',      'Avaliacao Fisica',          'Composicao corporal, testes funcionais',          'ef', false, 4900, 14, 30),
    ('ef.training',        'Prescricao de Treino',      'Builder de treinos, biblioteca, periodizacao',    'ef', false, 5900, 14, 31),
    ('ef.monitoring',      'Monitoramento EF',          'Evolucao, aderencia, comparativos',               'ef', false, 3900, 14, 32),
    ('ef.facility',        'Gestao de Studio',          'Grade de horarios, turmas, check-in',             'ef', false, 4900, 14, 33),
    ('ef.performance',     'Performance Esportiva',     'Periodizacao, testes especificos',                'ef', false, 5900, 14, 34),
    ('ef.school',          'EF Escolar',                'Turmas, chamada, planejamento',                   'ef', false, 3900, 14, 35),

    -- Physio Domain
    ('fisio.evaluation',   'Avaliacao Fisioterapeutica','Dor, ADM, forca, testes ortopedicos',            'physio', false, 5900, 14, 40),
    ('fisio.treatment',    'Plano Terapeutico',        'Objetivos, condutas, progresso',                  'physio', false, 5900, 14, 41),
    ('fisio.progress',     'Evolucao Clinica',         'SOAP, registro de sessao',                        'physio', false, 4900, 14, 42),
    ('fisio.exercises',    'Exercicios Terapeuticos',   'Programa domiciliar, progressao',                 'physio', false, 3900, 14, 43),
    ('fisio.outcomes',     'Desfechos Clinicos',        'Escalas, resultados, alta',                       'physio', false, 3900, 14, 44),
    ('fisio.clinic',       'Gestao de Clinica',         'Salas, equipamentos, financeiro',                 'physio', false, 4900, 14, 45),
    ('fisio.specialties',  'Especialidades Fisio',      'Neuro, esportiva, pediatrica',                    'physio', false, 4900, 14, 46),
    ('fisio.remote',       'Telemonitoramento',         'Acompanhamento remoto',                           'physio', false, 3900, 14, 47),

    -- Nutrition Domain
    ('nutri.evaluation',   'Avaliacao Nutricional',     'Recordatorio, antropometria, exames',             'nutri', false, 5900, 14, 50),
    ('nutri.mealplan',     'Plano Alimentar',           'Builder visual, calculos nutricionais',           'nutri', false, 5900, 14, 51),
    ('nutri.progress',     'Evolucao Nutricional',      'Indicadores, tendencias',                         'nutri', false, 4900, 14, 52),
    ('nutri.foodlog',      'Diario Alimentar',          'Registro pelo cliente, fotos',                    'nutri', false, 3900, 14, 53),
    ('nutri.outcomes',     'Desfechos Nutricionais',    'Metas, aderencia, resultados',                    'nutri', false, 3900, 14, 54),
    ('nutri.office',       'Gestao de Consultorio',     'Sala, equipamentos, agenda',                      'nutri', false, 4900, 14, 55),
    ('nutri.supplements',  'Suplementacao',             'Prescricao de suplementos',                       'nutri', false, 2900, 14, 56),
    ('nutri.specialties',  'Especialidades Nutri',      'Esportiva, clinica, pediatrica',                  'nutri', false, 4900, 14, 57),
    ('nutri.remote',       'Teleatendimento',           'Consulta remota',                                 'nutri', false, 3900, 14, 58),

    -- Multidisciplinary
    ('multi.evaluation',   'Avaliacao Integrada',       'Avaliacao multi-profissional',                    'multi', false, 5900, 14, 60),
    ('multi.careplan',     'Plano de Cuidado',          'Plano integrado entre profissionais',             'multi', false, 5900, 14, 61),
    ('multi.habits',       'Monitoramento de Habitos',  'Sono, agua, humor, dor',                          'multi', false, 2900, 14, 62),
    ('multi.referral',     'Encaminhamentos',           'Encaminhamento entre profissionais',               'multi', false, 2900, 14, 63),
    ('multi.library',      'Biblioteca Integrada',      'Materiais educativos compartilhados',             'multi', false, 1900, 14, 64),

    -- AI Suite
    ('ai.suite',              'AI Suite Core',             'Orquestrador de IA',                           'ai', false, 9900, 7, 70),
    ('ai.copilot.ef',         'Copiloto EF',               'IA para treinos e avaliacao fisica',           'ai', false, 4900, 7, 71),
    ('ai.copilot.fisio',      'Copiloto Fisio',            'IA para fisioterapia',                         'ai', false, 4900, 7, 72),
    ('ai.copilot.nutri',      'Copiloto Nutri',            'IA para nutricao',                             'ai', false, 4900, 7, 73),
    ('ai.copilot.commercial', 'Copiloto Comercial',        'IA para vendas e CRM',                        'ai', false, 4900, 7, 74),
    ('ai.copilot.ops',        'Copiloto Operacional',      'IA para gestao operacional',                  'ai', false, 4900, 7, 75),
    ('ai.copilot.multi',      'Copiloto Multidisciplinar', 'IA para equipes multi',                       'ai', false, 4900, 7, 76),
    ('ai.copilot.tutor',      'AI Tutor',                  'IA para ensino e estagio',                    'ai', false, 3900, 7, 77),
    ('ai.copilot.analytics',  'AI Analytics',              'IA para insights e previsoes',                 'ai', false, 5900, 7, 78);

-- ============================================================================
-- SAAS PLANS
-- ============================================================================

INSERT INTO public.saas_plans (name, slug, tier, description, price_monthly_cents, price_annual_cents, max_users, max_clients, max_units, max_storage_gb, ai_tokens_monthly, included_modules, sort_order) VALUES
    (
        'Starter',
        'starter',
        'starter',
        'Para profissionais autonomos comecando. Inclui core + 1 area de atuacao.',
        9900,
        95000,
        2,
        50,
        1,
        2,
        0,
        ARRAY['core.auth','core.users','core.clients','core.records','core.documents','core.consent','core.notifications','core.tenant','core.billing','core.audit','core.portal','mod.agenda'],
        1
    ),
    (
        'Professional',
        'professional',
        'professional',
        'Para profissionais com carteira de clientes. Core + area + financeiro + portal.',
        19900,
        190000,
        5,
        200,
        1,
        5,
        1000,
        ARRAY['core.auth','core.users','core.clients','core.records','core.documents','core.consent','core.notifications','core.tenant','core.billing','core.audit','core.portal','mod.agenda','mod.financial','mod.portal'],
        2
    ),
    (
        'Business',
        'business',
        'business',
        'Para studios, clinicas e equipes. Core + areas + CRM + comunicacao + analytics.',
        49900,
        479000,
        20,
        1000,
        3,
        20,
        5000,
        ARRAY['core.auth','core.users','core.clients','core.records','core.documents','core.consent','core.notifications','core.tenant','core.billing','core.audit','core.portal','mod.agenda','mod.financial','mod.portal','mod.crm','mod.communication','mod.analytics'],
        3
    ),
    (
        'Enterprise',
        'enterprise',
        'enterprise',
        'Para centros multidisciplinares e redes. Tudo incluso + white-label + AI.',
        99900,
        959000,
        NULL, -- unlimited
        NULL, -- unlimited
        NULL, -- unlimited
        100,
        50000,
        ARRAY['core.auth','core.users','core.clients','core.records','core.documents','core.consent','core.notifications','core.tenant','core.billing','core.audit','core.portal','mod.agenda','mod.financial','mod.portal','mod.crm','mod.communication','mod.analytics','mod.education','ai.suite'],
        4
    );

-- ============================================================================
-- EXERCISE CATEGORIES (system library)
-- ============================================================================

INSERT INTO public.exercise_categories (name, slug, icon, is_system, sort_order) VALUES
    ('Peito',           'peito',           'dumbbell',     true, 1),
    ('Costas',          'costas',          'back',         true, 2),
    ('Ombros',          'ombros',          'shoulder',     true, 3),
    ('Biceps',          'biceps',          'bicep',        true, 4),
    ('Triceps',         'triceps',         'tricep',       true, 5),
    ('Quadriceps',      'quadriceps',      'leg',          true, 6),
    ('Posterior de Coxa','posterior-coxa',  'hamstring',    true, 7),
    ('Gluteos',         'gluteos',         'glute',        true, 8),
    ('Panturrilha',     'panturrilha',     'calf',         true, 9),
    ('Abdomen',         'abdomen',         'core',         true, 10),
    ('Antebraco',       'antebraco',       'forearm',      true, 11),
    ('Trapezio',        'trapezio',        'trap',         true, 12),
    ('Cardio',          'cardio',          'heart',        true, 13),
    ('Funcional',       'funcional',       'functional',   true, 14),
    ('Alongamento',     'alongamento',     'stretch',      true, 15),
    ('Mobilidade',      'mobilidade',      'mobility',     true, 16);

-- ============================================================================
-- SAMPLE EXERCISES (system library — starter set)
-- ============================================================================

INSERT INTO public.exercises (name, slug, muscle_groups, primary_muscle, equipment, difficulty, modality, movement_pattern, is_system) VALUES
    -- Peito
    ('Supino Reto com Barra',       'supino-reto-barra',       '{chest,triceps,anterior_deltoid}',  'chest', '{barbell,bench}', 'intermediate', 'strength', 'push', true),
    ('Supino Inclinado com Halteres','supino-inclinado-halter', '{chest,triceps,anterior_deltoid}',  'chest', '{dumbbell,incline_bench}', 'intermediate', 'strength', 'push', true),
    ('Crucifixo com Halteres',       'crucifixo-halter',       '{chest}',                           'chest', '{dumbbell,bench}', 'beginner', 'strength', 'push', true),
    ('Flexao de Bracos',             'flexao-bracos',           '{chest,triceps,anterior_deltoid}',  'chest', '{bodyweight}', 'beginner', 'strength', 'push', true),
    ('Crossover no Cabo',            'crossover-cabo',          '{chest}',                           'chest', '{cable_machine}', 'intermediate', 'strength', 'push', true),

    -- Costas
    ('Puxada Frontal',               'puxada-frontal',          '{lats,biceps,rear_deltoid}',        'lats', '{cable_machine}', 'beginner', 'strength', 'pull', true),
    ('Remada Curvada com Barra',     'remada-curvada-barra',    '{lats,rhomboids,biceps}',           'lats', '{barbell}', 'intermediate', 'strength', 'pull', true),
    ('Remada Unilateral com Halter', 'remada-unilateral',       '{lats,rhomboids,biceps}',           'lats', '{dumbbell,bench}', 'beginner', 'strength', 'pull', true),
    ('Pullover com Halter',          'pullover-halter',         '{lats,chest}',                      'lats', '{dumbbell,bench}', 'intermediate', 'strength', 'pull', true),
    ('Barra Fixa',                   'barra-fixa',              '{lats,biceps,rear_deltoid}',        'lats', '{pull_up_bar}', 'advanced', 'strength', 'pull', true),

    -- Ombros
    ('Desenvolvimento com Halteres', 'desenvolvimento-halter',  '{anterior_deltoid,lateral_deltoid,triceps}', 'anterior_deltoid', '{dumbbell}', 'intermediate', 'strength', 'push', true),
    ('Elevacao Lateral',             'elevacao-lateral',         '{lateral_deltoid}',                 'lateral_deltoid', '{dumbbell}', 'beginner', 'strength', 'push', true),
    ('Elevacao Frontal',             'elevacao-frontal',         '{anterior_deltoid}',                'anterior_deltoid', '{dumbbell}', 'beginner', 'strength', 'push', true),
    ('Face Pull',                    'face-pull',               '{rear_deltoid,rhomboids}',          'rear_deltoid', '{cable_machine}', 'beginner', 'strength', 'pull', true),

    -- Biceps
    ('Rosca Direta com Barra',       'rosca-direta-barra',      '{biceps}',                          'biceps', '{barbell}', 'beginner', 'strength', 'pull', true),
    ('Rosca Alternada com Halteres', 'rosca-alternada',         '{biceps}',                          'biceps', '{dumbbell}', 'beginner', 'strength', 'pull', true),
    ('Rosca Martelo',                'rosca-martelo',           '{biceps,brachialis}',               'biceps', '{dumbbell}', 'beginner', 'strength', 'pull', true),

    -- Triceps
    ('Triceps Pulley',               'triceps-pulley',          '{triceps}',                         'triceps', '{cable_machine}', 'beginner', 'strength', 'push', true),
    ('Triceps Testa com Barra',      'triceps-testa',           '{triceps}',                         'triceps', '{barbell,bench}', 'intermediate', 'strength', 'push', true),
    ('Mergulho em Paralelas',        'mergulho-paralelas',      '{triceps,chest,anterior_deltoid}',  'triceps', '{parallel_bars}', 'intermediate', 'strength', 'push', true),

    -- Quadriceps
    ('Agachamento Livre',            'agachamento-livre',       '{quadriceps,glutes,hamstrings}',    'quadriceps', '{barbell,squat_rack}', 'intermediate', 'strength', 'squat', true),
    ('Leg Press 45',                 'leg-press-45',            '{quadriceps,glutes,hamstrings}',    'quadriceps', '{leg_press}', 'beginner', 'strength', 'squat', true),
    ('Cadeira Extensora',            'cadeira-extensora',       '{quadriceps}',                      'quadriceps', '{machine}', 'beginner', 'strength', 'squat', true),
    ('Afundo com Halteres',          'afundo-halteres',         '{quadriceps,glutes}',               'quadriceps', '{dumbbell}', 'intermediate', 'strength', 'lunge', true),
    ('Hack Squat',                   'hack-squat',              '{quadriceps,glutes}',               'quadriceps', '{machine}', 'intermediate', 'strength', 'squat', true),

    -- Posterior / Gluteos
    ('Stiff com Barra',              'stiff-barra',             '{hamstrings,glutes,lower_back}',    'hamstrings', '{barbell}', 'intermediate', 'strength', 'hinge', true),
    ('Mesa Flexora',                 'mesa-flexora',            '{hamstrings}',                      'hamstrings', '{machine}', 'beginner', 'strength', 'hinge', true),
    ('Hip Thrust com Barra',         'hip-thrust',              '{glutes,hamstrings}',               'glutes', '{barbell,bench}', 'intermediate', 'strength', 'hinge', true),
    ('Elevacao Pelvica',             'elevacao-pelvica',        '{glutes}',                          'glutes', '{bodyweight}', 'beginner', 'strength', 'hinge', true),

    -- Abdomen
    ('Abdominal Crunch',             'crunch',                  '{abs}',                             'abs', '{bodyweight}', 'beginner', 'strength', 'rotation', true),
    ('Prancha Isometrica',           'prancha',                 '{abs,obliques}',                    'abs', '{bodyweight}', 'beginner', 'strength', 'rotation', true),
    ('Abdominal Infra',              'abdominal-infra',         '{abs}',                             'abs', '{bodyweight}', 'beginner', 'strength', 'rotation', true),

    -- Cardio
    ('Esteira',                      'esteira',                 '{cardio}',                          'cardio', '{treadmill}', 'beginner', 'cardio', NULL, true),
    ('Bicicleta Ergometrica',        'bike',                    '{cardio,quadriceps}',               'cardio', '{bike}', 'beginner', 'cardio', NULL, true),
    ('Eliptico',                     'eliptico',                '{cardio}',                          'cardio', '{elliptical}', 'beginner', 'cardio', NULL, true),
    ('Pular Corda',                  'pular-corda',             '{cardio,calves}',                   'cardio', '{jump_rope}', 'intermediate', 'cardio', NULL, true);

-- ============================================================================
-- CONSENT TEMPLATES (system-wide LGPD defaults)
-- ============================================================================

INSERT INTO public.consent_templates (title, content, category, is_required, is_active) VALUES
    (
        'Termo de Consentimento para Tratamento de Dados Pessoais',
        'Eu autorizo a coleta, armazenamento e tratamento dos meus dados pessoais para fins de prestacao de servicos de saude conforme a Lei Geral de Protecao de Dados (LGPD - Lei 13.709/2018). Os dados serao utilizados exclusivamente para: gestao do meu atendimento, historico clinico, comunicacao sobre agendamentos e servicos contratados.',
        'data_processing',
        true,
        true
    ),
    (
        'Termo de Consentimento para Avaliacao e Tratamento',
        'Declaro estar ciente e concordar com a realizacao de avaliacoes e procedimentos indicados pelo profissional de saude responsavel. Fui informado(a) sobre os objetivos, metodos e possiveis riscos envolvidos.',
        'treatment',
        true,
        true
    ),
    (
        'Autorizacao para Uso de Imagem',
        'Autorizo o uso de imagens (fotos e videos) captadas durante avaliacoes e atendimentos para fins de acompanhamento clinico, registros em prontuario e, quando autorizado separadamente, para fins educativos.',
        'image_use',
        false,
        true
    ),
    (
        'Termo de Compartilhamento de Dados entre Profissionais',
        'Autorizo o compartilhamento dos meus dados clinicos entre os profissionais da equipe multidisciplinar vinculados ao meu atendimento, para fins de integracao e melhoria da qualidade do cuidado.',
        'data_sharing',
        false,
        true
    );

-- ============================================================================
-- NOTIFICATION TEMPLATES (system defaults)
-- ============================================================================

INSERT INTO public.notification_templates (event_type, channel, title_template, body_template, is_system) VALUES
    ('appointment_reminder',    'in_app',    'Lembrete de Consulta',           'Voce tem uma consulta amanha as {{time}} com {{professional_name}}.', true),
    ('appointment_reminder',    'whatsapp',  'Lembrete de Consulta',           'Ola {{client_name}}! Lembrete: voce tem consulta amanha ({{date}}) as {{time}} com {{professional_name}}. Confirme respondendo SIM.', true),
    ('appointment_confirmed',   'in_app',    'Consulta Confirmada',            'Sua consulta de {{date}} as {{time}} foi confirmada.',                true),
    ('appointment_cancelled',   'in_app',    'Consulta Cancelada',             'A consulta de {{date}} as {{time}} foi cancelada.',                   true),
    ('payment_due',             'in_app',    'Pagamento Pendente',             'Voce tem um pagamento de {{amount}} com vencimento em {{due_date}}.', true),
    ('payment_due',             'whatsapp',  'Pagamento Pendente',             'Ola {{client_name}}! Seu pagamento de {{amount}} vence em {{due_date}}. Link: {{payment_url}}', true),
    ('payment_received',        'in_app',    'Pagamento Recebido',             'Recebemos seu pagamento de {{amount}}. Obrigado!',                   true),
    ('payment_overdue',         'in_app',    'Pagamento em Atraso',            'Seu pagamento de {{amount}} esta em atraso desde {{due_date}}.',      true),
    ('new_training_plan',       'in_app',    'Novo Treino Disponivel',         '{{professional_name}} criou um novo treino para voce!',               true),
    ('evaluation_completed',    'in_app',    'Avaliacao Concluida',            'Sua avaliacao com {{professional_name}} foi registrada.',              true),
    ('welcome',                 'in_app',    'Bem-vindo ao Modula Health!',    'Sua conta foi criada com sucesso. Explore o sistema e comece a usar!', true),
    ('invitation_received',     'email',     'Convite para Modula Health',     'Voce foi convidado(a) por {{inviter_name}} para participar de {{tenant_name}} no Modula Health. Clique no link para aceitar: {{invite_url}}', true);
