-- ============================================================================
-- MODULA HEALTH — Migration 024: Student Seed Data
-- SaaS plans, module catalog, role permissions, sample case studies & tracks
-- ============================================================================

-- ============================================================================
-- STUDENT MODULES IN MODULE CATALOG
-- ============================================================================

INSERT INTO public.module_catalog (code, name, description, category, is_core, price_monthly_cents, trial_days, sort_order) VALUES
    ('student.core',         'Core Academico',           'Perfil academico, dashboard, metas de formacao',           'student', false, 0, 0, 80),
    ('student.study',        'Educacao e Estudo',        'Trilhas, flashcards, simulados, notas, metas',             'student', false, 0, 0, 81),
    ('student.internship',   'Estagio e Supervisao',     'Diario, registro de horas, supervisor, feedback',          'student', false, 0, 0, 82),
    ('student.portfolio',    'Portfolio Academico',       'Portfolio, certificados, competencias, CV',                'student', false, 0, 0, 83),
    ('student.cases',        'Casos Praticos',           'Biblioteca de casos simulados, resolucao guiada',          'student', false, 0, 0, 84),
    ('student.research',     'Pesquisa Cientifica',      'Busca federada de artigos, biblioteca, fichamentos',       'student', false, 1900, 14, 85),
    ('student.tutor',        'AI Tutor Academico',       'Chat tutor por area, explicacoes, quiz adaptativo',        'student', false, 2900, 7, 86),
    ('student.organization', 'Organizacao Academica',    'Agenda, tarefas, plano semanal, produtividade',            'student', false, 0, 0, 87),
    ('student.career',       'Preparacao Profissional',  'Transicao estudante-profissional, checklist, upgrade',     'student', false, 1900, 14, 88)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SAAS PLANS FOR STUDENTS
-- ============================================================================

INSERT INTO public.saas_plans (name, slug, tier, description, price_monthly_cents, price_annual_cents, max_users, max_clients, max_units, max_storage_gb, ai_tokens_monthly, included_modules, sort_order) VALUES
    (
        'Modula Student',
        'student',
        'student',
        'Para estudantes de saude. Estudo, pesquisa cientifica, estagio, portfolio e AI Tutor.',
        2990,
        28700,
        1,
        0,
        1,
        1,
        30,
        ARRAY[
            'core.auth','core.users','core.documents','core.notifications',
            'core.tenant','core.billing','core.audit',
            'student.core','student.study','student.internship','student.portfolio',
            'student.cases','student.research','student.tutor','student.organization'
        ],
        5
    ),
    (
        'Modula Student Plus',
        'student-plus',
        'student_plus',
        'Tudo do Student + pesquisa ilimitada, AI Tutor avancado, portfolio publico e preparacao profissional.',
        4990,
        47900,
        1,
        0,
        1,
        5,
        300,
        ARRAY[
            'core.auth','core.users','core.documents','core.notifications',
            'core.tenant','core.billing','core.audit',
            'student.core','student.study','student.internship','student.portfolio',
            'student.cases','student.research','student.tutor','student.organization',
            'student.career'
        ],
        6
    )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STUDENT ROLE PERMISSIONS
-- ============================================================================

INSERT INTO public.role_permissions (role_id, module_code, resource, actions) VALUES
    -- Student role (when inside a professional tenant — e.g., linked to institution)
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.core', 'student_profiles', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'study_tracks', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'study_sessions', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'flashcard_decks', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'flashcards', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'quizzes', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'study_notes', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'study_goals', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'reading_lists', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.study', 'question_bank', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.internship', 'internship_records', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.internship', 'internship_entries', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.internship', 'internship_supervisors', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.internship', 'internship_reports', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.internship', 'competency_assessments', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.portfolio', 'portfolio_items', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.portfolio', 'portfolio_sections', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.portfolio', 'competency_records', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.portfolio', 'academic_cv', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.cases', 'case_studies', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.cases', 'case_attempts', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.cases', 'case_discussions', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'article_metadata', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'user_article_collections', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'user_article_saves', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'article_notes', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'article_fichamentos', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.research', 'research_queries', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.tutor', 'tutor_conversations', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.tutor', 'tutor_messages', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.tutor', 'tutor_feedback', '{create}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.organization', 'academic_events', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.organization', 'academic_tasks', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.organization', 'weekly_plans', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'student'), 'student.organization', 'productivity_logs', '{create,read}')
ON CONFLICT (role_id, module_code, resource) DO NOTHING;

