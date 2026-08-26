'use client'

import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2, X } from 'lucide-react'
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
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  createEmptyQuestion,
  isChoiceQuestion,
  type Question,
  type QuestionType,
} from '@/lib/surveys/schema'

interface SurveyBuilderProps {
  title: string
  description: string
  questions: Question[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onQuestionsChange: (questions: Question[]) => void
}

export function SurveyBuilder({
  title,
  description,
  questions,
  onTitleChange,
  onDescriptionChange,
  onQuestionsChange,
}: SurveyBuilderProps) {
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
