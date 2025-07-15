
'use client'

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Eye, Save } from "lucide-react"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"

interface BuilderHeaderProps {
    title: string;
    description: string;
}

export function BuilderHeader({ title, description }: BuilderHeaderProps) {
    const t = useTranslations('FormBuilderPage');

    return (
        <header className="flex-shrink-0 p-3 md:p-4 border-b bg-card">
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-xl font-bold truncate">{title}</h1>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{description}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button variant="outline">
                        <Eye className="mr-0 sm:mr-2 h-4 w-4" /> 
                        <span className='hidden sm:inline'>{t('preview')}</span>
                    </Button>
                    <AIFormulaSuggester />
                    <Button>
                        <Save className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className='hidden sm:inline'>{t('save')}</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}

    