'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { generateQrMatrix, qrMatrixToPngDataUrl, qrMatrixToSvg } from '@/lib/surveys/qrcode'
import type { SurveyStatus } from '@/lib/surveys/schema'

interface SurveySharePanelProps {
  publicSlug: string
  resultsToken: string
  status: SurveyStatus
  title: string
}

function filenameFor(title: string, suffix: string): string {
  const base =
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'pesquisa'
  return `${base}-${suffix}`
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function CopyableLink({
  id,
  label,
  hint,
  url,
}: {
  id: string
  label: string
  hint: string
  url: string
}) {
  const { add: toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Não foi possível copiar',
        description: 'Copie o endereço manualmente do campo.',
        type: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} value={url} readOnly onFocus={(e) => e.currentTarget.select()} />
        <Button variant="outline" size="icon" onClick={copy} title="Copiar link" className="shrink-0">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" asChild title="Abrir em nova aba" className="shrink-0">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export function SurveySharePanel({
  publicSlug,
  resultsToken,
  status,
  title,
}: SurveySharePanelProps) {
  const { add: toast } = useToast()
  // A origem so existe no browser, por isso o estado e preenchido depois da montagem
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const formUrl = origin ? `${origin}/f/${publicSlug}` : ''
  const resultsUrl = origin ? `${origin}/r/${resultsToken}` : ''

  const qrSvg = useMemo(() => {
    if (!formUrl) return ''
    try {
      return qrMatrixToSvg(generateQrMatrix(formUrl))
    } catch {
      return ''
    }
  }, [formUrl])

  function downloadPng() {
    try {
      const dataUrl = qrMatrixToPngDataUrl(generateQrMatrix(formUrl), 1024)
      triggerDownload(dataUrl, `${filenameFor(title, 'qrcode')}.png`)
    } catch (err) {
      toast({
        title: 'Não foi possível gerar o PNG',
        description: err instanceof Error ? err.message : 'Erro inesperado.',
        type: 'destructive',
      })
    }
  }

  function downloadSvg() {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    triggerDownload(url, `${filenameFor(title, 'qrcode')}.svg`)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links públicos</CardTitle>
          <CardDescription>
            {status === 'published'
              ? 'A pesquisa está publicada e aceitando respostas.'
              : status === 'closed'
                ? 'A pesquisa está encerrada. O link de respostas continua acessível, mas ninguém pode responder.'
                : 'A pesquisa ainda é um rascunho. Publique para que o formulário aceite respostas.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <CopyableLink
            id="form-url"
            label="Link do formulário"
            hint="Envie este link para quem vai responder. Não exige login."
            url={formUrl}
          />
          <CopyableLink
            id="results-url"
            label="Link das respostas"
            hint="Qualquer pessoa com este link vê as respostas. Compartilhe apenas com quem deve ter acesso."
            url={resultsUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4" />
            QR code do formulário
          </CardTitle>
          <CardDescription>
            Aponte a câmera para abrir o formulário. Baixe a imagem para usar em impressos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {qrSvg ? (
              <div
                className="w-full max-w-[260px] rounded-lg border bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
                // O SVG e gerado localmente a partir do proprio link, sem entrada externa
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="h-[260px] w-[260px] animate-pulse rounded-lg bg-muted" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={downloadPng}
              disabled={!qrSvg}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar PNG
            </Button>
            <Button
              variant="outline"
              onClick={downloadSvg}
              disabled={!qrSvg}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar SVG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
