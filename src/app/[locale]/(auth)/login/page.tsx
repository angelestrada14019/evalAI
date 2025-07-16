import { LoginForm } from '@/components/auth/login-form'
import { AppLogo } from '@/components/icons'
import { unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link'

export default function LoginPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <AppLogo className="w-8 h-8 text-primary" />
        <span className="text-foreground">EvalAI</span>
      </Link>
      <LoginForm />
    </div>
  )
}
