'use client'

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
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const MOCK_EVALUATION: Record<string, {
  patient: string
  type: string
  typeLabel: string
  date: string
  classification: string
  imc: number
  weight: number
  height: number
  waist: number
  hip: number
  waistHipRatio: number
  bodyFatSum: number
  glucose: number
  hba1c: number
  cholesterol: number
  hdl: number
  ldl: number
  triglycerides: number
  tsh: number
  objectives: string
  dietHistory: string
  mealsPerDay: number
  waterIntake: number
  supplements: string
  restrictions: string[]
  allergies: string[]
  intolerances: string[]
  observations: string
}> = {
  '1': {
    patient: 'Maria Silva Santos',
    type: 'inicial',
    typeLabel: 'Inicial',
    date: '2025-03-15',
    classification: 'Sobrepeso',
    imc: 26.8,
    weight: 78,
    height: 170,
    waist: 88,
    hip: 102,
    waistHipRatio: 0.86,
    bodyFatSum: 85,
    glucose: 95,
    hba1c: 5.6,
    cholesterol: 198,
    hdl: 52,
    ldl: 120,
    triglycerides: 130,
    tsh: 2.1,
    objectives: 'Perda de peso saudável. Reduzir circunferência abdominal.',
    dietHistory: 'Alimentação irregular. Consumo excessivo de carboidratos refinados.',
    mealsPerDay: 3,
    waterIntake: 1500,
    supplements: 'Vitamina D 1000 UI',
    restrictions: [],
    allergies: ['Amendoim'],
    intolerances: ['Lactose'],
    observations: 'Paciente motivada. Encaminhar para plano alimentar.',
  },
  '2': {
    patient: 'João Pedro Oliveira',
    type: 'retorno',
    typeLabel: 'Retorno',
    date: '2025-03-14',
    classification: 'Eutrófico',
    imc: 23.5,
    weight: 72,
    height: 175,
    waist: 82,
    hip: 98,
    waistHipRatio: 0.84,
    bodyFatSum: 62,
    glucose: 88,
    hba1c: 5.2,
    cholesterol: 175,
    hdl: 58,
    ldl: 95,
    triglycerides: 100,
    tsh: 2.3,
    objectives: 'Manutenção do peso. Melhorar composição corporal.',
    dietHistory: 'Dieta equilibrada. Boa adesão ao plano anterior.',
    mealsPerDay: 5,
    waterIntake: 2500,
    supplements: 'Nenhum',
    restrictions: [],
    allergies: [],
    intolerances: [],
    observations: 'Evolução positiva. Continuar acompanhamento.',
  },
  '3': {
    patient: 'Ana Carolina Lima',
    type: 'reavaliacao',
    typeLabel: 'Reavaliação',
    date: '2025-03-13',
    classification: 'Obesidade I',
    imc: 31.2,
    weight: 92,
    height: 172,
    waist: 98,
    hip: 108,
    waistHipRatio: 0.91,
    bodyFatSum: 112,
    glucose: 110,
    hba1c: 6.2,
    cholesterol: 220,
    hdl: 45,
    ldl: 145,
    triglycerides: 165,
    tsh: 1.8,
    objectives: 'Redução de 10% do peso. Controle glicêmico.',
    dietHistory: 'Compulsão alimentar à noite. Baixa ingestão de verduras.',
    mealsPerDay: 2,
    waterIntake: 1000,
    supplements: 'Ômega 3',
    restrictions: ['sem_lactose'],
    allergies: [],
    intolerances: ['Lactose', 'Glúten'],
    observations: 'Encaminhar para acompanhamento multidisciplinar.',
  },
}

const BIO_REF = {
  glucose: { ref: '70-99', unit: 'mg/dL' },
  hba1c: { ref: '< 5.7', unit: '%' },
  cholesterol: { ref: '< 200', unit: 'mg/dL' },
  hdl: { ref: '> 40 (H) / > 50 (M)', unit: 'mg/dL' },
  ldl: { ref: '< 100', unit: 'mg/dL' },
  triglycerides: { ref: '< 150', unit: 'mg/dL' },
  tsh: { ref: '0.4 - 4.0', unit: 'mUI/L' },
} as const

function getBioStatus(
  key: keyof typeof BIO_REF,
  value: number
): 'normal' | 'alto' | 'baixo' {
  switch (key) {
    case 'glucose':
      if (value < 70) return 'baixo'
      if (value > 99) return 'alto'
      return 'normal'
    case 'hba1c':
      return value >= 5.7 ? 'alto' : 'normal'
    case 'cholesterol':
      return value >= 200 ? 'alto' : 'normal'
    case 'hdl':
      return value < 40 ? 'baixo' : 'normal'
    case 'ldl':
      return value >= 100 ? 'alto' : 'normal'
    case 'triglycerides':
      return value >= 150 ? 'alto' : 'normal'
    case 'tsh':
      if (value < 0.4) return 'baixo'
      if (value > 4.0) return 'alto'
      return 'normal'
    default:
      return 'normal'
  }
}

