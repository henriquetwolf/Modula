'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Save, Plus, Trash2 } from 'lucide-react'

const EVALUATION_TYPES = [
  { value: 'ortopedica', label: 'Ortopédica' },
  { value: 'neurologica', label: 'Neurológica' },
  { value: 'respiratoria', label: 'Respiratória' },
  { value: 'pelvica', label: 'Pélvica' },
  { value: 'esportiva', label: 'Esportiva' },
] as const

const JOINT_OPTIONS = [
  'Ombro', 'Cotovelo', 'Punho', 'Quadril', 'Joelho', 'Tornozelo', 'Coluna cervical', 'Coluna lombar',
] as const

const MRC_SCALE = [0, 1, 2, 3, 4, 5] as const

const FREQUENCY_OPTIONS = [
  { value: '1x', label: '1x/semana' },
  { value: '2x', label: '2x/semana' },
  { value: '3x', label: '3x/semana' },
] as const

const LIFESTYLE_OPTIONS = [
  { id: 'sedentario', label: 'Sedentário' },
  { id: 'ativo', label: 'Ativo' },
  { id: 'fumante', label: 'Fumante' },
  { id: 'etilista', label: 'Etilista' },
] as const

const MOCK_CLIENTS = [
  { id: '1', full_name: 'Maria Silva Santos' },
  { id: '2', full_name: 'João Pedro Oliveira' },
  { id: '3', full_name: 'Ana Carolina Lima' },
  { id: '4', full_name: 'Carlos Eduardo Souza' },
  { id: '5', full_name: 'Fernanda Costa Ribeiro' },
]

interface GoniometryItem {
  id: string
  joint: string
  flexion: string
  extension: string
}

interface SpecialTestItem {
  id: string
  name: string
  result: 'positive' | 'negative'
}

interface MuscleStrengthItem {
  group: string
  value: number
}