-- Owner role also gets all student permissions (student is owner of own tenant)
INSERT INTO public.role_permissions (role_id, module_code, resource, actions) VALUES
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.core', 'student_profiles', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'study_tracks', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'study_sessions', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'flashcard_decks', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'flashcards', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'quizzes', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'study_notes', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'study_goals', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'reading_lists', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.study', 'question_bank', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.internship', 'internship_records', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.internship', 'internship_entries', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.internship', 'internship_supervisors', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.internship', 'internship_reports', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.internship', 'competency_assessments', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.portfolio', 'portfolio_items', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.portfolio', 'portfolio_sections', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.portfolio', 'competency_records', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.portfolio', 'academic_cv', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.cases', 'case_studies', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.cases', 'case_attempts', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.cases', 'case_discussions', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'article_metadata', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'user_article_collections', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'user_article_saves', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'article_notes', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'article_fichamentos', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.research', 'research_queries', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.tutor', 'tutor_conversations', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.tutor', 'tutor_messages', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.tutor', 'tutor_feedback', '{create}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.organization', 'academic_events', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.organization', 'academic_tasks', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.organization', 'weekly_plans', '{create,read,update,delete}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.organization', 'productivity_logs', '{create,read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.career', 'career_checklists', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.career', 'career_interests', '{create,read,update}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.career', 'upgrade_readiness', '{read}'),
    ((SELECT id FROM public.roles WHERE name = 'owner'), 'student.career', 'career_milestones', '{create,read}')
ON CONFLICT (role_id, module_code, resource) DO NOTHING;

-- ============================================================================
-- SAMPLE STUDY TRACKS (system)
-- ============================================================================

DELETE FROM public.study_tracks WHERE is_system = true;

INSERT INTO public.study_tracks (area, title, description, difficulty, estimated_hours, is_system, sort_order) VALUES
    -- Educacao Fisica
    ('ef', 'Fundamentos da Avaliacao Fisica', 'Composicao corporal, testes funcionais e interpretacao de resultados', 'beginner', 20, true, 1),
    ('ef', 'Prescricao de Treino Resistido', 'Principios de periodizacao, prescricao e progressao de cargas', 'intermediate', 30, true, 2),
    ('ef', 'Fisiologia do Exercicio Aplicada', 'Adaptacoes neuromusculares, metabolicas e cardiovasculares', 'intermediate', 25, true, 3),
    ('ef', 'Exercicio e Populacoes Especiais', 'Prescricao para idosos, gestantes, cardiopatas e diabeticos', 'advanced', 35, true, 4),

    -- Fisioterapia
    ('physio', 'Avaliacao Musculoesqueletica', 'Anamnese, inspecao, palpacao, testes especiais e diagnostico funcional', 'beginner', 25, true, 10),
    ('physio', 'Fisioterapia Ortopedica', 'Reabilitacao de ombro, joelho, coluna e tornozelo', 'intermediate', 40, true, 11),
    ('physio', 'Fisioterapia Neurologica', 'AVE, Parkinson, lesao medular e paralisia cerebral', 'advanced', 35, true, 12),
    ('physio', 'Testes Ortopedicos Especiais', 'McMurray, Lachman, Neer, Phalen, Thomas e outros', 'intermediate', 20, true, 13),

    -- Nutricao
    ('nutrition', 'Avaliacao Nutricional Completa', 'Antropometria, recordatorio 24h, frequencia alimentar, exames', 'beginner', 20, true, 20),
    ('nutrition', 'Calculo de Plano Alimentar', 'GET, macronutrientes, micronutrientes, adequacao e equivalencias', 'intermediate', 30, true, 21),
    ('nutrition', 'Nutricao Esportiva', 'Periodizacao nutricional, suplementacao, hidratacao e composicao corporal', 'intermediate', 25, true, 22),
    ('nutrition', 'Nutricao Clinica', 'Diabetes, hipertensao, doenca renal, obesidade e desnutricao', 'advanced', 35, true, 23);

-- ============================================================================
-- SAMPLE CASE STUDIES (system)
-- ============================================================================

DELETE FROM public.case_studies WHERE is_system = true;

