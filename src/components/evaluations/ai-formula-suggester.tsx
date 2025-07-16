"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BrainCircuit, Loader2 } from 'lucide-react'
import { suggestScoreFormula } from '@/actions/evaluation-actions'
import { Card, CardContent } from '../ui/card'
import { useToast } from '@/hooks/use-toast'
import { useFormBuilder } from '@/context/form-builder-context'
import type { FormItem } from '@/components/evaluations/builder/types'

const formatFormContentForAI = (items: FormItem[]): string => {
  if (!items || items.length === 0) {
    return 'The form is empty.';
  }

  return items
    .filter(item => !['Section Header', 'Text Input', 'File Upload'].includes(item.type))
    .map((item, index) => {
      let details = '';
      switch (item.type) {
        case 'Multiple Choice':
          details = `(Multiple Choice: ${item.options?.map(opt => `${opt.label}=${opt.value}`).join(', ')})`;
          break;
        case 'Rating Scale':
          details = `(Rating Scale 1-${item.ratingConfig?.max ?? 5})`;
          break;
        case 'Slider':
          details = `(Slider ${item.sliderConfig?.min ?? 0}-${item.sliderConfig?.max ?? 100})`;
          break;
        case 'Matrix Table':
            details = `(Matrix Table: Rows are '${item.matrixConfig?.rows.join(', ')}'. Columns are ${item.matrixConfig?.columns.map(c => `${c.label}=${c.value}`).join(', ')})`;
            break;
      }
      return `${index + 1}. ${item.label} (ID: ${item.variableId}) ${details}`;
    })
    .join('\n');
};


export function AIFormulaSuggester() {
  const t = useTranslations('AIFormulaSuggester');
  const { template } = useFormBuilder();
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<{ suggestedFormula: string; reasoning: string } | null>(null)
  const [formContent, setFormContent] = useState('');
  const { toast } = useToast()

  const handleSuggest = async () => {
    if (!template) return;
    setIsLoading(true)
    setSuggestion(null)
    
    const currentFormContent = formatFormContentForAI(template.items);
    setFormContent(currentFormContent);

    try {
      const result = await suggestScoreFormula(currentFormContent)
      setSuggestion(result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: t('errorDescription'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {t('buttonText')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">{t('formContentTitle')}</h4>
                <pre className="text-xs p-3 bg-secondary rounded-md whitespace-pre-wrap font-mono max-h-40 overflow-auto">
                    {formContent || "Click 'Suggest Formula' to see the content sent to the AI."}
                </pre>
            </CardContent>
          </Card>
          
          {isLoading && (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {suggestion && (
            <div className='space-y-4'>
                 <Card>
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2">{t('suggestedFormulaTitle')}</h4>
                        <pre className="text-xs p-3 bg-secondary rounded-md font-mono">
                            {suggestion.suggestedFormula}
                        </pre>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2">{t('reasoningTitle')}</h4>
                        <p className="text-sm text-muted-foreground">
                            {suggestion.reasoning}
                        </p>
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSuggest} disabled={isLoading || !template} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('thinkingButton')}</> : t('suggestButton')}
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>{t('closeButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