export default function NewFisioEvaluationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [clientId, setClientId] = useState('')
  const [evalType, setEvalType] = useState('')
  const [icdCode, setIcdCode] = useState('')
  const [diagnosisDesc, setDiagnosisDesc] = useState('')
  const [referringDoctor, setReferringDoctor] = useState('')

  const [chiefComplaint, setChiefComplaint] = useState('')
  const [hma, setHma] = useState('')
  const [hmp, setHmp] = useState('')
  const [medications, setMedications] = useState('')
  const [lifestyle, setLifestyle] = useState<string[]>([])

  const [painScale, setPainScale] = useState(0)
  const [goniometry, setGoniometry] = useState<GoniometryItem[]>([])
  const [muscleStrength, setMuscleStrength] = useState<MuscleStrengthItem[]>([
    { group: 'MMSS direito', value: 0 },
    { group: 'MMSS esquerdo', value: 0 },
    { group: 'MMII direito', value: 0 },
    { group: 'MMII esquerdo', value: 0 },
    { group: 'Core', value: 0 },
  ])
  const [specialTests, setSpecialTests] = useState<SpecialTestItem[]>([])
  const [posturalAssessment, setPosturalAssessment] = useState('')
  const [palpationFindings, setPalpationFindings] = useState('')

  const [shortTermGoals, setShortTermGoals] = useState('')
  const [longTermGoals, setLongTermGoals] = useState('')
  const [treatmentFrequency, setTreatmentFrequency] = useState('')
  const [estimatedSessions, setEstimatedSessions] = useState('')

  const clientSearch = ''
  const filteredClients = MOCK_CLIENTS
  const selectedClientName = MOCK_CLIENTS.find((c) => c.id === clientId)?.full_name ?? ''

  function addGoniometry() {
    setGoniometry((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        joint: '',
        flexion: '',
        extension: '',
      },
    ])
  }

  function removeGoniometry(id: string) {
    setGoniometry((prev) => prev.filter((g) => g.id !== id))
  }

  function updateGoniometry(id: string, field: keyof GoniometryItem, value: string) {
    setGoniometry((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    )
  }

  function addSpecialTest() {
    setSpecialTests((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', result: 'negative' as const },
    ])
  }

  function removeSpecialTest(id: string) {
    setSpecialTests((prev) => prev.filter((s) => s.id !== id))
  }

  function updateSpecialTest(id: string, field: keyof SpecialTestItem, value: string | 'positive' | 'negative') {
    setSpecialTests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  function toggleLifestyle(id: string) {
    setLifestyle((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  function handleSave() {
    router.push('/fisio/evaluation')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fisio/evaluation">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para avaliações</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Etapa {step} de 4</span>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn('h-1 flex-1 rounded-full', s <= step ? 'bg-primary' : 'bg-muted')}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>Paciente, tipo e diagnóstico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <span className={cn(!clientId && 'text-muted-foreground')}>
                      {selectedClientName || 'Selecione o paciente...'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={cn(
                          'flex w-full px-4 py-2 text-left text-sm hover:bg-muted',
                          clientId === c.id && 'bg-muted'
                        )}
                        onClick={() => setClientId(c.id)}
                      >
                        {c.full_name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Tipo de avaliação *</Label>
              <Select value={evalType} onValueChange={setEvalType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EVALUATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Código CID-10</Label>
                <Input
                  placeholder="Ex: M54.5"
                  value={icdCode}
                  onChange={(e) => setIcdCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição do diagnóstico</Label>
                <Input
                  placeholder="Ex: Lombalgia"
                  value={diagnosisDesc}
                  onChange={(e) => setDiagnosisDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Médico solicitante</Label>
              <Input
                placeholder="Nome do médico"
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Anamnese</CardTitle>
            <CardDescription>Queixa, antecedentes e medicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Queixa principal</Label>
              <Textarea
                placeholder="Descreva a queixa principal..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>História da moléstia atual (HMA)</Label>
              <Textarea
                placeholder="Descreva a HMA..."
                value={hma}
                onChange={(e) => setHma(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>História médica pregressa (HMP)</Label>
              <Textarea
                placeholder="Descreva a HMP..."
                value={hmp}
                onChange={(e) => setHmp(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Medicamentos em uso</Label>
              <Textarea
                placeholder="Liste os medicamentos..."
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Hábitos de vida</Label>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={lifestyle.includes(opt.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLifestyle(opt.id)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Exame Físico</CardTitle>
            <CardDescription>Dor, goniometria, força e testes especiais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Avaliação da dor (EVA 0-10)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={painScale}
                  onChange={(e) => setPainScale(Number(e.target.value))}
                  className="h-2 w-48 flex-1 appearance-none rounded-full bg-muted accent-primary"
                />
                <span className="text-lg font-semibold w-8">{painScale}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Goniometria</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGoniometry}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              {goniometry.map((g) => (
                <div key={g.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                  <Select value={g.joint} onValueChange={(v) => updateGoniometry(g.id, 'joint', v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Articulação" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOINT_OPTIONS.map((j) => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Flexão °"
                    className="w-24"
                    value={g.flexion}
                    onChange={(e) => updateGoniometry(g.id, 'flexion', e.target.value)}
                  />
                  <Input
                    placeholder="Extensão °"
                    className="w-24"
                    value={g.extension}
                    onChange={(e) => updateGoniometry(g.id, 'extension', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGoniometry(g.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Label>Força muscular (escala MRC 0-5)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {muscleStrength.map((ms, i) => (
                  <div key={ms.group} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">{ms.group}</span>
                    <Select
                      value={String(ms.value)}
                      onValueChange={(v) => {
                        const next = [...muscleStrength]
                        next[i] = { ...next[i], value: Number(v) }
                        setMuscleStrength(next)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MRC_SCALE.map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Testes especiais</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpecialTest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              {specialTests.map((st) => (
                <div key={st.id} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                  <Input
                    placeholder="Nome do teste"
                    className="flex-1 min-w-[200px]"
                    value={st.name}
                    onChange={(e) => updateSpecialTest(st.id, 'name', e.target.value)}
                  />
                  <Select
                    value={st.result}
                    onValueChange={(v: 'positive' | 'negative') => updateSpecialTest(st.id, 'result', v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="negative">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecialTest(st.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Avaliação postural</Label>
              <Textarea
                placeholder="Descreva os achados posturais..."
                value={posturalAssessment}
                onChange={(e) => setPosturalAssessment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Achados à palpação</Label>
              <Textarea
                placeholder="Descreva os achados à palpação..."
                value={palpationFindings}
                onChange={(e) => setPalpationFindings(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Objetivos e Plano</CardTitle>
            <CardDescription>Metas e frequência de tratamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Objetivos de curto prazo</Label>
              <Textarea
                placeholder="Descreva os objetivos de curto prazo..."
                value={shortTermGoals}
                onChange={(e) => setShortTermGoals(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivos de longo prazo</Label>
              <Textarea
                placeholder="Descreva os objetivos de longo prazo..."
                value={longTermGoals}
                onChange={(e) => setLongTermGoals(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequência de tratamento</Label>
                <Select value={treatmentFrequency} onValueChange={setTreatmentFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sessões estimadas</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Ex: 12"
                  value={estimatedSessions}
                  onChange={(e) => setEstimatedSessions(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 text-sm">
              <p className="font-medium mb-2">Resumo da avaliação</p>
              <p className="text-muted-foreground">Paciente: {selectedClientName || '—'}</p>
              <p className="text-muted-foreground">Tipo: {EVALUATION_TYPES.find((t) => t.value === evalType)?.label ?? '—'}</p>
              <p className="text-muted-foreground">Diagnóstico: {icdCode ? `${icdCode} - ${diagnosisDesc}` : '—'}</p>
              <p className="text-muted-foreground">Dor EVA: {painScale}/10</p>
              <p className="text-muted-foreground">Frequência: {FREQUENCY_OPTIONS.find((f) => f.value === treatmentFrequency)?.label ?? '—'}</p>
              <p className="text-muted-foreground">Sessões: {estimatedSessions || '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(4, s + 1))}>
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        )}
      </div>
    </div>
  )
}
