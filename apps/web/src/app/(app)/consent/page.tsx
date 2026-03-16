'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, FileSignature } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { ConsentTemplateDialog } from '@/components/consent/consent-template-dialog'
import { cn } from '@/lib/utils'

const CONSENT_TYPES: Record<string, string> = {
  atendimento: 'Atendimento',
  dados_pessoais: 'Dados Pessoais',
  imagem: 'Imagem',
  pesquisa: 'Pesquisa',
}

const MOCK_TEMPLATES = [
  {
    id: '1',
    title: 'Termo de Consentimento para Tratamento',
    description: 'Autorização para realização de procedimentos e acompanhamento clínico.',
    type: 'atendimento',
    isActive: true,
    version: 2,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Autorização de Uso de Imagem',
    description: 'Consentimento para captura e utilização de imagens em materiais promocionais.',
    type: 'imagem',
    isActive: true,
    version: 1,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'Consentimento para Coleta de Dados de Saúde',
    description: 'Termo LGPD para armazenamento e processamento de informações de saúde.',
    type: 'dados_pessoais',
    isActive: true,
    version: 3,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    title: 'Termo de Responsabilidade para Atividade Física',
    description: 'Declaração de ciência dos riscos em atividades físicas e treinamentos.',
    type: 'atendimento',
    isActive: true,
    version: 1,
    createdAt: '2024-03-01',
  },
  {
    id: '5',
    title: 'Participação em Pesquisa Clínica',
    description: 'Autorização para inclusão em estudos e pesquisas com dados anonimizados.',
    type: 'pesquisa',
    isActive: false,
    version: 1,
    createdAt: '2024-02-20',
  },
]

const MOCK_RECORDS = [
  {
    id: '1',
    clientName: 'Maria Silva Santos',
    templateTitle: 'Termo de Consentimento para Tratamento',
    status: 'assinado',
    signedAt: '2024-03-10',
    validUntil: '2025-03-10',
  },
  {
    id: '2',
    clientName: 'João Pedro Oliveira',
    templateTitle: 'Autorização de Uso de Imagem',
    status: 'pendente',
    signedAt: null,
    validUntil: null,
  },
  {
    id: '3',
    clientName: 'Ana Costa Lima',
    templateTitle: 'Consentimento para Coleta de Dados de Saúde',
    status: 'assinado',
    signedAt: '2024-03-08',
    validUntil: '2025-03-08',
  },
  {
    id: '4',
    clientName: 'Carlos Eduardo Souza',
    templateTitle: 'Termo de Consentimento para Tratamento',
    status: 'revogado',
    signedAt: '2024-02-15',
    validUntil: null,
  },
  {
    id: '5',
    clientName: 'Fernanda Mendes',
    templateTitle: 'Termo de Responsabilidade para Atividade Física',
    status: 'assinado',
    signedAt: '2024-03-12',
    validUntil: '2025-03-12',
  },
  {
    id: '6',
    clientName: 'Ricardo Alves',
    templateTitle: 'Autorização de Uso de Imagem',
    status: 'assinado',
    signedAt: '2024-03-01',
    validUntil: '2025-03-01',
  },
  {
    id: '7',
    clientName: 'Patrícia Gomes',
    templateTitle: 'Consentimento para Coleta de Dados de Saúde',
    status: 'pendente',
    signedAt: null,
    validUntil: null,
  },
]

export default function ConsentPage() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const { add: toast } = useToast()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="registros">Registros</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <TabsContent value="templates" className="mt-0">
              <Button onClick={() => setTemplateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </TabsContent>
            <TabsContent value="registros" className="mt-0">
              <Button onClick={() => toast({ title: 'Em breve', description: 'Solicitação de consentimento estará disponível em breve.' })}>
                <FileSignature className="mr-2 h-4 w-4" />
                Solicitar Consentimento
              </Button>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_TEMPLATES.map((t) => (
              <Card key={t.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{t.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{CONSENT_TYPES[t.type] ?? t.type}</Badge>
                    <Badge variant={t.isActive ? 'default' : 'outline'}>
                      {t.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">v{t.version}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registros" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data assinatura</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_RECORDS.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.clientName}</TableCell>
                    <TableCell>{r.templateTitle}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          r.status === 'pendente' && 'border-yellow-500 text-yellow-600',
                          r.status === 'assinado' && 'border-green-500 text-green-600',
                          r.status === 'revogado' && 'border-red-500 text-red-600'
                        )}
                      >
                        {r.status === 'pendente' && 'Pendente'}
                        {r.status === 'assinado' && 'Assinado'}
                        {r.status === 'revogado' && 'Revogado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.signedAt ? formatDate(r.signedAt) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.validUntil ? formatDate(r.validUntil) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ConsentTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  )
}
