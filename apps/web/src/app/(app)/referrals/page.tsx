'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowRightLeft, Users, Plus, Search, MoreVertical, Star } from 'lucide-react'
import { ReferralDialog } from '@/components/referrals/referral-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type ReferralStatus = 'pendente' | 'aceito' | 'recusado' | 'concluído'

interface Referral {
  id: string
  paciente: string
  de: string
  para: string
  especialidade: string
  motivo: string
  status: ReferralStatus
  data: string
}

const STATUS_CONFIG: Record<ReferralStatus, string> = {
  pendente: 'bg-yellow-500/15 text-yellow-700 border-yellow-200',
  aceito: 'bg-blue-500/15 text-blue-700 border-blue-200',
  recusado: 'bg-red-500/15 text-red-700 border-red-200',
  concluído: 'bg-green-500/15 text-green-700 border-green-200',
}

const MOCK_REFERRALS: Referral[] = [
  { id: '1', paciente: 'Maria Silva', de: 'Dr. João (EF)', para: 'Dra. Ana (Nutri)', especialidade: 'Nutrição', motivo: 'Acompanhamento nutricional pós-treino', status: 'concluído', data: '2025-03-10' },
  { id: '2', paciente: 'Pedro Santos', de: 'Dra. Ana (Nutri)', para: 'Dr. Carlos (Fisio)', especialidade: 'Fisioterapia', motivo: 'Dor lombar - avaliação', status: 'aceito', data: '2025-03-14' },
  { id: '3', paciente: 'Ana Costa', de: 'Dr. Carlos (Fisio)', para: 'Dr. João (EF)', especialidade: 'EF', motivo: 'Retorno treino pós-reabilitação', status: 'pendente', data: '2025-03-15' },
  { id: '4', paciente: 'João Oliveira', de: 'Dr. João (EF)', para: 'Dra. Ana (Nutri)', especialidade: 'Nutrição', motivo: 'Plano para ganho de massa', status: 'concluído', data: '2025-03-08' },
  { id: '5', paciente: 'Carla Mendes', de: 'Dra. Ana (Nutri)', para: 'Dr. João (EF)', especialidade: 'EF', motivo: 'Treino cardiovascular', status: 'aceito', data: '2025-03-12' },
  { id: '6', paciente: 'Roberto Lima', de: 'Dr. Carlos (Fisio)', para: 'Dra. Ana (Nutri)', especialidade: 'Nutrição', motivo: 'Suplementação para recuperação', status: 'recusado', data: '2025-03-11' },
  { id: '7', paciente: 'Fernanda Souza', de: 'Dr. João (EF)', para: 'Dr. Carlos (Fisio)', especialidade: 'Fisioterapia', motivo: 'Avaliação ombro', status: 'pendente', data: '2025-03-16' },
]

interface Professional {
  id: string
  name: string
  profession: string
  specialties: string
  availability: 'Aceita encaminhamentos' | 'Indisponível'
  rating: number
  referralsReceived: number
}

const MOCK_PROFESSIONALS: Professional[] = [
  { id: '1', name: 'Dr. João Silva', profession: 'EF', specialties: 'Treino funcional, Emagrecimento', availability: 'Aceita encaminhamentos', rating: 4.9, referralsReceived: 12 },
  { id: '2', name: 'Dra. Ana Costa', profession: 'Nutrição', specialties: 'Nutrição esportiva, Emagrecimento', availability: 'Aceita encaminhamentos', rating: 4.8, referralsReceived: 18 },
  { id: '3', name: 'Dr. Carlos Mendes', profession: 'Fisioterapia', specialties: 'Ortopedia, Coluna', availability: 'Aceita encaminhamentos', rating: 4.7, referralsReceived: 24 },
  { id: '4', name: 'Dra. Beatriz Lima', profession: 'Nutrição', specialties: 'Nutrição clínica', availability: 'Indisponível', rating: 4.6, referralsReceived: 8 },
  { id: '5', name: 'Dr. Eduardo Souza', profession: 'Fisioterapia', specialties: 'Traumatologia', availability: 'Aceita encaminhamentos', rating: 4.5, referralsReceived: 15 },
  { id: '6', name: 'Dra. Patrícia Santos', profession: 'EF', specialties: 'Treino de força', availability: 'Aceita encaminhamentos', rating: 4.9, referralsReceived: 10 },
  { id: '7', name: 'Dr. Ricardo Oliveira', profession: 'Fisioterapia', specialties: 'Pilates', availability: 'Indisponível', rating: 4.4, referralsReceived: 6 },
  { id: '8', name: 'Dra. Mariana Ferreira', profession: 'Nutrição', specialties: 'Nutrição esportiva', availability: 'Aceita encaminhamentos', rating: 4.7, referralsReceived: 14 },
]

export default function ReferralsPage() {
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)
  const [professionFilter, setProfessionFilter] = useState<string>('todos')
  const [search, setSearch] = useState('')

  const filteredProfessionals = MOCK_PROFESSIONALS.filter((p) => {
    const profMatch = professionFilter === 'todos' || p.profession.toLowerCase() === professionFilter
    const searchLower = search.toLowerCase()
    const searchMatch = !search || p.name.toLowerCase().includes(searchLower) || p.specialties.toLowerCase().includes(searchLower)
    return profMatch && searchMatch
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="encaminhamentos" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="encaminhamentos" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Encaminhamentos
          </TabsTrigger>
          <TabsTrigger value="rede" className="gap-2">
            <Users className="h-4 w-4" />
            Rede Profissional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encaminhamentos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setReferralDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Encaminhamento
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_REFERRALS.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.paciente}</TableCell>
                      <TableCell className="text-muted-foreground">{r.de}</TableCell>
                      <TableCell>{r.para}</TableCell>
                      <TableCell>{r.especialidade}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{r.motivo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', STATUS_CONFIG[r.status])}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(r.data)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <ReferralDialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen} />
        </TabsContent>

        <TabsContent value="rede" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select
                value={professionFilter}
                onChange={(e) => setProfessionFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="todos">Todas as profissões</option>
                <option value="ef">EF</option>
                <option value="nutrição">Nutrição</option>
                <option value="fisioterapia">Fisioterapia</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfessionals.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-muted">{getInitials(p.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{p.name}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {p.profession}
                      </Badge>
                      <p className="mt-2 text-xs text-muted-foreground">{p.specialties}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{p.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {p.referralsReceived} encaminhamentos
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-2',
                          p.availability === 'Aceita encaminhamentos'
                            ? 'border-green-500/50 text-green-700'
                            : 'border-muted text-muted-foreground'
                        )}
                      >
                        {p.availability}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
