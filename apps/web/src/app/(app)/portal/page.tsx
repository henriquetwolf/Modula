'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PortalPreview } from '@/components/portal/portal-preview'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Palette,
  FileText,
  ChevronRight,
  Plus,
} from 'lucide-react'

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-4 w-4 rounded-full bg-background shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  )
}

const MOCK_EDUCATIONAL_MATERIALS = [
  { id: '1', name: 'Guia de alongamento pós-treino', type: 'PDF', dateAdded: '15/03/2025' },
  { id: '2', name: 'Receitas saudáveis - semana 1', type: 'PDF', dateAdded: '10/03/2025' },
  { id: '3', name: 'Exercícios de mobilidade', type: 'Vídeo', dateAdded: '05/03/2025' },
]

export default function PortalPage() {
  const { add: toast } = useToast()
  const [portalSettings, setPortalSettings] = useState({
    showAppointments: true,
    showTrainingPlan: true,
    showMeasurements: true,
    showDocuments: true,
    allowReschedule: true,
    allowAnamnesis: true,
    showChartEvolutions: false,
  })
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [welcomeMessage, setWelcomeMessage] = useState('Olá! Bem-vindo(a) ao seu portal de acompanhamento.')
  const [generalInstructions, setGeneralInstructions] = useState(
    'Aqui você encontra seus agendamentos, plano de treino, medições e documentos. Entre em contato com seu profissional em caso de dúvidas.'
  )

  function handleSaveContent() {
    toast({
      title: 'Conteúdo salvo',
      description: 'As alterações do portal foram salvas com sucesso.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Portal do Cliente</CardTitle>
          <CardDescription>
            Configure o que seus clientes, pacientes ou alunos veem ao acessar o portal.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="customize" className="gap-2">
            <Palette className="h-4 w-4" />
            Personalizar
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Prévia do que o cliente vê ao acessar o portal. Os dados abaixo são de demonstração.
            </p>
          </div>
          <PortalPreview />
        </TabsContent>

        <TabsContent value="customize">
          <Card>
            <CardHeader>
              <CardTitle>Visibilidade do portal</CardTitle>
              <CardDescription>
                Ative ou desative o que será exibido para seus clientes no portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <ToggleSwitch
                  checked={portalSettings.showAppointments}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, showAppointments: v }))
                  }
                  label="Exibir próximos agendamentos"
                />
                <ToggleSwitch
                  checked={portalSettings.showTrainingPlan}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, showTrainingPlan: v }))
                  }
                  label="Exibir plano de treino atual"
                />
                <ToggleSwitch
                  checked={portalSettings.showMeasurements}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, showMeasurements: v }))
                  }
                  label="Exibir medições recentes"
                />
                <ToggleSwitch
                  checked={portalSettings.showDocuments}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, showDocuments: v }))
                  }
                  label="Exibir documentos"
                />
                <ToggleSwitch
                  checked={portalSettings.allowReschedule}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, allowReschedule: v }))
                  }
                  label="Permitir remarcar consultas"
                />
                <ToggleSwitch
                  checked={portalSettings.allowAnamnesis}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, allowAnamnesis: v }))
                  }
                  label="Permitir preenchimento de anamnese"
                />
                <ToggleSwitch
                  checked={portalSettings.showChartEvolutions}
                  onChange={(v) =>
                    setPortalSettings((s) => ({ ...s, showChartEvolutions: v }))
                  }
                  label="Exibir evoluções do prontuário"
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-color">Cor da marca (hex)</Label>
                  <Input
                    id="brand-color"
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#6366f1"
                    className="max-w-[180px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex h-24 w-48 items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 text-sm text-muted-foreground">
                    Enviar logo (em breve)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do portal</CardTitle>
              <CardDescription>
                Personalize as mensagens e materiais que serão exibidos aos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Mensagem de boas-vindas</Label>
                <Textarea
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Digite a mensagem de boas-vindas..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="general-instructions">Instruções gerais</Label>
                <Textarea
                  id="general-instructions"
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                  placeholder="Instruções que aparecem para o cliente..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Materiais educativos</Label>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Adicionar material
                  </Button>
                </div>
                <div className="space-y-2">
                  {MOCK_EDUCATIONAL_MATERIALS.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{material.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {material.type} • Adicionado em {material.dateAdded}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveContent}>Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
