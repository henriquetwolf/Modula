import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700'
      )}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-widest drop-shadow-sm">
            MODULA HEALTH
          </h1>
          <p className="text-teal-100/90 text-sm mt-2">
            Plataforma para profissionais de saúde
          </p>
        </div>
        <Card className="border-0 shadow-2xl bg-white">
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
