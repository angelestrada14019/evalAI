

'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Eye, GripVertical, Save, Settings, Trash2, ListChecks, Pilcrow, SlidersHorizontal, Star, Image as ImageIcon, Table, Upload } from "lucide-react"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"

const iconMap: { [key: string]: React.ElementType } = {
    "Multiple Choice": ListChecks,
    "Text Input": Pilcrow,
    "Slider": SlidersHorizontal,
    "Rating Scale": Star,
    "Image Choice": ImageIcon,
    "Matrix Table": Table,
    "File Upload": Upload,
}

const questionTypes = [
    { name: "Multiple Choice" },
    { name: "Text Input" },
    { name: "Slider" },
    { name: "Rating Scale" },
    { name: "Image Choice" },
    { name: "Matrix Table" },
    { name: "File Upload" },
]

interface FormItem {
  id: string;
  type: string;
  label: string;
  options?: string[];
  required: boolean;
}

interface FormTemplate {
  title: string;
  description: string;
  items: FormItem[];
}


export default function FormBuilderPage({ params }: { params: { id: string }}) {
    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<FormItem | null>(null);

    useEffect(() => {
        const storedTemplate = localStorage.getItem('generatedTemplate');
        if (storedTemplate) {
            try {
                const parsedTemplate = JSON.parse(storedTemplate);
                setTemplate(parsedTemplate);
                if (parsedTemplate.items && parsedTemplate.items.length > 0) {
                    setSelectedQuestion(parsedTemplate.items[0]);
                }
                // localStorage.removeItem('generatedTemplate'); // Clean up after loading
            } catch (error) {
                console.error("Failed to parse template from localStorage", error);
                setTemplate({ title: "Error Loading Template", description: "Could not load the evaluation template.", items: [] });
            }
        } else {
             setTemplate({ title: "New Evaluation", description: "Start building your form.", items: [] });
        }
    }, []);

    const renderQuestion = (question: FormItem, index: number) => {
        return (
            <Card 
                key={question.id} 
                className={`p-4 ${selectedQuestion?.id === question.id ? 'border-2 border-primary shadow-lg' : ''}`}
                onClick={() => setSelectedQuestion(question)}
            >
                <div className="flex items-start gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{index + 1}. {question.type}</p>
                        <p className="font-semibold">{question.label}</p>
                        {question.type === 'Multiple Choice' && question.options && (
                             <div className="space-y-2 mt-2 text-sm">
                                {question.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>{opt}</span></div>
                                ))}
                            </div>
                        )}
                        {question.type === 'Text Input' && (
                             <Textarea placeholder="User will type their answer here..." className="mt-2" disabled />
                        )}
                        {question.type === 'Slider' && (
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-sm text-muted-foreground">Min</span>
                                <div className="w-full h-2 bg-secondary rounded-full" />
                                <span className="text-sm text-muted-foreground">Max</span>
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
            </Card>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <div>
                    <h1 className="text-xl font-bold">{template?.title || "Loading..."}</h1>
                    <p className="text-sm text-muted-foreground">{template?.description || "Please wait"}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <AIFormulaSuggester />
                    <Button>
                        <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Question Palette */}
                <aside className="md:col-span-2 border-r p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
                    <div className="space-y-2">
                        {questionTypes.map((q) => {
                            const Icon = iconMap[q.name] || Pilcrow;
                            return (
                                <Button key={q.name} variant="ghost" className="w-full justify-start">
                                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {q.name}
                                </Button>
                            )
                        })}
                    </div>
                </aside>

                {/* Form Canvas */}
                <main className="md:col-span-7 p-8 overflow-y-auto">
                    <div className="space-y-6">
                        {template?.items.map((item, index) => renderQuestion(item, index))}
                        {(!template || template.items.length === 0) && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No questions yet.</p>
                                <p className="text-sm">Drag elements from the left panel to start building.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Properties Panel */}
                <aside className="md:col-span-3 border-l p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-4">Properties</h2>
                    {selectedQuestion ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{selectedQuestion.type}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-text">Question Text</Label>
                                    <Input id="question-text" value={selectedQuestion.label} onChange={(e) => setSelectedQuestion({...selectedQuestion, label: e.target.value})} />
                                </div>
                                {selectedQuestion.type === 'Multiple Choice' && (
                                    <div className="space-y-2">
                                        <Label>Options</Label>
                                        {selectedQuestion.options?.map((opt, i) => (
                                            <Input key={i} value={opt} />
                                        ))}
                                        <Button variant="outline" size="sm" className="w-full">Add Option</Button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="required-switch">Required</Label>
                                    <Switch id="required-switch" checked={selectedQuestion.required} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="text-center py-12 text-muted-foreground">
                            <p>Select a question to see its properties.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}
