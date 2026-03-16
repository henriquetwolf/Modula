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
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

const TECHNIQUE_PRESETS = [
  'Cinesioterapia',
  'Eletroterapia (TENS, FES, US)',
  'Terapia Manual',
  'Crioterapia',
  'Termoterapia',
  'Hidroterapia',
  'Exercícios Funcionais',
]

const FREQUENCY_OPTIONS = [
  { value: '1x', label: '1x/semana' },
  { value: '2x', label: '2x/semana' },
  { value: '3x', label: '3x/semana' },
] as const

const MOCK_CLIENTS = [
  { id: '1', full_name: 'Maria Silva Santos' },
  { id: '2', full_name: 'João Pedro Oliveira' },
  { id: '3', full_name: 'Ana Carolina Lima' },
  { id: '4', full_name: 'Carlos Eduardo Souza' },
  { id: '5', full_name: 'Fernanda Costa Ribeiro' },
]

const MOCK_EVALUATIONS = [
  { id: '1', patient: 'Maria Silva Santos', diagnosis: 'M54.5 - Lombalgia' },
  { id: '2', patient: 'João Pedro Oliveira', diagnosis: 'G25.0 - Tremor essencial' },
  { id: '3', patient: 'Ana Carolina Lima', diagnosis: 'J44.0 - DPOC' },
  { id: '4', patient: 'Carlos Eduardo Souza', diagnosis: 'M17.9 - Gonartrose' },
  { id: '5', patient: 'Fernanda Costa Ribeiro', diagnosis: 'N81.1 - Cistocele' },
]

interface ConductItem {
  id: string
  technique: string
  description: string
  duration: string
  equipment: string
}

export default function NewFisioTreatmentPage() {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [evaluationId, setEvaluationId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [objectives, setObjectives] = useState('')
  const [treatmentFrequency, setTreatmentFrequency] = useState('')
  const [estimatedSessions, setEstimatedSessions] = useState('')

  const [conducts, setConducts] = useState<ConductItem[]>([])

  const selectedClientName = MOCK_CLIENTS.find((c) => c.id === clientId)?.full_name ?? ''
  const selectedEvaluation = MOCK_EVALUATIONS.find((e) => e.id === evaluationId)

  function addConduct() {
    setConducts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        technique: '',
        description: '',
        duration: '',
        equipment: '',
      },
    ])
  }

  function removeConduct(id: string) {
    setConducts((prev) => prev.filter((c) => c.id !== id))
  }

  function updateConduct(id: string, field: keyof ConductItem, value: string) {
    setConducts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  function handleSave() {
    router.push('/fisio/treatment')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/fisio/treatment">
          <Button type="button" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">Voltar para planos</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Plano</CardTitle>
          <CardDescription>Paciente, avaliação vinculada e diagnóstico</CardDescription>
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
            <Label>Avaliação vinculada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className={cn(!evaluationId && 'text-muted-foreground')}>
                    {selectedEvaluation
                      ? `${selectedEvaluation.patient} - ${selectedEvaluation.diagnosis}`
                      : 'Selecione a avaliação...'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="max-h-[200px] overflow-y-auto">
                  {MOCK_EVALUATIONS.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className={cn(
                        'flex w-full px-4 py-2 text-left text-sm hover:bg-muted',
                        evaluationId === e.id && 'bg-muted'
                      )}
                      onClick={() => {
                        setEvaluationId(e.id)
                        if (!diagnosis) setDiagnosis(e.diagnosis)
                      }}
                    >
                      <span className="truncate">{e.patient} - {e.diagnosis}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Diagnóstico</Label>
            <Input
              placeholder="Ex: M54.5 - Lombalgia"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Objetivos</Label>
            <Textarea
              placeholder="Descreva os objetivos do tratamento..."
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              rows={4}
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
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Condutas</CardTitle>
              <CardDescription>Técnicas e procedimentos do plano</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addConduct}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar conduta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {conducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhuma conduta adicionada. Clique em &quot;Adicionar conduta&quot; para começar.
            </p>
          ) : (
            conducts.map((cond) => (
              <div
                key={cond.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-xs">Técnica</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {TECHNIQUE_PRESETS.map((t) => (
                          <Button
                            key={t}
                            type="button"
                            variant={cond.technique === t ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => updateConduct(cond.id, 'technique', t)}
                          >
                            {t}
                          </Button>
                        ))}
                        <Input
                          placeholder="Ou digite outra"
                          className="w-32 h-7 text-sm"
                          value={cond.technique && !TECHNIQUE_PRESETS.includes(cond.technique) ? cond.technique : ''}
                          onChange={(e) => updateConduct(cond.id, 'technique', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Descrição</Label>
                      <Textarea
                        placeholder="Descreva a técnica/procedimento..."
                        value={cond.description}
                        onChange={(e) => updateConduct(cond.id, 'description', e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Duração (min)</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ex: 20"
                          value={cond.duration}
                          onChange={(e) => updateConduct(cond.id, 'duration', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Equipamentos necessários</Label>
                        <Input
                          placeholder="Ex: Colchonete, bola"
                          value={cond.equipment}
                          onChange={(e) => updateConduct(cond.id, 'equipment', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeConduct(cond.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  )
}
