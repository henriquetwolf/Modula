'use client'

import { useState } from 'react'
import {
  Users,
  Calendar,
  ClipboardList,
  Plus,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SchoolClassDialog } from '@/components/ef/school-class-dialog'
import { cn } from '@/lib/utils'

const MOCK_CLASSES = [
  {
    id: '1',
    name: '5º Ano A',
    school: 'EMEF Centro',
    students: 28,
    ageRange: '10-11 anos',
    schedule: 'Seg 14h, Qua 14h',
    teacher: 'Prof. Ricardo',
  },
  {
    id: '2',
    name: '7º Ano B',
    school: 'EMEF Centro',
    students: 32,
    ageRange: '12-13 anos',
    schedule: 'Ter 10h, Qui 10h',
    teacher: 'Prof. Ricardo',
  },
  {
    id: '3',
    name: '9º Ano A',
    school: 'EMEF Vila Nova',
    students: 25,
    ageRange: '14-15 anos',
    schedule: 'Seg 16h, Qua 16h',
    teacher: 'Profa. Marta',
  },
  {
    id: '4',
    name: '6º Ano C',
    school: 'EMEF Centro',
    students: 30,
    ageRange: '11-12 anos',
    schedule: 'Sex 8h',
    teacher: 'Prof. Ricardo',
  },
  {
    id: '5',
    name: '8º Ano A',
    school: 'EMEF Vila Nova',
    students: 27,
    ageRange: '13-14 anos',
    schedule: 'Ter 14h, Qui 14h',
    teacher: 'Profa. Marta',
  },
]

const BNCC_TEMAS = [
  'Jogos e Brincadeiras',
  'Esportes',
  'Ginástica',
  'Dança',
  'Lutas',
  'Práticas de Aventura',
]

const MOCK_LESSONS = [
  { slot: 'Seg 14h', class: '5º Ano A', theme: 'Esportes', content: 'Vôlei - fundamentos', space: 'Quadra' },
  { slot: 'Seg 16h', class: '9º Ano A', theme: 'Lutas', content: 'Judo - quedas', space: 'Sala' },
  { slot: 'Ter 10h', class: '7º Ano B', theme: 'Ginástica', content: 'Rolamentos e saltos', space: 'Quadra' },
  { slot: 'Ter 14h', class: '8º Ano A', theme: 'Jogos e Brincadeiras', content: 'Queimada adaptada', space: 'Quadra' },
  { slot: 'Qua 14h', class: '5º Ano A', theme: 'Dança', content: 'Ritmos brasileiros', space: 'Sala' },
  { slot: 'Qua 16h', class: '9º Ano A', theme: 'Esportes', content: 'Futebol - táticas', space: 'Quadra' },
  { slot: 'Qui 10h', class: '7º Ano B', theme: 'Práticas de Aventura', content: 'Orientação', space: 'Área externa' },
  { slot: 'Sex 8h', class: '6º Ano C', theme: 'Esportes', content: 'Basquete - passe', space: 'Quadra' },
]

const BNCC_COMPETENCIAS = [
  'Movimento corporal',
  'Regras e valores',
  'Saúde e qualidade de vida',
]

const MOCK_AVALIACOES = [
  { turma: '5º Ano A', aluno: 'Turma inteira', competencia: 'Movimento corporal', nota: 'B', bimestre: '1º', obs: 'Avaliação coletiva' },
  { turma: '5º Ano A', aluno: 'João Silva', competencia: 'Regras e valores', nota: 'A', bimestre: '1º', obs: '' },
  { turma: '5º Ano A', aluno: 'Maria Oliveira', competencia: 'Saúde e qualidade de vida', nota: 'B', bimestre: '1º', obs: '' },
  { turma: '7º Ano B', aluno: 'Turma inteira', competencia: 'Movimento corporal', nota: 'C', bimestre: '1º', obs: 'Precisa melhorar execução' },
  { turma: '7º Ano B', aluno: 'Pedro Costa', competencia: 'Regras e valores', nota: 'A', bimestre: '1º', obs: 'Liderança positiva' },
]

export default function EfSchoolPage() {
  const [classDialogOpen, setClassDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Educação Física Escolar</h1>
        <p className="text-muted-foreground">
          Turmas, planejamento de aulas e avaliações BNCC
        </p>
      </div>

      <Tabs defaultValue="turmas" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="turmas" className="gap-2">
            <Users className="h-4 w-4" />
            Turmas
          </TabsTrigger>
          <TabsTrigger value="planejamento" className="gap-2">
            <Calendar className="h-4 w-4" />
            Planejamento
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="turmas" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setClassDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Turma
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_CLASSES.map((cls) => (
              <Card key={cls.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    {cls.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{cls.school}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {cls.students} alunos
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cls.ageRange}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cls.schedule}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {cls.teacher}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano de Aula
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planejamento semanal
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Temas BNCC: {BNCC_TEMAS.join(', ')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_LESSONS.map((l, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{l.slot}</span>
                    </div>
                    <div>
                      <span className="font-medium">{l.class}</span>
                      <span className="text-muted-foreground"> — {l.content}</span>
                    </div>
                    <Badge variant="secondary">{l.theme}</Badge>
                    <span className="text-sm text-muted-foreground">{l.space}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Nota/Conceito</TableHead>
                  <TableHead>Bimestre</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AVALIACOES.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{a.turma}</TableCell>
                    <TableCell>{a.aluno}</TableCell>
                    <TableCell>{a.competencia}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          a.nota === 'A' && 'border-emerald-500/50 text-emerald-700',
                          a.nota === 'B' && 'border-blue-500/50 text-blue-700',
                          a.nota === 'C' && 'border-amber-500/50 text-amber-700',
                          a.nota === 'D' && 'border-red-500/50 text-red-700'
                        )}
                      >
                        {a.nota}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.bimestre}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {a.obs || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <SchoolClassDialog
        open={classDialogOpen}
        onOpenChange={setClassDialogOpen}
      />
    </div>
  )
}
