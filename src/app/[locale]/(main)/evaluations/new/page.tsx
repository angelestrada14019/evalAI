'use client'

import React, { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { generateEvaluationTemplate } from '@/actions/evaluation-actions'
import { Wand2, Edit } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createDefaultTemplate } from '@/components/evaluations/builder/question-types'
import type { FormTemplate } from '@/components/evaluations/builder/types'
import { v4 as uuidv4 } from 'uuid'
import { Breadcrumb } from '@/components/layout/breadcrumb'


export default function NewEvaluationPage() {
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('NewEvaluationPage')
  const tFormBuilder = useTranslations('FormBuilderPage');
  const tQuestionTypes = useTranslations('QuestionTypes');
  const tB = useTranslations('Breadcrumbs');


  const breadcrumbItems = [
    { label: tB('home'), href: '/dashboard' },
    { label: tB('evaluations'), href: '/evaluations' },
    { label: tB('new') },
  ];


  const handleCreateManual = () => {
    // The builder page will now create its own default template if it receives a 'new_' ID.
    // We just need to navigate to it.
    const newEvaluationId = `new_${Date.now()}`;
    router.push(`/evaluations/${newEvaluationId}/build`)
  }

  const handleGenerate = async () => {
    console.log("ingresa a generar form con IA con desc: ",description);
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
      console.log("ingresa a generar form con IA");
      const result = await generateEvaluationTemplate(description)
      console.log("result en crear nuevo form", result);
      // The AI-generated template is now complete on its own.
      // We just need to ensure all items and options have unique client-side IDs.
      const processedItems = result.items.map(item => ({
        ...item,
        id: uuidv4(),
        variableId: item.variableId || `var_${uuidv4()}`,
        type: item.type || 'Text Input',
        label: item.label || 'Untitled Question',
        required: item.required ?? false,
        options: item.options?.map(opt => ({
          ...opt, 
          id: uuidv4(),
          label: opt.label || 'Option',
          value: opt.value ?? 0
        })),
        sliderConfig: item.sliderConfig ? {
          min: item.sliderConfig.min ?? 0,
          max: item.sliderConfig.max ?? 100,
          step: item.sliderConfig.step ?? 1
        } : undefined,
        ratingConfig: item.ratingConfig ? {
          max: item.ratingConfig.max ?? 5
        } : undefined,
        matrixConfig: item.matrixConfig ? {
          rows: item.matrixConfig.rows ?? ['Row 1'],
          columns: item.matrixConfig.columns?.map(col => ({
            id: col.id || uuidv4(),
            label: col.label || 'Column',
            value: col.value ?? 0
          })) ?? [{ id: uuidv4(), label: 'Column 1', value: 1 }]
        } : undefined,
        fileUploadConfig: item.fileUploadConfig ? {
          allowedTypes: item.fileUploadConfig.allowedTypes ?? ['pdf', 'doc', 'docx'],
          maxSizeMB: item.fileUploadConfig.maxSizeMB ?? 10
        } : undefined,
      }));
      
      const finalTemplate: FormTemplate = {
        title: result.title || 'Nueva Evaluación',
        description: result.description || 'Evaluación generada por IA',
        ...result,
        items: processedItems,
      }
      
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      })

      // Store the generated template in context for the builder page to pick up.
      console.log('[NewEvaluation] Storing template in context:', finalTemplate);
      // We'll use the context in the form builder instead of sessionStorage
      
      // Navigate to the builder page with a temporary ID and the template will be passed via context
      const newEvaluationId = `new_${Date.now()}`;
      console.log('[NewEvaluation] Navigating to:', `/evaluations/${newEvaluationId}/build`);
      
      // Store in sessionStorage with the specific evaluation ID to avoid conflicts
      sessionStorage.setItem(`new_evaluation_template_${newEvaluationId}`, JSON.stringify(finalTemplate));
      router.push(`/evaluations/${newEvaluationId}/build`);

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

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Breadcrumb items={breadcrumbItems} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
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
            <p className="text-sm text-muted-foreground">{t('detailedResultsHint')}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
           <Button
            onClick={handleCreateManual}
            disabled={isLoading}
            variant="outline"
          >
            <Edit className="mr-2 h-4 w-4" />
            Crear Manualmente
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? t('generatingButton') : t('generateButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
