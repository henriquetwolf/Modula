import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const MOCK_EVALUATION: Record<string, {
  patient: string
  type: string
  typeLabel: string
  diagnosis: string
  icdCode: string
  referringDoctor: string
  date: string
  chiefComplaint: string
  hma: string
  hmp: string
  medications: string
  lifestyle: string[]
  painScale: number
  goniometry: { joint: string; flexion: string; extension: string }[]
  muscleStrength: { group: string; value: number }[]
  specialTests: { name: string; result: 'positive' | 'negative' }[]
  posturalAssessment: string
  palpationFindings: string
  shortTermGoals: string
  longTermGoals: string
  treatmentFrequency: string
  estimatedSessions: number
}> = {
  '1': {
    patient: 'Maria Silva Santos',
    type: 'ortopedica',
    typeLabel: 'Ortopédica',
    diagnosis: 'Lombalgia',
    icdCode: 'M54.5',
    referringDoctor: 'Dr. Ricardo Mendes',
    date: '2025-03-15',
    chiefComplaint: 'Dor lombar há 3 meses, piora ao permanecer sentado.',
    hma: 'Início gradual da dor. Sem traumas. Dor irradia para glúteo direito ocasionalmente.',
    hmp: 'Hipertensão controlada. Sem cirurgias prévias.',
    medications: 'Losartana 50mg 1x/dia',
    lifestyle: ['sedentario'],
    painScale: 6,
    goniometry: [
      { joint: 'Quadril', flexion: '110°', extension: '10°' },
      { joint: 'Joelho', flexion: '130°', extension: '0°' },
    ],
    muscleStrength: [
      { group: 'MMSS direito', value: 5 },
      { group: 'MMSS esquerdo', value: 5 },
      { group: 'MMII direito', value: 4 },
      { group: 'MMII esquerdo', value: 5 },
      { group: 'Core', value: 4 },
    ],
    specialTests: [
      { name: 'Lasègue', result: 'positive' },
      { name: 'Patrick', result: 'negative' },
      { name: 'Schober', result: 'negative' },
    ],
    posturalAssessment: 'Hiperlordose lombar, ombros protrusos.',
    palpationFindings: 'Ponto gatilho em ECOM direito. Espasmo paravertebral L4-L5.',
    shortTermGoals: 'Reduzir dor para EVA ≤3 em 2 semanas.',
    longTermGoals: 'Retorno às atividades laborais em 6 semanas. Melhora da postura.',
    treatmentFrequency: '2x/semana',
    estimatedSessions: 12,
  },
  '2': {
    patient: 'João Pedro Oliveira',
    type: 'neurologica',
    typeLabel: 'Neurológica',
    diagnosis: 'Tremor essencial',
    icdCode: 'G25.0',
    referringDoctor: 'Dra. Carla Lima',
    date: '2025-03-14',
    chiefComplaint: 'Tremor nas mãos que piora com o estresse.',
    hma: 'Sintomas há 2 anos. Sem outros achados neurológicos.',
    hmp: 'HAS. Sem cirurgias.',
    medications: 'Propranolol 40mg',
    lifestyle: ['fumante'],
    painScale: 2,
    goniometry: [
      { joint: 'Punho', flexion: '70°', extension: '60°' },
    ],
    muscleStrength: [
      { group: 'MMSS direito', value: 4 },
      { group: 'MMSS esquerdo', value: 4 },
      { group: 'MMII direito', value: 5 },
      { group: 'MMII esquerdo', value: 5 },
      { group: 'Core', value: 5 },
    ],
    specialTests: [
      { name: 'Finger-to-nose', result: 'negative' },
    ],
    posturalAssessment: 'Sem alterações posturais significativas.',
    palpationFindings: 'Tônus normal.',
    shortTermGoals: 'Reduzir tremor para atividades diárias em 4 semanas.',
    longTermGoals: 'Manutenção da funcionalidade e independência.',
    treatmentFrequency: '2x/semana',
    estimatedSessions: 10,
  },
  '3': {
    patient: 'Ana Carolina Lima',
    type: 'respiratoria',
    typeLabel: 'Respiratória',
    diagnosis: 'DPOC',
    icdCode: 'J44.0',
    referringDoctor: 'Dr. Paulo Ferreira',
    date: '2025-03-13',
    chiefComplaint: 'Dispneia aos médios esforços.',
    hma: 'Diagnóstico de DPOC há 5 anos. Ex-fumante.',
    hmp: 'Tabagismo prévio 20 anos. Sem outras comorbidades.',
    medications: 'Tiotrópio, Budesonida/formoterol',
    lifestyle: [],
    painScale: 1,
    goniometry: [],
    muscleStrength: [
      { group: 'MMSS direito', value: 4 },
      { group: 'MMSS esquerdo', value: 4 },
      { group: 'MMII direito', value: 3 },
      { group: 'MMII esquerdo', value: 3 },
      { group: 'Core', value: 3 },
    ],
    specialTests: [],
    posturalAssessment: 'Tórax em tonel. Uso de musculatura acessória.',
    palpationFindings: 'Ritmo respiratório alterado. Hiperinsuflação.',
    shortTermGoals: 'Aumentar tolerância ao esforço e limpar vias aéreas.',
    longTermGoals: 'Melhora da qualidade de vida e capacidade funcional.',
    treatmentFrequency: '3x/semana',
    estimatedSessions: 20,
  },
  '4': {
    patient: 'Carlos Eduardo Souza',
    type: 'ortopedica',
    typeLabel: 'Ortopédica',
    diagnosis: 'Gonartrose',
    icdCode: 'M17.9',
    referringDoctor: 'Dra. Renata Oliveira',
    date: '2025-03-12',
    chiefComplaint: 'Dor no joelho direito ao subir escadas e ao levantar.',
    hma: 'Dor há 6 meses. Piora com carga.',
    hmp: 'Obesidade. Sem cirurgias.',
    medications: 'Paracetamol 500mg sob demanda',
    lifestyle: ['sedentario'],
    painScale: 7,
    goniometry: [
      { joint: 'Joelho', flexion: '120°', extension: '0°' },
    ],
    muscleStrength: [
      { group: 'MMSS direito', value: 5 },
      { group: 'MMSS esquerdo', value: 5 },
      { group: 'MMII direito', value: 3 },
      { group: 'MMII esquerdo', value: 5 },
      { group: 'Core', value: 4 },
    ],
    specialTests: [
      { name: 'Lachman', result: 'negative' },
      { name: 'McMurray', result: 'positive' },
    ],
    posturalAssessment: 'Geno valgo discreto. Desvio de carga para membro contralateral.',
    palpationFindings: 'Crepitação patelofemoral. Edema periarticular.',
    shortTermGoals: 'Reduzir dor e edema. Ganho de ADM.',
    longTermGoals: 'Retorno à marcha sem dor. Fortalecimento de quadríceps.',
    treatmentFrequency: '2x/semana',
    estimatedSessions: 15,
  },
  '5': {
    patient: 'Fernanda Costa Ribeiro',
    type: 'pelvica',
    typeLabel: 'Pélvica',
    diagnosis: 'Cistocele',
    icdCode: 'N81.1',
    referringDoctor: 'Dra. Juliana Martins',
    date: '2025-03-11',
    chiefComplaint: 'Sensação de peso vaginal e incontinência aos esforços.',
    hma: 'Sintomas pós-parto há 1 ano. Dois partos vaginais.',
    hmp: 'Gestante. Sem cirurgias.',
    medications: 'Nenhum',
    lifestyle: ['ativo'],
    painScale: 0,
    goniometry: [],
    muscleStrength: [
      { group: 'MMSS direito', value: 5 },
      { group: 'MMSS esquerdo', value: 5 },
      { group: 'MMII direito', value: 5 },
      { group: 'MMII esquerdo', value: 5 },
      { group: 'Core', value: 3 },
    ],
    specialTests: [],
    posturalAssessment: 'Bombação abdominal ao esforço.',
    palpationFindings: 'Períneo hipotônico. Descenso de assoalho pélvico.',
    shortTermGoals: 'Ganho de força do assoalho pélvico em 4 semanas.',
    longTermGoals: 'Controle da incontinência e melhora da qualidade de vida.',
    treatmentFrequency: '2x/semana',
    estimatedSessions: 12,
  },
  '6': {
    patient: 'Roberto Almeida',
    type: 'ortopedica',
    typeLabel: 'Ortopédica',
    diagnosis: 'Síndrome do manguito rotador',
    icdCode: 'M75.1',
    referringDoctor: 'Dr. Marcos Silva',
    date: '2025-03-10',
    chiefComplaint: 'Dor no ombro direito ao levantar o braço.',
    hma: 'Início insidioso há 3 meses. Dor noturna.',
    hmp: 'Trabalho repetitivo. Sem traumas.',
    medications: 'Ibuprofeno sob demanda',
    lifestyle: ['ativo'],
    painScale: 5,
    goniometry: [
      { joint: 'Ombro', flexion: '140°', extension: '40°' },
    ],
    muscleStrength: [
      { group: 'MMSS direito', value: 3 },
      { group: 'MMSS esquerdo', value: 5 },
      { group: 'MMII direito', value: 5 },
      { group: 'MMII esquerdo', value: 5 },
      { group: 'Core', value: 5 },
    ],
    specialTests: [
      { name: 'Neer', result: 'positive' },
      { name: 'Hawkins', result: 'positive' },
      { name: 'Empty can', result: 'positive' },
    ],
    posturalAssessment: 'Protusão escapular. Cifose dorsal aumentada.',
    palpationFindings: 'Pontos dolorosos em supraespinhal e infraespinhal.',
    shortTermGoals: 'Reduzir dor e ganhar ADM em 3 semanas.',
    longTermGoals: 'Retorno ao trabalho e atividades esportivas.',
    treatmentFrequency: '3x/semana',
    estimatedSessions: 18,
  },
}

