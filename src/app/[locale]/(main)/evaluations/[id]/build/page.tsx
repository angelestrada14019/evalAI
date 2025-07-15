
'use client'

import React, { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Eye, GripVertical, Save, Trash2, ListChecks, Pilcrow, SlidersHorizontal, Star, Image as ImageIcon, Table, Upload, PlusCircle } from "lucide-react"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
  { type: "Multiple Choice", icon: ListChecks },
  { type: "Text Input", icon: Pilcrow },
  { type: "Slider", icon: SlidersHorizontal },
  { type: "Rating Scale", icon: Star },
  { type: "Image Choice", icon: ImageIcon },
  { type: "Matrix Table", icon: Table },
  { type: "File Upload", icon: Upload },
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

function DraggablePaletteItem({ type, icon: Icon }: { type: string, icon: React.ElementType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: `palette-${type}` });
  const t = useTranslations('QuestionTypes');

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <Button variant="ghost" className={cn("w-full justify-start cursor-grab", isDragging && "opacity-50")}>
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        {t(type as any)}
      </Button>
    </div>
  )
}

function SortableFormItem({ item, index, selected, onSelect, onDelete }: { item: FormItem, index: number, selected: boolean, onSelect: () => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const t = useTranslations('QuestionTypes');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return <Card ref={setNodeRef} style={style} className="p-4 h-32 bg-primary/10 border-primary border-dashed" />;
  }
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("p-4 transition-shadow", selected ? 'border-2 border-primary shadow-lg' : 'hover:shadow-md')}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="cursor-grab touch-none">
          <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{index + 1}. {t(item.type as any)}</p>
          <p className="font-semibold">{item.label}</p>
          {item.type === 'Multiple Choice' && item.options && (
            <div className="space-y-2 mt-2 text-sm">
              {item.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>{opt}</span></div>
              ))}
            </div>
          )}
          {item.type === 'Text Input' && (
            <Textarea placeholder="User will type their answer here..." className="mt-2" disabled />
          )}
          {item.type === 'Slider' && (
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-muted-foreground">Min</span>
              <div className="w-full h-2 bg-secondary rounded-full" />
              <span className="text-sm text-muted-foreground">Max</span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
      </div>
    </Card>
  )
}


