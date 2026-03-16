'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Dumbbell, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortalPreview() {
  const measurements = [
    { label: 'Peso', value: '72 kg', date: '15/03/2025' },
    { label: 'IMC', value: '22,5', date: '15/03/2025' },
    { label: '% Gordura', value: '18%', date: '15/03/2025' },
  ]

  const documents = [
    { name: 'Contrato de prestação', type: 'PDF', date: '10/03/2025' },
    { name: 'Resultado avaliação física', type: 'PDF', date: '12/03/2025' },
    { name: 'Prescrição treino atual', type: 'PDF', date: '14/03/2025' },
  ]

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-6',
        'dark:border-sky-900/50 dark:bg-sky-950/20'
      )}
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
        Preview do portal do cliente
      </p>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Olá, Maria! 👋
        </h2>

        <Card className="border-sky-200/60 bg-white shadow-sm dark:border-sky-900/40 dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-sky-500" />
              Próxima consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              18/03/2025 às 14h30
            </p>
            <p className="text-sm font-medium">Dr. João Silva</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/60 bg-white shadow-sm dark:border-sky-900/40 dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Dumbbell className="h-4 w-4 text-sky-500" />
              Plano de treino atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <p className="text-sm font-medium">Força e resistência – Semana 3</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: '60%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground">60% concluído</p>
          </CardContent>
        </Card>

        <Card className="border-sky-200/60 bg-white shadow-sm dark:border-sky-900/40 dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Scale className="h-4 w-4 text-sky-500" />
              Medições recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {measurements.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg bg-muted/50 p-2 text-center"
                >
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-medium">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            2 consentimentos pendentes
          </Badge>
        </div>

        <Card className="border-sky-200/60 bg-white shadow-sm dark:border-sky-900/40 dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-sky-500" />
              Documentos recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.name}
                  className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.type} · {doc.date}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
