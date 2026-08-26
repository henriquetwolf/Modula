'use client'

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, ImageIcon, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_SUBMIT_LABEL,
  LOGO_URL_MAX_LENGTH,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  SUBMIT_LABEL_MAX_LENGTH,
  SURVEY_BRANDING_TEXT,
  createEmptyQuestion,
  isChoiceQuestion,
  type Question,
  type QuestionType,
} from '@/lib/surveys/schema'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SurveyBuilderProps {
  surveyId: string
  title: string
  description: string
  submitLabel: string
  logoUrl: string
  showBranding: boolean
  questions: Question[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSubmitLabelChange: (value: string) => void
  onLogoUrlChange: (value: string) => void
  onShowBrandingChange: (value: boolean) => void
  onQuestionsChange: (questions: Question[]) => void
}

export function SurveyBuilder({
  surveyId,
  title,
  description,
  submitLabel,
  logoUrl,
  showBranding,
  questions,
  onTitleChange,
  onDescriptionChange,
  onSubmitLabelChange,
  onLogoUrlChange,
  onShowBrandingChange,
  onQuestionsChange,
}: SurveyBuilderProps) {
  const { add: toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch(`/api/surveys/${surveyId}/logo`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Não foi possível enviar a logo.')

      onLogoUrlChange(json.logo_url as string)
      toast({ title: 'Logo enviada', type: 'success' })
    } catch (err) {
      toast({
        title: 'Falha ao enviar logo',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveLogo() {
    if (!logoUrl) return

    setUploadingLogo(true)
    try {
      const res = await fetch(`/api/surveys/${surveyId}/logo`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Não foi possível remover a logo.')

      onLogoUrlChange('')
      toast({ title: 'Logo removida', type: 'success' })
    } catch (err) {
      toast({
        title: 'Falha ao remover logo',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    onQuestionsChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function changeType(index: number, type: QuestionType) {
    const current = questions[index]
    const options = isChoiceQuestion(type)
      ? current.options.length >= 2
        ? current.options
        : ['Opção 1', 'Opção 2']
      : []
    updateQuestion(index, { type, options })
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= questions.length) return
    const next = [...questions]
    ;[next[index], next[target]] = [next[target], next[index]]
    onQuestionsChange(next)
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const question = questions[questionIndex]
    const options = question.options.map((opt, i) => (i === optionIndex ? value : opt))
    updateQuestion(questionIndex, { options })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cabeçalho do formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="survey-title">Título</Label>
            <Input
              id="survey-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Ex.: Pesquisa de satisfação"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="survey-description">Descrição (opcional)</Label>
            <Textarea
              id="survey-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Texto exibido no topo do formulário para quem vai responder."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="survey-submit-label">Texto do botão de envio (opcional)</Label>
            <Input
              id="survey-submit-label"
              value={submitLabel}
              onChange={(e) => onSubmitLabelChange(e.target.value)}
              placeholder={DEFAULT_SUBMIT_LABEL}
              maxLength={SUBMIT_LABEL_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar &ldquo;{DEFAULT_SUBMIT_LABEL}&rdquo;.
            </p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label>Logo no topo (opcional)</Label>
            {logoUrl ? (
              <div className="space-y-3">
                <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
                  <img
                    src={logoUrl}
                    alt="Pré-visualização da logo"
                    className="h-auto max-h-32 w-full max-w-sm object-contain"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Trocar imagem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={handleRemoveLogo}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover logo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors',
                  uploadingLogo
                    ? 'cursor-wait border-muted-foreground/25 bg-muted/20'
                    : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
                )}
              >
                {uploadingLogo ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {uploadingLogo ? 'Enviando logo...' : 'Clique para enviar uma imagem'}
                </span>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP ou GIF · até 2 MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleLogoUpload(file)
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="survey-logo-url">Ou informe a URL da imagem</Label>
              <Input
                id="survey-logo-url"
                value={logoUrl}
                onChange={(e) => onLogoUrlChange(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
                maxLength={LOGO_URL_MAX_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                Use o upload acima ou cole o link de uma imagem hospedada externamente.
              </p>
            </div>
          </div>

          <label className="flex w-fit items-start gap-2 border-t pt-4 text-sm">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(e) => onShowBrandingChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            />
            <span>
              Exibir rodapé &ldquo;{SURVEY_BRANDING_TEXT}&rdquo;
            </span>
          </label>
        </CardContent>
      </Card>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                Pergunta {index + 1}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, 1)}
                  disabled={index === questions.length - 1}
                  title="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuestionsChange(questions.filter((_, i) => i !== index))}
                  title="Remover pergunta"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div className="space-y-2">
                <Label htmlFor={`label-${question.id}`}>Pergunta</Label>
                <Input
                  id={`label-${question.id}`}
                  value={question.label}
                  onChange={(e) => updateQuestion(index, { label: e.target.value })}
                  placeholder="O que você quer perguntar?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`type-${question.id}`}>Tipo</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => changeType(index, value as QuestionType)}
                >
                  <SelectTrigger id={`type-${question.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`desc-${question.id}`}>Texto de ajuda (opcional)</Label>
              <Input
                id={`desc-${question.id}`}
                value={question.description ?? ''}
                onChange={(e) => updateQuestion(index, { description: e.target.value })}
                placeholder="Instrução extra exibida abaixo da pergunta."
              />
            </div>

            {isChoiceQuestion(question.type) && (
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                        placeholder={`Opção ${optionIndex + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateQuestion(index, {
                            options: question.options.filter((_, i) => i !== optionIndex),
                          })
                        }
                        disabled={question.options.length <= 2}
                        title="Remover opção"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuestion(index, {
                      options: [...question.options, `Opção ${question.options.length + 1}`],
                    })
                  }
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar opção
                </Button>
              </div>
            )}

            <label className="flex w-fit items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Resposta obrigatória
            </label>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={() => onQuestionsChange([...questions, createEmptyQuestion()])}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Adicionar pergunta
      </Button>
    </div>
  )
}
