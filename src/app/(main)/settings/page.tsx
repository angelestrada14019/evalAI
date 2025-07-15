import { SettingsNav } from '@/components/settings/settings-nav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and workspace settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>
        <div className="md:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>This settings page is under construction.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>
    </div>
  )
}
