
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

export default function NewEvaluationPage() {
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description is empty',
        description: 'Please describe the evaluation you want to create.',
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await generateEvaluationTemplate(description)

      // Store the generated template in localStorage to pass it to the builder page
      localStorage.setItem('generatedTemplate', result.template);
      
      toast({
        title: 'Template Generated!',
        description: 'Your new evaluation is ready for editing.',
      })

      const newEvaluationId = Date.now()
      router.push(`/evaluations/${newEvaluationId}/build`)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the evaluation template. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Evaluation</CardTitle>
          <CardDescription>
            Describe the evaluation you want to build, and our AI will generate a starting template for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Label htmlFor="description" className="font-semibold">Evaluation Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., 'A quarterly performance review for software engineers, including sections on coding skills, teamwork, and project management...'"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Be as detailed as possible for the best results.
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
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

    