INSERT INTO public.case_studies (area, specialty, title, description, difficulty, history, exam_findings, questions, expected_outcomes, tags, is_system) VALUES
    -- Fisioterapia
    (
        'physio', 'Ortopedia',
        'Tendinopatia Patelar em Corredor Amador',
        'Paciente de 28 anos, corredor amador, apresenta dor anterior no joelho direito ha 3 meses, pior ao subir escadas e ao agachar.',
        'intermediate',
        'Homem, 28 anos, corredor amador (5x/semana, 40km/semana). Dor insidiosa no joelho D ha 3 meses. Sem trauma. Pior ao subir/descer escadas e ao agachar. Alivia com repouso. Ja usou anti-inflamatorio sem melhora significativa.',
        'Inspecao: sem edema visivel. Palpacao: dor no polo inferior da patela D. ADM preservada. Forca: leve deficit de extensores de joelho D. Testes: Clark positivo, compressao patelar positiva. Marcha sem alteracoes evidentes.',
        '[{"question": "Qual sua hipotese diagnostica principal?", "type": "open"}, {"question": "Quais testes especiais voce realizaria e por que?", "type": "open"}, {"question": "Proponha uma conduta fisioterapeutica inicial.", "type": "open"}]',
        '{"diagnosis": "Tendinopatia patelar", "key_tests": ["Clark", "Compressao patelar", "Single leg decline squat"], "initial_treatment": "Exercicios isometricos de quadriceps, fortalecimento excentrico progressivo, educacao sobre carga"}',
        '{fisioterapia,ortopedia,joelho,tendinopatia,corrida}',
        true
    ),
    (
        'physio', 'Ortopedia',
        'Lombalgia Cronica Inespecifica em Sedentario',
        'Paciente de 45 anos, sedentario, trabalha sentado 8h/dia, com dor lombar cronica ha 6 meses sem irradiacao.',
        'beginner',
        'Homem, 45 anos, analista de sistemas. Dor lombar ha 6 meses, sem irradiacao para membros inferiores. Sedentario. IMC 28. Sem historia de trauma. Exames de imagem sem alteracoes significativas.',
        'Postura: hiperlordose lombar, anterializacao de ombros. Palpacao: hipertonia paravertebral bilateral. ADM: limitacao de flexao lombar. Forca: fraqueza de estabilizadores profundos. Lasegue negativo bilateral. Neurológico preservado.',
        '[{"question": "Classifique este quadro segundo as bandeiras vermelhas e amarelas.", "type": "open"}, {"question": "Qual abordagem terapeutica baseada em evidencia voce sugere?", "type": "open"}]',
        '{"diagnosis": "Lombalgia cronica inespecifica", "flags": "Sem bandeiras vermelhas. Possivel bandeira amarela: sedentarismo e crencas de evitacao.", "treatment": "Exercicio terapeutico ativo, educacao em dor, fortalecimento de core, orientacao ergonomica"}',
        '{fisioterapia,ortopedia,coluna,lombalgia}',
        true
    ),
    -- Educacao Fisica
    (
        'ef', 'Treinamento',
        'Prescricao de Treino para Idoso Hipertenso',
        'Homem de 68 anos, hipertenso controlado, sedentario, deseja iniciar atividade fisica orientada.',
        'intermediate',
        'Homem, 68 anos, aposentado. Hipertensao arterial controlada com medicacao (losartana 50mg). Sedentario ha 10 anos. Liberado pelo cardiologista para atividade fisica. Deseja melhorar condicionamento e disposicao. Sem outras comorbidades.',
        'PA: 130/80 mmHg. FC repouso: 72 bpm. IMC: 27. Forca: abaixo da media para faixa etaria. Flexibilidade: reduzida em MMII. Equilibrio: leve instabilidade no apoio unipodal.',
        '[{"question": "Quais cuidados especiais devem ser considerados na prescricao?", "type": "open"}, {"question": "Prescreva um mesociclo inicial de 4 semanas.", "type": "open"}]',
        '{"key_considerations": "Monitoramento da PA, evitar Valsalva, progressao gradual, treino combinado aerobio + resistido", "prescription": "3x/semana: aerobio 20-30min (caminhada) + resistido 2-3 series de 12-15 reps em 6-8 exercicios multiarticulares"}',
        '{educacao_fisica,treinamento,idoso,hipertensao,prescricao}',
        true
    ),
    -- Nutricao
    (
        'nutrition', 'Clinica',
        'Avaliacao Nutricional em Paciente com Diabetes Tipo 2',
        'Mulher de 55 anos, diabetes tipo 2, sobrepeso, busca orientacao nutricional para controle glicemico.',
        'intermediate',
        'Mulher, 55 anos, professora. DM2 diagnosticado ha 2 anos. Usa metformina 850mg 2x/dia. HbA1c: 7.8%. Glicemia de jejum: 140 mg/dL. Sobrepeso (IMC 29). Sedentaria. Alimentacao irregular, pula refeicoes, alto consumo de ultraprocessados.',
        'Recordatorio 24h: cafe (pao frances com margarina + cafe com acucar), almoco (arroz, feijao, carne frita, salada pouca), lanche (biscoito recheado + suco de caixa), jantar (similar ao almoco). Sem fracionamento adequado.',
        '[{"question": "Identifique os principais problemas nutricionais.", "type": "open"}, {"question": "Proponha metas nutricionais para os proximos 3 meses.", "type": "open"}, {"question": "Esboce orientacoes alimentares praticas.", "type": "open"}]',
        '{"problems": "Baixo fracionamento, excesso de ultraprocessados, acucar simples, gordura saturada, baixa ingestao de fibras e hortalicas", "goals": "HbA1c < 7%, perda de 5% do peso, fracionamento em 5-6 refeicoes", "guidelines": "Trocar acucar por adocante, incluir fibras em todas refeicoes, reduzir frituras, aumentar hortalicas, fracionar refeicoes"}',
        '{nutricao,clinica,diabetes,avaliacao_nutricional}',
        true
    );

