'use client'

import { useState } from 'react'
import {
  Search,
  Dumbbell,
  FileText,
  BookOpen,
  ChevronDown,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const EXERCISE_CATEGORIES = [
  'Força',
  'Flexibilidade',
  'Cardio',
  'Equilíbrio',
  'Terapêutico',
  'Funcional',
]

const MOCK_EXERCISES = [
  {
    id: '1',
    name: 'Agachamento livre',
    category: 'Força',
    muscleGroups: ['Quadríceps', 'Glúteos'],
    difficulty: 'Intermediário' as const,
    profession: 'EF' as const,
  },
  {
    id: '2',
    name: 'Alongamento lombar',
    category: 'Flexibilidade',
    muscleGroups: ['Lombar', 'Isquiotibiais'],
    difficulty: 'Iniciante' as const,
    profession: 'Fisio' as const,
  },
  {
    id: '3',
    name: 'Corrida esteira',
    category: 'Cardio',
    muscleGroups: ['MMII', 'Sistema cardiorrespiratório'],
    difficulty: 'Iniciante' as const,
    profession: 'Ambos' as const,
  },
  {
    id: '4',
    name: 'Prancha estática',
    category: 'Equilíbrio',
    muscleGroups: ['Core', 'Abdominais'],
    difficulty: 'Intermediário' as const,
    profession: 'Ambos' as const,
  },
  {
    id: '5',
    name: 'Mobilização vertebral',
    category: 'Terapêutico',
    muscleGroups: ['Coluna'],
    difficulty: 'Iniciante' as const,
    profession: 'Fisio' as const,
  },
  {
    id: '6',
    name: 'Levantamento terra',
    category: 'Força',
    muscleGroups: ['Posterior de coxa', 'Lombar', 'Core'],
    difficulty: 'Avançado' as const,
    profession: 'EF' as const,
  },
  {
    id: '7',
    name: 'Alongamento de peitoral',
    category: 'Flexibilidade',
    muscleGroups: ['Peitoral', 'Deltóide anterior'],
    difficulty: 'Iniciante' as const,
    profession: 'Ambos' as const,
  },
  {
    id: '8',
    name: 'Hidroginástica',
    category: 'Cardio',
    muscleGroups: ['MMII', 'Core'],
    difficulty: 'Iniciante' as const,
    profession: 'Ambos' as const,
  },
  {
    id: '9',
    name: 'Single leg stance',
    category: 'Equilíbrio',
    muscleGroups: ['Propriocepção', 'MMII'],
    difficulty: 'Intermediário' as const,
    profession: 'Fisio' as const,
  },
  {
    id: '10',
    name: 'Estabilização escapular',
    category: 'Terapêutico',
    muscleGroups: ['Escápulas', 'Cintura escapular'],
    difficulty: 'Iniciante' as const,
    profession: 'Fisio' as const,
  },
  {
    id: '11',
    name: 'Burpee modificado',
    category: 'Funcional',
    muscleGroups: ['Full body'],
    difficulty: 'Intermediário' as const,
    profession: 'EF' as const,
  },
  {
    id: '12',
    name: 'Remada alta',
    category: 'Força',
    muscleGroups: ['Trapézio', 'Deltóides'],
    difficulty: 'Avançado' as const,
    profession: 'EF' as const,
  },
]

const MOCK_PROTOCOLS = [
  {
    id: '1',
    name: 'Protocolo para Lombalgia Crônica',
    area: 'Fisio' as const,
    type: 'Clínico',
    evidenceLevel: '1A',
    author: 'Dr. Silva',
    date: '2024-03-10',
    description:
      'Tratamento baseado em exercícios de estabilização lombar e alongamento.',
  },
  {
    id: '2',
    name: 'Hipertrofia para iniciantes',
    area: 'EF' as const,
    type: 'Treino',
    evidenceLevel: '2A',
    author: 'Prof. Lima',
    date: '2024-02-15',
    description: 'Periodização linear para ganho de massa muscular em novatos.',
  },
  {
    id: '3',
    name: 'Protocolo DASH para hipertensão',
    area: 'Nutri' as const,
    type: 'Dietético',
    evidenceLevel: '1A',
    author: 'Dra. Costa',
    date: '2024-01-20',
    description: 'Dieta rica em vegetais, frutas e lácteos com baixo teor de gordura.',
  },
  {
    id: '4',
    name: 'Reabilitação pós-ACL',
    area: 'Multi' as const,
    type: 'Clínico',
    evidenceLevel: '1B',
    author: 'Equipe Multi',
    date: '2024-03-01',
    description: 'Programa integrado EF + Fisio para retorno ao esporte.',
  },
  {
    id: '5',
    name: 'Periodização para atletas de endurance',
    area: 'EF' as const,
    type: 'Treino',
    evidenceLevel: '2B',
    author: 'Prof. Santos',
    date: '2024-02-28',
    description: 'Modelo de blocos com fases de volume e intensidade.',
  },
  {
    id: '6',
    name: 'Tratamento de ombro congelado',
    area: 'Fisio' as const,
    type: 'Clínico',
    evidenceLevel: '1A',
    author: 'Dr. Oliveira',
    date: '2024-02-10',
    description: 'Mobilização articular e exercícios de CPM.',
  },
  {
    id: '7',
    name: 'Planejamento para diabetes tipo 2',
    area: 'Nutri' as const,
    type: 'Dietético',
    evidenceLevel: '1A',
    author: 'Dra. Ferreira',
    date: '2024-01-15',
    description: 'Contagem de carboidratos e distribuição de refeições.',
  },
  {
    id: '8',
    name: 'Avaliação integrada idoso',
    area: 'Multi' as const,
    type: 'Clínico',
    evidenceLevel: '1B',
    author: 'Equipe Multi',
    date: '2024-03-05',
    description: 'Avaliação geriátrica com EF, Fisio e Nutri.',
  },
]

const MOCK_MATERIALS = [
  {
    id: '1',
    title: 'Guia de Alimentação Saudável',
    type: 'PDF' as const,
    category: 'Nutrição',
    description: 'Material educativo para pacientes com orientações gerais.',
    downloads: 124,
    date: '2024-02-20',
  },
  {
    id: '2',
    title: 'Vídeo: Execução do Agachamento',
    type: 'Vídeo' as const,
    category: 'Treinamento',
    description: 'Demonstração passo a passo com dicas de segurança.',
    downloads: 89,
    date: '2024-03-01',
  },
  {
    id: '3',
    title: 'Evidências em Lombalgia',
    type: 'Artigo' as const,
    category: 'Fisioterapia',
    description: 'Revisão sistemática sobre tratamento conservador.',
    downloads: 56,
    date: '2024-01-15',
  },
  {
    id: '4',
    title: 'Pirâmide Alimentar',
    type: 'Infográfico' as const,
    category: 'Nutrição',
    description: 'Representação visual da alimentação balanceada.',
    downloads: 203,
    date: '2024-02-10',
  },
  {
    id: '5',
    title: 'Protocolo de Alongamento',
    type: 'PDF' as const,
    category: 'Educação Física',
    description: 'Sequência de alongamentos para antes e depois do treino.',
    downloads: 167,
    date: '2024-03-08',
  },
  {
    id: '6',
    title: 'Exercícios para Dor Lombar',
    type: 'Vídeo' as const,
    category: 'Fisioterapia',
    description: 'Série de exercícios terapêuticos para lombalgia.',
    downloads: 78,
    date: '2024-02-25',
  },
  {
    id: '7',
    title: 'Nutrição e Performance',
    type: 'Artigo' as const,
    category: 'Esportes',
    description: 'Artigos sobre timing nutricional e suplementação.',
    downloads: 45,
    date: '2024-01-30',
  },
  {
    id: '8',
    title: 'Postura no Home Office',
    type: 'Infográfico' as const,
    category: 'Saúde',
    description: 'Dicas visuais para ergonomia no trabalho remoto.',
    downloads: 312,
    date: '2024-03-12',
  },
]

export default function MultiLibraryPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)

  const filteredExercises = MOCK_EXERCISES.filter((ex) => {
    const matchSearch =
      !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroups.some((m) =>
        m.toLowerCase().includes(search.toLowerCase())
      )
    const matchType =
      filterType === 'all' ||
      (filterType === 'category' && ex.category === filterCategory) ||
      (filterType === 'difficulty' && ex.difficulty === filterCategory) ||
      (filterType === 'profession' && ex.profession === filterCategory)
    return matchSearch && (filterType === 'all' ? true : matchType)
  })

  const filteredProtocols = MOCK_PROTOCOLS.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const filteredMaterials = MOCK_MATERIALS.filter((m) => {
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca Multidisciplinar</h1>
        <p className="text-muted-foreground">
          Exercícios, protocolos e materiais educativos compartilhados.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="category">Por categoria</SelectItem>
              <SelectItem value="difficulty">Por dificuldade</SelectItem>
              <SelectItem value="profession">Por profissão</SelectItem>
            </SelectContent>
          </Select>
          {filterType !== 'all' && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterType === 'category' &&
                  EXERCISE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                {filterType === 'difficulty' && (
                  <>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </>
                )}
                {filterType === 'profession' && (
                  <>
                    <SelectItem value="EF">EF</SelectItem>
                    <SelectItem value="Fisio">Fisio</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs defaultValue="exercicios" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="exercicios" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Exercícios
          </TabsTrigger>
          <TabsTrigger value="protocolos" className="gap-2">
            <FileText className="h-4 w-4" />
            Protocolos
          </TabsTrigger>
          <TabsTrigger value="materiais" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Materiais Educativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercicios" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((ex) => (
              <Card key={ex.id} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{ex.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {ex.category}
                    </Badge>
                    {ex.muscleGroups.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{ex.difficulty}</span>
                    <Badge
                      variant={
                        ex.profession === 'EF'
                          ? 'default'
                          : ex.profession === 'Fisio'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {ex.profession}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="protocolos" className="space-y-2">
          <div className="space-y-2">
            {filteredProtocols.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() =>
                  setExpandedProtocol(expandedProtocol === p.id ? null : p.id)
                }
              >
                <CardHeader className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{p.area}</Badge>
                        <Badge variant="secondary">{p.type}</Badge>
                        <Badge variant="outline">Nível {p.evidenceLevel}</Badge>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                        expandedProtocol === p.id && 'rotate-180'
                      )}
                    />
                  </div>
                </CardHeader>
                {expandedProtocol === p.id && (
                  <CardContent className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {p.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Autor: {p.author}</span>
                      <span>{p.date}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="materiais" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((m) => (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{m.type}</Badge>
                    <Badge variant="outline">{m.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {m.description}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{m.downloads} downloads</span>
                    <span>{m.date}</span>
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
