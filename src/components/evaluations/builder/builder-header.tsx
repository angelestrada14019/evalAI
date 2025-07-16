
'use client'

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Save } from "lucide-react"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"
import { useFormBuilder } from "@/context/form-builder-context"

interface BuilderHeaderProps {
    onSave: () => void;
}

export function BuilderHeader({ onSave }: BuilderHeaderProps) {
    const t = useTranslations('FormBuilderPage');
    const { template, setTemplate } = useFormBuilder();

    if (!template) return null;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!template) return;
        setTemplate({ ...template, title: e.target.value });
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (!template) return;
        setTemplate({ ...template, description: e.target.value });
    }

    return (
        <header className="flex-shrink-0 p-3 md:p-4 border-b bg-card">
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div className="min-w-0 flex-1 space-y-1">
                    <Input 
                        placeholder={t('titlePlaceholder')}
                        value={template.title}
                        onChange={handleTitleChange}
                        className="text-lg md:text-xl font-bold border-none shadow-none focus-visible:ring-0 px-1 h-auto"
                    />
                     <Input 
                        placeholder={t('descriptionPlaceholder')}
                        value={template.description}
                        onChange={handleDescriptionChange}
                        className="text-xs md:text-sm text-muted-foreground border-none shadow-none focus-visible:ring-0 px-1 h-auto"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Button variant="outline">
                        <Eye className="mr-0 sm:mr-2 h-4 w-4" /> 
                        <span className='hidden sm:inline'>{t('preview')}</span>
                    </Button>
                    <AIFormulaSuggester />
                    <Button onClick={onSave}>
                        <Save className="mr-0 sm:mr-2 h-4 w-4" />
                        <span className='hidden sm:inline'>{t('save')}</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