const RESTRICTION_LABELS: Record<string, string> = {
  vegetariano: 'Vegetariano',
  vegano: 'Vegano',
  sem_gluten: 'Sem glúten',
  sem_lactose: 'Sem lactose',
}

interface EvaluationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NutriEvaluationDetailPage({ params }: EvaluationDetailPageProps) {
  const { id } = await params
  const data = MOCK_EVALUATION[id] ?? MOCK_EVALUATION['1']

  const imcPercent = Math.min(100, Math.max(0, ((data.imc - 15) / 30) * 100))
  const imcColor =
    data.imc < 18.5
      ? 'bg-blue-500'
      : data.imc < 25
        ? 'bg-green-500'
        : data.imc < 30
          ? 'bg-yellow-500'
          : data.imc < 35
            ? 'bg-orange-500'
            : 'bg-red-500'

  const bioRows = [
    { key: 'glucose' as const, label: 'Glicemia jejum', value: data.glucose },
    { key: 'hba1c' as const, label: 'HbA1c', value: data.hba1c },
    { key: 'cholesterol' as const, label: 'Colesterol total', value: data.cholesterol },
    { key: 'hdl' as const, label: 'HDL', value: data.hdl },
    { key: 'ldl' as const, label: 'LDL', value: data.ldl },
    { key: 'triglycerides' as const, label: 'Triglicerídeos', value: data.triglycerides },
    { key: 'tsh' as const, label: 'TSH', value: data.tsh },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/nutri/evaluation">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{data.patient}</h2>
          <p className="text-muted-foreground">
            {data.typeLabel} • {data.classification} • {formatDate(data.date)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Antropometria</CardTitle>
          <CardDescription>Peso, altura e medidas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <p><span className="font-medium">Peso:</span> {data.weight} kg</p>
            <p><span className="font-medium">Altura:</span> {data.height} cm</p>
            <p><span className="font-medium">Cintura:</span> {data.waist} cm</p>
            <p><span className="font-medium">Quadril:</span> {data.hip} cm</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-2">IMC: {data.imc} kg/m²</p>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                className={cn('h-full rounded-l-full transition-all', imcColor)}
                style={{ width: `${imcPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>&lt;18.5</span>
              <span>18.5-25</span>
              <span>25-30</span>
              <span>30-35</span>
              <span>&gt;35</span>
            </div>
          </div>
          <p><span className="font-medium">Relação cintura/quadril:</span> {data.waistHipRatio}</p>
          <p><span className="font-medium">Soma dobras (mm):</span> {data.bodyFatSum}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bioquímica</CardTitle>
          <CardDescription>Exames com intervalos de referência</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exame</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bioRows.map((r) => {
                const status = getBioStatus(r.key, r.value)
                const statusLabel =
                  status === 'normal'
                    ? 'Normal'
                    : status === 'alto'
                      ? 'Alto'
                      : 'Baixo'
                const statusClass =
                  status === 'normal'
                    ? 'bg-green-500/10 text-green-700 border-green-200'
                    : status === 'alto'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-200'
                      : 'bg-blue-500/10 text-blue-700 border-blue-200'
                return (
                  <TableRow key={r.key}>
                    <TableCell>{r.label}</TableCell>
                    <TableCell>
                      {r.value} {BIO_REF[r.key].unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{BIO_REF[r.key].ref}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusClass)}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
          <CardDescription>Histórico alimentar e restrições</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Objetivos</p>
            <p>{data.objectives}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Histórico alimentar</p>
            <p>{data.dietHistory}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <p><span className="font-medium">Refeições/dia:</span> {data.mealsPerDay}</p>
            <p><span className="font-medium">Ingestão hídrica:</span> {data.waterIntake} ml</p>
          </div>
          <div>
            <p className="font-medium text-sm text-muted-foreground mb-1">Suplementos</p>
            <p>{data.supplements}</p>
          </div>
          {data.restrictions.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Restrições</p>
              <div className="flex flex-wrap gap-1">
                {data.restrictions.map((r) => (
                  <Badge key={r} variant="secondary">
                    {RESTRICTION_LABELS[r] ?? r}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.allergies.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Alergias</p>
              <div className="flex flex-wrap gap-1">
                {data.allergies.map((a) => (
                  <Badge key={a} variant="destructive">{a}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.intolerances.length > 0 && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Intolerâncias</p>
              <div className="flex flex-wrap gap-1">
                {data.intolerances.map((i) => (
                  <Badge key={i} variant="outline">{i}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.observations && (
            <div>
              <p className="font-medium text-sm text-muted-foreground mb-1">Observações</p>
              <p>{data.observations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
