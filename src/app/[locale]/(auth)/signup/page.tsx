import { SignUpForm } from '@/components/auth/signup-form'
import { AppLogo } from '@/components/icons'
import {Link} from '@/i18n/navigation'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md">
       <Link href="/dashboard" className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <AppLogo className="w-8 h-8 text-primary" />
        <span className="text-foreground">EvalAI</span>
      </Link>
      <SignUpForm />
    </div>
  )
}
