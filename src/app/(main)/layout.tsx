import { AppHeader } from '@/components/layout/header'
import { AppSidebar } from '@/components/layout/sidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
