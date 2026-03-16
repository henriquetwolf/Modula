'use client'

import { useState } from 'react'
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  Calendar,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MOCK_CARE_PLANS = [
  {
    id: '1',
    patient: 'Maria Santos',
    professionals: ['EF', 'Fisio', 'Nutri'] as const,
    goal: 'Redução de peso e melhora da dor lombar com abordagem integrada',
    progress: 65,
    nextMilestones: [
      'Avaliação de composição corporal (semana 8)',
      'Revisão do plano alimentar',
      'Teste de força 1RM',
    ],
    status: 'ativo' as const,
  },
  {
    id: '2',
    patient: 'João Oliveira',
    professionals: ['EF', 'Nutri'] as const,
    goal: 'Hipertrofia e ganho de massa magra',
    progress: 30,
    nextMilestones: [
      'Primeira avaliação intermediária',
      'Ajuste de periodização',
    ],
    status: 'ativo' as const,
  },
  {
    id: '3',
    patient: 'Ana Costa',
    professionals: ['Fisio', 'EF'] as const,
    goal: 'Reabilitação pós-lesão e retorno ao esporte',
    progress: 85,
    nextMilestones: ['Alta médica prevista'],
    status: 'revisão' as const,
  },
  {
    id: '4',
    patient: 'Carlos Mendes',
    professionals: ['EF', 'Fisio', 'Nutri'] as const,
    goal: 'Controle de diabetes e condicionamento físico',
    progress: 100,
    nextMilestones: [],
    status: 'concluído' as const,
  },
]

const PATIENT_OPTIONS = [
  'Maria Santos',
  'João Oliveira',
  'Ana Costa',
  'Carlos Mendes',
  'Paula Ferreira',
]

const PROFESSIONAL_OPTIONS = [
  { name: 'Prof. Lima', prof: 'EF' as const },
  { name: 'Dr. Silva', prof: 'Fisio' as const },
  { name: 'Dra. Costa', prof: 'Nutri' as const },
]

export default function MultiCarePlanPage() {
  const [step, setStep] = useState(1)
  const [patient, setPatient] = useState('')
  const [professionals, setProfessionals] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState('12')

  const [efMetaFuncional, setEfMetaFuncional] = useState('')
  const [efMetaComposicao, setEfMetaComposicao] = useState('')
  const [efFrequencia, setEfFrequencia] = useState('')
  const [fisioMetaDor, setFisioMetaDor] = useState('')
  const [fisioMetaFuncional, setFisioMetaFuncional] = useState('')
  const [fisioSessoes, setFisioSessoes] = useState('')
  const [nutriMetaPeso, setNutriMetaPeso] = useState('')
  const [nutriMetaComposicao, setNutriMetaComposicao] = useState('')
  const [nutriMetaBioquimica, setNutriMetaBioquimica] = useState('')

  const [cronograma, setCronograma] = useState('')

  function toggleProfessional(name: string) {
    setProfessionals((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plano de Cuidados Integrado</h1>
        <p className="text-muted-foreground">
          Planos ativos e criação de novos planos multidisciplinares.
        </p>
      </div>

      <Tabs defaultValue="ativos" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ativos">Planos Ativos</TabsTrigger>
          <TabsTrigger value="novo">Novo Plano</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_CARE_PLANS.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.patient}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.professionals.map((p) => (
                          <Badge
                            key={p}
                            variant={p === 'EF' ? 'default' : p === 'Fisio' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      plan.status === 'ativo' && 'border-green-500 text-green-700 bg-green-500/10',
                      plan.status === 'revisão' && 'border-amber-500 text-amber-700 bg-amber-500/10',
                      plan.status === 'concluído' && 'border-muted text-muted-foreground'
                    )}
                  >
                    {plan.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Objetivo geral
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.goal}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                  {plan.nextMilestones.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Próximos marcos
                      </div>
                      <ul className="space-y-1">
                        {plan.nextMilestones.map((m) => (
                          <li key={m} className="text-sm text-muted-foreground flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="novo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Novo Plano Integrado — Etapa {step} de 3
                </CardTitle>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        'h-2 w-8 rounded-full',
                        s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Paciente</Label>
                    <Select value={patient} onValueChange={setPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {PATIENT_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Profissionais responsáveis</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PROFESSIONAL_OPTIONS.map(({ name, prof }) => (
                        <label
                          key={name}
                          className={cn(
                            'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50',
                            professionals.includes(name) && 'border-primary bg-primary/5'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={professionals.includes(name)}
                            onChange={() => toggleProfessional(name)}
                          />
                          <span className="text-sm">{name}</span>
                          <Badge variant="outline" className="text-xs">
                            {prof}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Objetivo geral</Label>
                    <Textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Descreva o objetivo principal do plano integrado..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Duração (semanas)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Educação Física
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div>
                        <Label>Meta funcional</Label>
                        <Textarea
                          value={efMetaFuncional}
                          onChange={(e) => setEfMetaFuncional(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Meta composição corporal</Label>
                        <Textarea
                          value={efMetaComposicao}
                          onChange={(e) => setEfMetaComposicao(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Frequência de treino (vezes/semana)</Label>
                        <Input
                          value={efFrequencia}
                          onChange={(e) => setEfFrequencia(e.target.value)}
                          placeholder="Ex: 4"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Fisioterapia
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div>
                        <Label>Meta de dor (EVA ou descritivo)</Label>
                        <Textarea
                          value={fisioMetaDor}
                          onChange={(e) => setFisioMetaDor(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Meta funcional</Label>
                        <Textarea
                          value={fisioMetaFuncional}
                          onChange={(e) => setFisioMetaFuncional(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Sessões por semana</Label>
                        <Input
                          value={fisioSessoes}
                          onChange={(e) => setFisioSessoes(e.target.value)}
                          placeholder="Ex: 2"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Nutrição
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div>
                        <Label>Meta de peso</Label>
                        <Input
                          value={nutriMetaPeso}
                          onChange={(e) => setNutriMetaPeso(e.target.value)}
                          placeholder="Ex: 70 kg"
                        />
                      </div>
                      <div>
                        <Label>Meta de composição corporal</Label>
                        <Textarea
                          value={nutriMetaComposicao}
                          onChange={(e) => setNutriMetaComposicao(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Meta bioquímica</Label>
                        <Textarea
                          value={nutriMetaBioquimica}
                          onChange={(e) => setNutriMetaBioquimica(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <Label>Cronograma — marcos semanais, datas de revisão e resultados esperados</Label>
                  <Textarea
                    value={cronograma}
                    onChange={(e) => setCronograma(e.target.value)}
                    placeholder="Ex: Semana 1-4: Adaptação. Revisão em 15/04. Semana 5-8: Progressão de cargas..."
                    rows={8}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                {step < 3 ? (
                  <Button onClick={() => setStep((s) => s + 1)}>
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button>Salvar plano</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
