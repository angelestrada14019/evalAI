
'use client'

import React, { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Eye, GripVertical, Save, Trash2, ListChecks, Pilcrow, SlidersHorizontal, Star, Image as ImageIcon, Table, Upload, PlusCircle, PanelLeft, Settings2, ImagePlus, Heading1, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import { Slider } from '@/components/ui/slider'

const iconMap: { [key: string]: React.ElementType } = {
  "Multiple Choice": ListChecks,
  "Text Input": Pilcrow,
  "Slider": SlidersHorizontal,
  "Section Header": Heading1,
  "Image Choice": ImageIcon,
  "Matrix Table": Table,
  "File Upload": Upload,
}

const questionTypes = [
  { type: "Multiple Choice", icon: ListChecks },
  { type: "Text Input", icon: Pilcrow },
  { type: "Slider", icon: SlidersHorizontal },
  { type: "Section Header", icon: Heading1 },
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
  imageUrl?: string | null;
  sliderConfig?: { min: number; max: number; step: number };
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
  const tq = useTranslations('QuestionTypes');


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return <Card ref={setNodeRef} style={style} className="p-4 h-32 bg-primary/10 border-primary border-dashed" />;
  }

  if (item.type === 'Section Header') {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-4 py-2" onClick={onSelect}>
         <div {...attributes} {...listeners} className="cursor-grab touch-none">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold flex-1">{item.label}</h3>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
      </div>
    )
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
          <p className="text-sm text-muted-foreground">{index + 1}. {tq(item.type as any)}</p>
          <p className="font-semibold">{item.label}</p>
          {item.imageUrl && (
            <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden">
                <Image src={item.imageUrl} alt={item.label} layout="fill" objectFit="cover" data-ai-hint="question element" />
            </div>
          )}
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
              <span className="text-sm text-muted-foreground">{item.sliderConfig?.min ?? 0}</span>
              <Slider 
                defaultValue={[((item.sliderConfig?.max ?? 100) - (item.sliderConfig?.min ?? 0)) / 2]} 
                min={item.sliderConfig?.min ?? 0} 
                max={item.sliderConfig?.max ?? 100}
                step={item.sliderConfig?.step ?? 1}
                className="w-full" 
                disabled 
              />
              <span className="text-sm text-muted-foreground">{item.sliderConfig?.max ?? 100}</span>
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
  const isMobile = useIsMobile();
  const [isElementsSheetOpen, setIsElementsSheetOpen] = useState(false);
  const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);


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
  
  useEffect(() => {
    if (isMobile === false) { // When switching to desktop
      setIsFabOpen(false);
      setIsElementsSheetOpen(false);
      setIsPropertiesSheetOpen(false);
    }
  }, [isMobile]);

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
            imageUrl: null,
            ...(type === 'Multiple Choice' && { options: ['Option 1', 'Option 2'] }),
            ...(type === 'Slider' && { sliderConfig: { min: 0, max: 100, step: 1 } }),
        };
        const updatedItems = [...template.items, newItem];
        setTemplate({ ...template, items: updatedItems });
        setSelectedQuestion(newItem);
        if (isMobile) {
            setIsElementsSheetOpen(false); // Close sheet on mobile after dropping
            setIsPropertiesSheetOpen(true);
        }
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
  
  const deleteOption = (questionId: string, optionIndex: number) => {
    if (!template) return;
    const newItems = template.items.map(item => {
        if (item.id === questionId && item.type === 'Multiple Choice') {
            const newOptions = item.options?.filter((_, i) => i !== optionIndex);
            return { ...item, options: newOptions };
        }
        return item;
    });
    setTemplate({ ...template, items: newItems });
     if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(prev => {
            if (!prev || prev.type !== 'Multiple Choice') return prev;
            const newOptions = prev.options?.filter((_, i) => i !== optionIndex);
            return { ...prev, options: newOptions };
        });
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

  const FormElementsPanel = () => (
    <div className="p-4 bg-card h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">{t('formElements')}</h2>
      <SortableContext items={questionTypes.map(q => `palette-${q.type}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
              {questionTypes.map((q) => <DraggablePaletteItem key={q.type} type={q.type} icon={q.icon} />)}
          </div>
      </SortableContext>
    </div>
  );

  const PropertiesPanel = () => (
      <div className="p-4 bg-card h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
        {selectedQuestion ? (
          <Card>
            <CardHeader><CardTitle className="text-base">{tq(selectedQuestion.type as any)}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">{selectedQuestion.type === 'Section Header' ? 'Section Title' : t('questionText')}</Label>
                <Textarea id="question-text" value={selectedQuestion.label} onChange={(e) => updateQuestion(selectedQuestion.id, { label: e.target.value })} />
              </div>
              {selectedQuestion.type !== 'Section Header' && (
                <>
                  <div className="space-y-2">
                      <Label>Image</Label>
                       <Button variant="outline" size="sm" className="w-full" onClick={() => updateQuestion(selectedQuestion.id, {imageUrl: `https://placehold.co/600x400.png?text=${selectedQuestion.id.substring(0,4)}` })}>
                          <ImagePlus className="mr-2 h-4 w-4" /> Add/Change Image
                      </Button>
                      {selectedQuestion.imageUrl && (
                          <Button variant="link" size="sm" className="w-full text-destructive" onClick={() => updateQuestion(selectedQuestion.id, {imageUrl: null})}>
                              Remove Image
                          </Button>
                      )}
                  </div>
                  {selectedQuestion.type === 'Multiple Choice' && (
                    <div className="space-y-2">
                      <Label>{t('options')}</Label>
                      {selectedQuestion.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input value={opt} onChange={(e) => updateQuestion(selectedQuestion.id, { options: selectedQuestion.options?.map((o, idx) => idx === i ? e.target.value : o) })} />
                            <Button variant="ghost" size="icon" onClick={() => deleteOption(selectedQuestion.id, i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" onClick={() => addOption(selectedQuestion.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('addOption')}</Button>
                    </div>
                  )}
                  {selectedQuestion.type === 'Slider' && (
                    <div className="space-y-4">
                      <Label>Slider Configuration</Label>
                      <div className='flex items-center gap-2'>
                        <div className='flex-1 space-y-1'>
                          <Label htmlFor="slider-min" className='text-xs'>Min</Label>
                          <Input id="slider-min" type="number" value={selectedQuestion.sliderConfig?.min} onChange={(e) => updateQuestion(selectedQuestion.id, { sliderConfig: { ...selectedQuestion.sliderConfig!, min: Number(e.target.value) } })} />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <Label htmlFor="slider-max" className='text-xs'>Max</Label>
                          <Input id="slider-max" type="number" value={selectedQuestion.sliderConfig?.max} onChange={(e) => updateQuestion(selectedQuestion.id, { sliderConfig: { ...selectedQuestion.sliderConfig!, max: Number(e.target.value) } })} />
                        </div>
                         <div className='flex-1 space-y-1'>
                          <Label htmlFor="slider-step" className='text-xs'>Step</Label>
                          <Input id="slider-step" type="number" value={selectedQuestion.sliderConfig?.step} onChange={(e) => updateQuestion(selectedQuestion.id, { sliderConfig: { ...selectedQuestion.sliderConfig!, step: Number(e.target.value) } })} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Label htmlFor="required-switch">{t('required')}</Label>
                    <Switch id="required-switch" checked={selectedQuestion.required} onCheckedChange={(checked) => updateQuestion(selectedQuestion.id, { required: checked })} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('selectQuestion')}</p>
          </div>
        )}
      </div>
  );

  if (!template) {
    return <div className="flex h-full w-full items-center justify-center">{t('loading')}</div>;
  }
  
  const activePaletteItem = activeId && activeId.startsWith('palette-') ? questionTypes.find(q => `palette-${q.type}` === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-muted/20">
        <header className="flex-shrink-0 p-3 md:p-4 border-b bg-card">
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-bold truncate">{template.title}</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{template.description}</p>
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

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Panel de Elementos (Desktop) */}
          <div className="hidden lg:block lg:col-span-2 bg-card border-r">
            <FormElementsPanel />
          </div>

          {/* Lienzo Principal */}
          <main id="canvas-droppable" className="lg:col-span-7 py-4 md:py-8 overflow-y-auto">
             <SortableContext items={template.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6 max-w-3xl mx-auto px-4">
                {template.items.map((item, index) => (
                  <SortableFormItem
                    key={item.id}
                    item={item}
                    index={index}
                    selected={selectedQuestion?.id === item.id}
                    onSelect={() => {
                      setSelectedQuestion(item);
                      if (isMobile) setIsPropertiesSheetOpen(true);
                    }}
                    onDelete={deleteQuestion}
                  />
                ))}
              </div>
            </SortableContext>
            {template.items.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground max-w-3xl mx-auto">
                <p>{t('noQuestions')}</p>
                 <p className="text-sm">{t('noQuestionsHint')}</p>
              </div>
            )}
          </main>
          
          {/* Panel de Propiedades (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 bg-card border-l">
            <PropertiesPanel />
          </div>
        </div>

        {/* FAB y Paneles deslizables (Mobile) */}
        {isMobile && (
            <div className="fixed bottom-6 right-6 z-50">
                 <div className="relative flex flex-col-reverse items-center gap-2">
                    {/* Botones de acción del FAB */}
                    <div className={cn(
                        "transition-all duration-300 ease-in-out flex flex-col-reverse items-center gap-2",
                        isFabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    )}>
                        {/* Botón de Propiedades */}
                        <Button variant="default" size="icon" className="shadow-lg rounded-full h-12 w-12" onClick={() => { setIsPropertiesSheetOpen(true); setIsFabOpen(false); }}>
                            <Settings2 className="h-6 w-6" />
                            <span className="sr-only">{t('properties')}</span>
                        </Button>
                        {/* Botón de Elementos */}
                         <Button variant="default" size="icon" className="shadow-lg rounded-full h-12 w-12" onClick={() => { setIsElementsSheetOpen(true); setIsFabOpen(false); }}>
                            <PanelLeft className="h-6 w-6" />
                            <span className="sr-only">{t('formElements')}</span>
                        </Button>
                    </div>

                    {/* Botón principal del FAB */}
                    <Button 
                        variant="default" 
                        size="icon" 
                        className="shadow-lg rounded-full h-16 w-16 z-10"
                        onClick={() => setIsFabOpen(prev => !prev)}
                    >
                        {isFabOpen ? <X className="h-7 w-7" /> : <PlusCircle className="h-7 w-7" />}
                    </Button>
                </div>

                {/* Sheet de Elementos */}
                 <Sheet open={isElementsSheetOpen} onOpenChange={setIsElementsSheetOpen}>
                    <SheetContent side="left" className="p-0 w-[85vw] max-w-sm">
                      <SheetHeader className="p-4 border-b">
                        <SheetTitle className="sr-only">{t('formElements')}</SheetTitle>
                      </SheetHeader>
                      <FormElementsPanel />
                    </SheetContent>
                </Sheet>
                {/* Sheet de Propiedades */}
                 <Sheet open={isPropertiesSheetOpen} onOpenChange={setIsPropertiesSheetOpen}>
                    <SheetContent side="right" className="p-0 w-[85vw] max-w-sm">
                      <SheetHeader className="p-4 border-b">
                        <SheetTitle className="sr-only">{t('properties')}</SheetTitle>
                      </SheetHeader>
                      <PropertiesPanel />
                    </SheetContent>
                </Sheet>
            </div>
        )}
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