const LIFESTYLE_LABELS: Record<string, string> = {
  sedentario: 'Sedentário',
  ativo: 'Ativo',
  fumante: 'Fumante',
  etilista: 'Etilista',
}

interface EvaluationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FisioEvaluationDetailPage({ params }: EvaluationDetailPageProps) {
  const { id } = await params
  const evalData = MOCK_EVALUATION[id] ?? MOCK_EVALUATION['1']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fisio/evaluation">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{evalData.patient}</h2>
          <p className="text-muted-foreground">
            {evalData.typeLabel} • {evalData.icdCode} - {evalData.diagnosis} • {formatDate(evalData.date)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
          <CardDescription>Informações iniciais da avaliação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Paciente:</span> {evalData.patient}</p>
          <p><span className="font-medium">Tipo:</span> {evalData.typeLabel}</p>
          <p><span className="font-medium">Diagnóstico:</span> {evalData.icdCode} - {evalData.diagnosis}</p>
          <p><span className="font-medium">Médico solicitante:</span> {evalData.referringDoctor}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
          <CardDescription>Queixa, antecedentes e medicamentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Queixa principal</p>
            <p>{evalData.chiefComplaint}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">HMA</p>
            <p>{evalData.hma}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">HMP</p>
            <p>{evalData.hmp}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Medicamentos</p>
            <p>{evalData.medications}</p>
          </div>
          {evalData.lifestyle.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Hábitos de vida</p>
              <div className="flex flex-wrap gap-1">
                {evalData.lifestyle.map((l) => (
                  <Badge key={l} variant="secondary">{LIFESTYLE_LABELS[l] ?? l}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exame Físico</CardTitle>
          <CardDescription>Avaliação da dor, goniometria e testes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-2">Dor (EVA 0-10)</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    evalData.painScale <= 3 && 'bg-green-500',
                    evalData.painScale > 3 && evalData.painScale <= 6 && 'bg-yellow-500',
                    evalData.painScale > 6 && 'bg-red-500'
                  )}
                  style={{ width: `${(evalData.painScale / 10) * 100}%` }}
                />
              </div>
              <span className="text-lg font-semibold w-8">{evalData.painScale}/10</span>
            </div>
          </div>

          {evalData.goniometry.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Goniometria</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articulação</TableHead>
                    <TableHead>Flexão</TableHead>
                    <TableHead>Extensão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evalData.goniometry.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>{g.joint}</TableCell>
                      <TableCell>{g.flexion}</TableCell>
                      <TableCell>{g.extension}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {evalData.specialTests.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-2">Testes especiais</p>
              <div className="flex flex-wrap gap-2">
                {evalData.specialTests.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span>{st.name}</span>
                    <Badge variant={st.result === 'positive' ? 'destructive' : 'secondary'}>
                      {st.result === 'positive' ? 'Positivo' : 'Negativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Força muscular (MRC)</p>
            <div className="flex flex-wrap gap-2">
              {evalData.muscleStrength.map((ms) => (
                <Badge key={ms.group} variant="outline">
                  {ms.group}: {ms.value}/5
                </Badge>
              ))}
            </div>
          </div>

          {evalData.posturalAssessment && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Avaliação postural</p>
              <p>{evalData.posturalAssessment}</p>
            </div>
          )}

          {evalData.palpationFindings && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Achados à palpação</p>
              <p>{evalData.palpationFindings}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos e Plano</CardTitle>
          <CardDescription>Metas e frequência de tratamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Objetivos de curto prazo</p>
            <p>{evalData.shortTermGoals}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Objetivos de longo prazo</p>
            <p>{evalData.longTermGoals}</p>
          </div>
          <Separator />
          <p><span className="font-medium">Frequência:</span> {evalData.treatmentFrequency}</p>
          <p><span className="font-medium">Sessões estimadas:</span> {evalData.estimatedSessions}</p>
        </CardContent>
      </Card>
    </div>
  )
}
