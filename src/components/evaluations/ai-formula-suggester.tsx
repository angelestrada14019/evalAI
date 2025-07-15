"use client"

import { useState } from 'react'
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

const MOCK_FORM_CONTENT = `
1. How would you rate the code quality on the last project? (Multiple Choice: Excellent=4, Good=3, Average=2, Poor=1)
2. Teamwork and Collaboration (Rating Scale 1-5)
3. Met project deadlines? (Yes/No: Yes=1, No=0)
4. Technical Proficiency Score (Slider 0-100)
`

export function AIFormulaSuggester() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<{ suggestedFormula: string; reasoning: string } | null>(null)
  const { toast } = useToast()

  const handleSuggest = async () => {
    setIsLoading(true)
    setSuggestion(null)
    try {
      const result = await suggestScoreFormula(MOCK_FORM_CONTENT)
      setSuggestion(result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not get an AI suggestion. Please try again.",
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
          AI Scoring Logic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Formula Suggester</DialogTitle>
          <DialogDescription>
            Let AI suggest a scoring formula based on your evaluation form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Form Content for Analysis:</h4>
                <pre className="text-xs p-3 bg-secondary rounded-md whitespace-pre-wrap font-mono">
                    {MOCK_FORM_CONTENT.trim()}
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
                        <h4 className="font-semibold text-sm mb-2">Suggested Formula:</h4>
                        <pre className="text-xs p-3 bg-secondary rounded-md font-mono">
                            {suggestion.suggestedFormula}
                        </pre>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2">Reasoning:</h4>
                        <p className="text-sm text-muted-foreground">
                            {suggestion.reasoning}
                        </p>
                    </CardContent>
                </Card>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSuggest} disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</> : 'Suggest Formula'}
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