-- ============================================================================
-- SAMPLE QUESTION BANK (system)
-- ============================================================================

DELETE FROM public.question_bank WHERE is_system = true;

INSERT INTO public.question_bank (area, discipline, topic, question_text, options, correct_option_index, explanation, difficulty, tags, is_system) VALUES
    -- Educacao Fisica
    ('ef', 'Fisiologia do Exercicio', 'Metabolismo Energetico',
     'Qual sistema energetico e predominante em exercicios de alta intensidade e curta duracao (ate 10 segundos)?',
     '[{"text": "Sistema oxidativo"}, {"text": "Sistema ATP-CP (fosfageno)"}, {"text": "Glicólise anaerobica"}, {"text": "Beta-oxidacao"}]',
     1, 'O sistema ATP-CP (fosfageno) fornece energia imediata para esforcos de altissima intensidade com duracao de ate 10 segundos, como sprints curtos e saltos.', 'beginner',
     '{fisiologia,metabolismo,energia}', true),

    ('ef', 'Fisiologia do Exercicio', 'Adaptacoes ao Treinamento',
     'Qual o principal mecanismo responsavel pela hipertrofia muscular em resposta ao treinamento resistido?',
     '[{"text": "Aumento do numero de fibras musculares (hiperplasia)"}, {"text": "Aumento da area de secao transversa das fibras existentes"}, {"text": "Aumento do tecido conjuntivo intramuscular"}, {"text": "Aumento dos estoques de glicogenio"}]',
     1, 'A hipertrofia muscular ocorre principalmente pelo aumento da area de secao transversa das fibras ja existentes, e nao pela criacao de novas fibras.', 'intermediate',
     '{fisiologia,hipertrofia,treinamento}', true),

    ('ef', 'Treinamento Esportivo', 'Periodizacao',
     'Na periodizacao classica de Matveev, qual fase e caracterizada por alto volume e baixa intensidade?',
     '[{"text": "Periodo competitivo"}, {"text": "Periodo preparatorio geral"}, {"text": "Periodo de transicao"}, {"text": "Periodo preparatorio especifico"}]',
     1, 'O periodo preparatorio geral e marcado por cargas de alto volume e baixa intensidade, visando construir base aerobica e resistencia geral.', 'intermediate',
     '{treinamento,periodizacao}', true),

    ('ef', 'Avaliacao Fisica', 'Composicao Corporal',
     'Qual protocolo de dobras cutaneas utiliza 7 pontos anatomicos para estimar o percentual de gordura?',
     '[{"text": "Protocolo de Guedes (3 dobras)"}, {"text": "Protocolo de Pollock (7 dobras)"}, {"text": "Protocolo de Durnin-Womersley (4 dobras)"}, {"text": "Protocolo de Faulkner (4 dobras)"}]',
     1, 'O protocolo de Pollock utiliza 7 dobras cutaneas: peitoral, axilar media, triceps, subescapular, abdominal, supra-iliaca e coxa.', 'beginner',
     '{avaliacao,composicao_corporal,antropometria}', true),

    -- Fisioterapia
    ('physio', 'Ortopedia', 'Testes Especiais',
     'O teste de Lachman avalia a integridade de qual estrutura do joelho?',
     '[{"text": "Ligamento colateral medial"}, {"text": "Ligamento cruzado anterior"}, {"text": "Menisco medial"}, {"text": "Ligamento cruzado posterior"}]',
     1, 'O teste de Lachman e o teste mais sensivel para avaliar a integridade do ligamento cruzado anterior (LCA), realizado com o joelho em 20-30 graus de flexao.', 'beginner',
     '{ortopedia,joelho,testes_especiais}', true),

    ('physio', 'Ortopedia', 'Ombro',
     'O teste de Neer e utilizado para avaliar qual condicao do ombro?',
     '[{"text": "Instabilidade glenoumeral"}, {"text": "Impacto subacromial"}, {"text": "Lesao de SLAP"}, {"text": "Capsulite adesiva"}]',
     1, 'O teste de Neer avalia o impacto subacromial. Realiza-se elevacao passiva do braco em rotacao interna, provocando dor pela compressao do tendao do supraespinhal contra o acromio.', 'intermediate',
     '{ortopedia,ombro,impacto}', true),

    ('physio', 'Neurologia', 'AVE',
     'Qual escala padronizada e mais utilizada para avaliar a gravidade do AVE agudo?',
     '[{"text": "Escala de Rankin modificada"}, {"text": "Escala NIHSS"}, {"text": "Indice de Barthel"}, {"text": "Escala de Ashworth"}]',
     1, 'A NIHSS (National Institutes of Health Stroke Scale) e a escala padrao para avaliar a gravidade do AVE agudo, com pontuacao de 0 a 42.', 'intermediate',
     '{neurologia,ave,escalas}', true),

    ('physio', 'Respiratoria', 'Espirometria',
     'Na espirometria, a relacao VEF1/CVF menor que 70% sugere qual padrao ventilatorio?',
     '[{"text": "Padrao restritivo"}, {"text": "Padrao obstrutivo"}, {"text": "Padrao misto"}, {"text": "Normal"}]',
     1, 'A relacao VEF1/CVF (indice de Tiffeneau) menor que 70% indica padrao obstrutivo, caracteristico de doencas como DPOC e asma.', 'intermediate',
     '{respiratoria,espirometria,dpoc}', true),

    -- Nutricao
    ('nutrition', 'Nutricao Clinica', 'Diabetes',
     'Qual a recomendacao de fibras diarias para pacientes com diabetes tipo 2, segundo a SBD?',
     '[{"text": "Minimo de 14g por dia"}, {"text": "Minimo de 20g por dia"}, {"text": "Minimo de 35g por dia"}, {"text": "Minimo de 50g por dia"}]',
     1, 'A SBD recomenda pelo menos 20g de fibras por dia para diabeticos. Dietas ricas em fibras soluveis ajudam no controle glicemico.', 'beginner',
     '{nutricao_clinica,diabetes,fibras}', true),

    ('nutrition', 'Nutricao Esportiva', 'Suplementacao',
     'Qual suplemento possui a evidencia cientifica mais robusta para aumento de forca e potencia muscular?',
     '[{"text": "BCAA"}, {"text": "Creatina monoidratada"}, {"text": "Glutamina"}, {"text": "Beta-alanina"}]',
     1, 'A creatina monoidratada e o suplemento com maior nivel de evidencia para ganhos de forca, potencia e massa muscular, sendo segura e eficaz.', 'beginner',
     '{nutricao_esportiva,suplementacao,creatina}', true),

    ('nutrition', 'Avaliacao Nutricional', 'Antropometria',
     'A circunferencia da cintura acima de qual valor indica risco cardiovascular aumentado em homens, segundo a OMS?',
     '[{"text": "80 cm"}, {"text": "88 cm"}, {"text": "94 cm"}, {"text": "102 cm"}]',
     2, 'A OMS indica risco cardiovascular aumentado quando a circunferencia da cintura e >= 94 cm em homens (risco elevado >= 102 cm) e >= 80 cm em mulheres.', 'beginner',
     '{avaliacao_nutricional,antropometria,risco_cardiovascular}', true),

    ('nutrition', 'Nutricao Clinica', 'Doenca Renal',
     'Na doenca renal cronica estagio 3-4 (sem dialise), qual a faixa recomendada de proteina por kg de peso?',
     '[{"text": "0,6 a 0,8 g/kg/dia"}, {"text": "1,0 a 1,2 g/kg/dia"}, {"text": "1,4 a 1,6 g/kg/dia"}, {"text": "2,0 g/kg/dia ou mais"}]',
     0, 'Em DRC pre-dialitica (estagios 3-4), recomenda-se restricao proteica de 0,6 a 0,8 g/kg/dia para retardar a progressao da doenca.', 'advanced',
     '{nutricao_clinica,doenca_renal,proteina}', true);
