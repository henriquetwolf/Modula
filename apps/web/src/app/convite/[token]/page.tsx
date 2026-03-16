'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { ROLE_LABELS, PROFESSION_LABELS } from '@/lib/permissions-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react'

type PageStatus = 'loading' | 'ready' | 'accepting' | 'success' | 'error' | 'login_required'

interface InviteInfo {
  email: string
  role_name: string
  profession: string | null
  tenant_name?: string
}

export default function AcceptInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [status, setStatus] = useState<PageStatus>('loading')
  const [message, setMessage] = useState('')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = getSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('login_required')
        return
      }

      const { data: invitation } = await supabase
        .from('invitations')
        .select('email, role_name, profession, status, tenants(name)')
        .eq('token', token)
        .single()

      if (!invitation) {
        setStatus('error')
        setMessage('Convite nao encontrado ou invalido.')
        return
      }

      const inv = invitation as Record<string, unknown>

      if (inv.status !== 'pending') {
        setStatus('error')
        setMessage(
          inv.status === 'accepted'
            ? 'Este convite ja foi aceito.'
            : inv.status === 'expired'
              ? 'Este convite expirou.'
              : 'Este convite foi cancelado.'
        )
        return
      }

      const tenantData = inv.tenants as { name: string } | { name: string }[] | null
      const tenantName = Array.isArray(tenantData) ? tenantData[0]?.name : tenantData?.name

      setInviteInfo({
        email: inv.email as string,
        role_name: inv.role_name as string,
        profession: inv.profession as string | null,
        tenant_name: tenantName ?? undefined,
      })
      setStatus('ready')
    }

    check()
  }, [token])

  async function handleAccept() {
    setStatus('accepting')
    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Erro ao aceitar convite.')
      }
    } catch {
      setStatus('error')
      setMessage('Erro de conexao. Tente novamente.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === 'success' ? (
              <CheckCircle className="h-8 w-8 text-primary" />
            ) : status === 'error' ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : (
              <UserPlus className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle>
            {status === 'success'
              ? 'Convite Aceito!'
              : status === 'error'
                ? 'Ops!'
                : status === 'login_required'
                  ? 'Faca Login'
                  : 'Convite para Equipe'}
          </CardTitle>
          <CardDescription>
            {status === 'success'
              ? 'Voce agora faz parte da equipe. Redirecionando...'
              : status === 'error'
                ? message
                : status === 'login_required'
                  ? 'Voce precisa estar logado para aceitar o convite.'
                  : inviteInfo?.tenant_name
                    ? `Voce foi convidado(a) para ${inviteInfo.tenant_name}`
                    : 'Voce recebeu um convite para participar de uma equipe'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {status === 'login_required' && (
            <div className="flex flex-col items-center gap-3">
              <Link href={`/login?redirect=/convite/${token}`}>
                <Button className="w-full">Fazer Login</Button>
              </Link>
              <Link href={`/register?redirect=/convite/${token}`}>
                <Button variant="outline" className="w-full">Criar Conta</Button>
              </Link>
            </div>
          )}

          {(status === 'ready' || status === 'accepting') && inviteInfo && (
            <>
              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nivel de Acesso</span>
                  <Badge>
                    {ROLE_LABELS[inviteInfo.role_name] ?? inviteInfo.role_name}
                  </Badge>
                </div>
                {inviteInfo.profession && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profissao</span>
                    <Badge variant="secondary">
                      {PROFESSION_LABELS[inviteInfo.profession] ?? inviteInfo.profession}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{inviteInfo.email}</span>
                </div>
              </div>
              <Button
                onClick={handleAccept}
                disabled={status === 'accepting'}
                className="w-full gap-2"
              >
                {status === 'accepting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Aceitar Convite
              </Button>
            </>
          )}

          {status === 'success' && (
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline">Ir para Dashboard</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
