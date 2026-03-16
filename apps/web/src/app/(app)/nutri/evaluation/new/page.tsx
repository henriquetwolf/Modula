'use client'

import { useState, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, X } from 'lucide-react'

const EVALUATION_TYPES = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'reavaliacao', label: 'Reavaliação' },
] as const

const MOCK_CLIENTS = [
  { id: '1', full_name: 'Maria Silva Santos' },
  { id: '2', full_name: 'João Pedro Oliveira' },
  { id: '3', full_name: 'Ana Carolina Lima' },
  { id: '4', full_name: 'Carlos Eduardo Souza' },
  { id: '5', full_name: 'Fernanda Costa Ribeiro' },
]

const RESTRICTION_OPTIONS = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sem_gluten', label: 'Sem glúten' },
  { id: 'sem_lactose', label: 'Sem lactose' },
] as const

function calcIMC(weight: number, height: number): number | null {
  if (!weight || !height) return null
  const h = height / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

function calcWaistHipRatio(waist: number, hip: number): number | null {
  if (!waist || !hip) return null
  return Math.round((waist / hip) * 100) / 100
}

function calcBodyFatPercent(
  triceps: number,
  biceps: number,
  subscapular: number,
  suprailiac: number
): number | null {
  const sum = triceps + biceps + subscapular + suprailiac
  if (sum <= 0) return null
  return Math.round(sum * 10) / 10
}

function getIMCClassification(imc: number): string {
  if (imc < 18.5) return 'Desnutrição'
  if (imc < 25) return 'Eutrófico'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidade I'
  if (imc < 40) return 'Obesidade II'
  return 'Obesidade III'
}

export default function NewNutriEvaluationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [clientId, setClientId] = useState('')
  const [evalType, setEvalType] = useState('')
  const [objectives, setObjectives] = useState('')

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [triceps, setTriceps] = useState('')
  const [biceps, setBiceps] = useState('')
  const [subscapular, setSubscapular] = useState('')
  const [suprailiac, setSuprailiac] = useState('')

  const [glucose, setGlucose] = useState('')
  const [hba1c, setHba1c] = useState('')
  const [cholesterol, setCholesterol] = useState('')
  const [hdl, setHdl] = useState('')
  const [ldl, setLdl] = useState('')
  const [triglycerides, setTriglycerides] = useState('')
  const [tsh, setTsh] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')
  const [intolerances, setIntolerances] = useState<string[]>([])
  const [intoleranceInput, setIntoleranceInput] = useState('')
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [dietHistory, setDietHistory] = useState('')
  const [mealsPerDay, setMealsPerDay] = useState('')
  const [waterIntake, setWaterIntake] = useState('')
  const [supplements, setSupplements] = useState('')

  const [observations, setObservations] = useState('')

  const imc = useMemo(() => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    return calcIMC(w, h)
  }, [weight, height])

  const waistHipRatio = useMemo(() => {
    const w = parseFloat(waist)
    const h = parseFloat(hip)
    return calcWaistHipRatio(w, h)
  }, [waist, hip])

  const bodyFatPercent = useMemo(() => {
    const t = parseFloat(triceps)
    const b = parseFloat(biceps)
    const s = parseFloat(subscapular)
    const sp = parseFloat(suprailiac)
    return calcBodyFatPercent(t, b, s, sp)
  }, [triceps, biceps, subscapular, suprailiac])

  const classification = imc !== null ? getIMCClassification(imc) : ''

  const selectedClientName = MOCK_CLIENTS.find((c) => c.id === clientId)?.full_name ?? ''

  function addTag(
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    e: React.KeyboardEvent
  ) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!list.includes(input.trim())) setList((p) => [...p, input.trim()])
      setInput('')
    }
  }

  function removeTag(
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) {
    setList((p) => p.filter((x) => x !== item))
  }

  function toggleRestriction(id: string) {
    setRestrictions((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    )
  }

  function handleSave() {
    router.push('/nutri/evaluation')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/nutri/evaluation">
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
            <CardTitle>Dados</CardTitle>
            <CardDescription>Paciente, tipo e objetivos</CardDescription>
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
                    {MOCK_CLIENTS.map((c) => (
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
            <div className="space-y-2">
              <Label>Objetivos</Label>
              <Textarea
                placeholder="Objetivos da avaliação..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Antropometria</CardTitle>
            <CardDescription>Peso, altura, circunferências e dobras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 72.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>
            {imc !== null && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <span className="font-medium">IMC: </span>
                <span className="text-lg font-semibold">{imc} kg/m²</span>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Circunferência cintura (cm)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 88"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Circunferência quadril (cm)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 102"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
              </div>
            </div>
            {waistHipRatio !== null && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <span className="font-medium">Relação cintura/quadril: </span>
                <span className="text-lg font-semibold">{waistHipRatio}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Dobras cutâneas (mm)</Label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tríceps</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={triceps}
                    onChange={(e) => setTriceps(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bíceps</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={biceps}
                    onChange={(e) => setBiceps(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subescapular</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={subscapular}
                    onChange={(e) => setSubscapular(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Suprailíaca</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={suprailiac}
                    onChange={(e) => setSuprailiac(e.target.value)}
                  />
                </div>
              </div>
              {bodyFatPercent !== null && (
                <div className="rounded-lg border p-3 bg-muted/30 mt-2">
                  <span className="font-medium">Soma das 4 dobras: </span>
                  <span className="text-lg font-semibold">{bodyFatPercent} mm</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Bioquímica e Anamnese</CardTitle>
            <CardDescription>Exames e histórico alimentar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Exames bioquímicos</Label>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Glicemia jejum (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 95"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">HbA1c (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.6"
                    value={hba1c}
                    onChange={(e) => setHba1c(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Colesterol total (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 185"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">HDL (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 55"
                    value={hdl}
                    onChange={(e) => setHdl(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">LDL (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 110"
                    value={ldl}
                    onChange={(e) => setLdl(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Triglicerídeos (mg/dL)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 120"
                    value={triglycerides}
                    onChange={(e) => setTriglycerides(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">TSH (mUI/L)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.5"
                    value={tsh}
                    onChange={(e) => setTsh(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alergias alimentares</Label>
              <div className="flex flex-wrap gap-2">
                {allergies.map((a) => (
                  <Badge
                    key={a}
                    variant="secondary"
                    className="gap-1"
                  >
                    {a}
                    <button type="button" onClick={() => removeTag(allergies, setAllergies, a)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Digite e pressione Enter"
                  className="w-48"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => addTag(allergies, setAllergies, allergyInput, setAllergyInput, e)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intolerâncias</Label>
              <div className="flex flex-wrap gap-2">
                {intolerances.map((i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1"
                  >
                    {i}
                    <button type="button" onClick={() => removeTag(intolerances, setIntolerances, i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Digite e pressione Enter"
                  className="w-48"
                  value={intoleranceInput}
                  onChange={(e) => setIntoleranceInput(e.target.value)}
                  onKeyDown={(e) => addTag(intolerances, setIntolerances, intoleranceInput, setIntoleranceInput, e)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Restrições</Label>
              <div className="flex flex-wrap gap-2">
                {RESTRICTION_OPTIONS.map((r) => (
                  <Button
                    key={r.id}
                    type="button"
                    variant={restrictions.includes(r.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleRestriction(r.id)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Histórico alimentar</Label>
              <Textarea
                placeholder="Descreva o padrão alimentar habitual..."
                value={dietHistory}
                onChange={(e) => setDietHistory(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nº refeições/dia</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="Ex: 5"
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ingestão hídrica (ml)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 2000"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Suplementos atuais</Label>
              <Textarea
                placeholder="Liste os suplementos em uso..."
                value={supplements}
                onChange={(e) => setSupplements(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Revise os dados e finalize</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><span className="font-medium">Paciente:</span> {selectedClientName || '—'}</p>
              <p><span className="font-medium">Tipo:</span> {EVALUATION_TYPES.find((t) => t.value === evalType)?.label ?? '—'}</p>
              <p><span className="font-medium">Objetivos:</span> {objectives || '—'}</p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p><span className="font-medium">Peso:</span> {weight || '—'} kg</p>
              <p><span className="font-medium">Altura:</span> {height || '—'} cm</p>
              {imc !== null && (
                <p><span className="font-medium">IMC:</span> {imc} kg/m²</p>
              )}
              <p><span className="font-medium">Cintura:</span> {waist || '—'} cm</p>
              <p><span className="font-medium">Quadril:</span> {hip || '—'} cm</p>
              {waistHipRatio !== null && (
                <p><span className="font-medium">Relação cintura/quadril:</span> {waistHipRatio}</p>
              )}
              {bodyFatPercent !== null && (
                <p><span className="font-medium">Soma dobras:</span> {bodyFatPercent} mm</p>
              )}
            </div>
            {classification && (
              <div>
                <Label>Classificação IMC</Label>
                <Badge className="mt-1 text-sm" variant="secondary">
                  {classification}
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
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