export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<FormItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const t = useTranslations('FormBuilderPage');
  const tq = useTranslations('QuestionTypes');

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const storedTemplate = localStorage.getItem('generatedTemplate');
    if (storedTemplate) {
      try {
        const parsedTemplate = JSON.parse(storedTemplate);
        setTemplate(parsedTemplate);
        if (parsedTemplate.items && parsedTemplate.items.length > 0) {
          setSelectedQuestion(parsedTemplate.items[0]);
        }
      } catch (error) {
        console.error("Failed to parse template from localStorage", error);
        setTemplate({ title: "Error Loading Template", description: "Could not load the evaluation template.", items: [] });
      }
    } else {
      setTemplate({ title: "New Evaluation", description: "Start building your form.", items: [] });
    }
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !template) return;

    if (active.id.toString().startsWith('palette-') && over.id === 'canvas-droppable') {
        const type = active.id.toString().replace('palette-', '');
        const newItem: FormItem = {
            id: uuidv4(),
            type: type,
            label: t('newQuestionLabel', { type: tq(type as any) }),
            required: false,
            ...(type === 'Multiple Choice' && { options: ['Option 1', 'Option 2'] })
        };
        const updatedItems = [...template.items, newItem];
        setTemplate({ ...template, items: updatedItems });
        setSelectedQuestion(newItem);
        return;
    }

    if (active.id !== over.id && !active.id.toString().startsWith('palette-')) {
        const oldIndex = template.items.findIndex(item => item.id === active.id);
        const newIndex = template.items.findIndex(item => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            const updatedItems = arrayMove(template.items, oldIndex, newIndex);
            setTemplate({ ...template, items: updatedItems });
        }
    }
  };

  const updateQuestion = (id: string, updates: Partial<FormItem>) => {
    if (!template) return;
    const newItems = template.items.map(item => item.id === id ? { ...item, ...updates } : item);
    setTemplate({ ...template, items: newItems });
    if (selectedQuestion?.id === id) {
        setSelectedQuestion(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addOption = (questionId: string) => {
    if (!template) return;
    const newItems = template.items.map(item => {
        if (item.id === questionId && item.type === 'Multiple Choice') {
            const newOptions = [...(item.options || []), `Option ${(item.options?.length || 0) + 1}`];
            return { ...item, options: newOptions };
        }
        return item;
    });
     setTemplate({ ...template, items: newItems });
     if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(prev => prev ? { ...prev, options: [...(prev.options || []), `Option ${(prev.options?.length || 0) + 1}`] } : null);
    }
  };

  const deleteQuestion = (id: string) => {
    if (!template) return;
    const newItems = template.items.filter(item => item.id !== id);
    setTemplate({ ...template, items: newItems });
    if (selectedQuestion?.id === id) {
        setSelectedQuestion(newItems.length > 0 ? newItems[0] : null);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }
  
  const activePaletteItem = activeId && activeId.startsWith('palette-') ? questionTypes.find(q => `palette-${q.type}` === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div>
            <h1 className="text-xl font-bold">{template.title}</h1>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> {t('preview')}</Button>
            <AIFormulaSuggester />
            <Button><Save className="mr-2 h-4 w-4" /> {t('save')}</Button>
          </div>
        </header>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          <aside className="md:col-span-2 border-r p-4 bg-card">
            <h2 className="text-lg font-semibold mb-4">{t('formElements')}</h2>
            <SortableContext items={questionTypes.map(q => `palette-${q.type}`)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {questionTypes.map((q) => <DraggablePaletteItem key={q.type} type={q.type} icon={q.icon} />)}
                </div>
            </SortableContext>
          </aside>

          <main id="canvas-droppable" className="md:col-span-7 p-8 overflow-y-auto bg-secondary/50">
             <SortableContext items={template.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {template.items.map((item, index) => (
                  <SortableFormItem
                    key={item.id}
                    item={item}
                    index={index}
                    selected={selectedQuestion?.id === item.id}
                    onSelect={() => setSelectedQuestion(item)}
                    onDelete={deleteQuestion}
                  />
                ))}
              </div>
            </SortableContext>
            {template.items.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground">
                <p>{t('noQuestions')}</p>
                 <p className="text-sm">{t('noQuestionsHint')}</p>
              </div>
            )}
          </main>

          <aside className="md:col-span-3 border-l p-4 bg-card overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
            {selectedQuestion ? (
              <Card>
                <CardHeader><CardTitle className="text-base">{tq(selectedQuestion.type as any)}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-text">{t('questionText')}</Label>
                    <Input id="question-text" value={selectedQuestion.label} onChange={(e) => updateQuestion(selectedQuestion.id, { label: e.target.value })} />
                  </div>
                  {selectedQuestion.type === 'Multiple Choice' && (
                    <div className="space-y-2">
                      <Label>{t('options')}</Label>
                      {selectedQuestion.options?.map((opt, i) => (
                        <Input key={i} value={opt} onChange={(e) => updateQuestion(selectedQuestion.id, { options: selectedQuestion.options?.map((o, idx) => idx === i ? e.target.value : o) })} />
                      ))}
                      <Button variant="outline" size="sm" className="w-full" onClick={() => addOption(selectedQuestion.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('addOption')}</Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Label htmlFor="required-switch">{t('required')}</Label>
                    <Switch id="required-switch" checked={selectedQuestion.required} onCheckedChange={(checked) => updateQuestion(selectedQuestion.id, { required: checked })} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('selectQuestion')}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
      <DragOverlay>
        {activePaletteItem ? (
          <Button variant="default" className="w-full justify-start cursor-grabbing shadow-lg">
            <activePaletteItem.icon className="mr-2 h-4 w-4" />
            {tq(activePaletteItem.type as any)}
          </Button>
        ) : activeId && template.items.find(i => i.id === activeId) ? (
            <Card className="p-4 shadow-xl opacity-90">
                 <p>{template.items.find(i => i.id === activeId)?.label}</p>
            </Card>
        ): null}
      </DragOverlay>
    </DndContext>
  )
}
