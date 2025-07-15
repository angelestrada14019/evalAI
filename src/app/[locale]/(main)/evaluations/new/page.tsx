
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { generateEvaluationTemplate } from '@/actions/evaluation-actions'
import { Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NewEvaluationPage() {
  const t = useTranslations('NewEvaluationPage');
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

      localStorage.setItem('generatedTemplate', result.template);
      
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
        <CardFooter>
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
