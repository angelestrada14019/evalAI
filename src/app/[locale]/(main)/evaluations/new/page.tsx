
'use client'

import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { generateEvaluationTemplate } from '@/actions/evaluation-actions'
import { Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createDefaultTemplate } from '@/components/evaluations/builder/question-types'
import type { FormTemplate } from '@/components/evaluations/builder/types'

export default function NewEvaluationPage() {
  const t = useTranslations('NewEvaluationPage');
  const tq = useTranslations('QuestionTypes');
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('errorDescription'),
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await generateEvaluationTemplate(description)

      // Parse the AI-generated template
      const aiTemplate = JSON.parse(result.template) as FormTemplate;

      // Create the default user info fields
      const defaultFields = createDefaultTemplate(t, tq).items;
      
      // Ensure all AI-generated items have unique IDs
      const processedAiItems = aiTemplate.items.map(item => ({
        ...item,
        id: uuidv4(), // Assign a new internal UUID
      }));

      // Combine default fields with processed AI items
      const finalTemplate: FormTemplate = {
        ...aiTemplate,
        items: [...defaultFields, ...processedAiItems],
      };

      localStorage.setItem('generatedTemplate', JSON.stringify(finalTemplate));
      
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      })

      const newEvaluationId = Date.now()
      router.push(`/evaluations/${newEvaluationId}/build`)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: t('failTitle'),
        description: t('failDescription'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateManually = () => {
    const defaultTemplate = createDefaultTemplate(t, tq);
    localStorage.setItem('generatedTemplate', JSON.stringify(defaultTemplate));
    const newEvaluationId = Date.now();
    router.push(`/evaluations/${newEvaluationId}/build`);
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="description" className="font-semibold">{t('evaluationDescriptionLabel')}</Label>
            <Textarea
              id="description"
              placeholder={t('evaluationDescriptionPlaceholder')}
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              {t('detailedResultsHint')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button variant="outline" onClick={handleCreateManually}>
              Crear Manualmente
            </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? t('generatingButton') : t('generateButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
