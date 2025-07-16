
import { SettingsNav } from '@/components/settings/settings-nav'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function SettingsPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('SettingsPage');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>
        <div className="md:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>{t('comingSoonTitle')}</CardTitle>
                    <CardDescription>{t('comingSoonDescription')}</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>
    </div>
  )
}
