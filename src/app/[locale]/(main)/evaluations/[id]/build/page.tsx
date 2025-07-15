
'use client'

import React, { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import type { FormItem, FormTemplate } from '@/components/evaluations/builder/types'
import { BuilderHeader } from '@/components/evaluations/builder/builder-header'
import { FormElementsPanel } from '@/components/evaluations/builder/form-elements-panel'
import { PropertiesPanel } from '@/components/evaluations/builder/properties-panel'
import { FormCanvas } from '@/components/evaluations/builder/form-canvas'
import { MobileFAB } from '@/components/evaluations/builder/mobile-fab'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getNewFormItem, questionTypes } from '@/components/evaluations/builder/question-types'
import { Button } from '@/components/ui/button'


export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<FormItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const t = useTranslations('FormBuilderPage');
  const tq = useTranslations('QuestionTypes');
  
  const isMobile = useIsMobile();
  const [isElementsSheetOpen, setIsElementsSheetOpen] = useState(false);
  const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);

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

    // Dropping a new element from the palette onto the canvas
    if (active.id.toString().startsWith('palette-') && over.id === 'canvas-droppable') {
        const type = active.id.toString().replace('palette-', '');
        const newItem = getNewFormItem(type, t, tq);
        
        const updatedItems = [...template.items, newItem];
        setTemplate({ ...template, items: updatedItems });
        setSelectedQuestion(newItem);

        if (isMobile) {
            setIsElementsSheetOpen(false);
            setIsPropertiesSheetOpen(true);
        }
        return;
    }

    // Reordering existing items on the canvas
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

  const deleteQuestion = (id: string) => {
    if (!template) return;
    const newItems = template.items.filter(item => item.id !== id);
    setTemplate({ ...template, items: newItems });
    if (selectedQuestion?.id === id) {
        setSelectedQuestion(newItems.length > 0 ? newItems[Math.max(0, newItems.findIndex(item => item.id === id) -1)] : null);
    }
  };
  
  const handleSelectQuestion = (item: FormItem) => {
    setSelectedQuestion(item);
    if (isMobile) {
      setIsPropertiesSheetOpen(true);
    }
  }

  if (!template) {
    return <div className="flex h-screen w-full items-center justify-center">{t('loading')}</div>;
  }
  
  const activePaletteItem = activeId && activeId.startsWith('palette-') ? questionTypes.find(q => `palette-${q.type}` === activeId) : null;

  return (
    <div className='h-screen flex flex-col bg-muted/20'>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <BuilderHeader title={template.title} description={template.description} />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Form Elements Panel (Desktop) */}
          <aside className="hidden lg:block lg:col-span-2 bg-card border-r">
            <FormElementsPanel />
          </aside>

          {/* Form Canvas */}
          <main id="canvas-droppable" className="lg:col-span-7 py-4 md:py-8 overflow-y-auto">
            <FormCanvas 
              items={template.items}
              selectedQuestionId={selectedQuestion?.id}
              onSelectQuestion={handleSelectQuestion}
              onDeleteQuestion={deleteQuestion}
            />
          </main>
          
          {/* Properties Panel (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 bg-card border-l">
            <PropertiesPanel 
              selectedQuestion={selectedQuestion}
              onUpdateQuestion={updateQuestion}
            />
          </aside>
        </div>

        <DragOverlay>
          {activePaletteItem ? (
            <Button variant="default" className="w-full justify-start cursor-grabbing shadow-lg">
              <activePaletteItem.icon className="mr-2 h-4 w-4" />
              {tq(activePaletteItem.type as any)}
            </Button>
          ) : activeId && template.items.find(i => i.id === activeId) ? (
              <div className="p-4 rounded-md shadow-xl opacity-90 bg-card">
                   <p>{template.items.find(i => i.id === activeId)?.label}</p>
              </div>
          ): null}
        </DragOverlay>
      </DndContext>
      
      {/* Mobile UI */}
      {isMobile && (
          <>
            <MobileFAB 
              onElementsClick={() => setIsElementsSheetOpen(true)}
              onPropertiesClick={() => setIsPropertiesSheetOpen(true)}
            />

            <Sheet open={isElementsSheetOpen} onOpenChange={setIsElementsSheetOpen}>
                <SheetContent side="left" className="p-0 w-[85vw] max-w-sm">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>{t('formElements')}</SheetTitle>
                  </SheetHeader>
                  <FormElementsPanel />
                </SheetContent>
            </Sheet>

            <Sheet open={isPropertiesSheetOpen} onOpenChange={setIsPropertiesSheetOpen}>
                <SheetContent side="right" className="p-0 w-[85vw] max-w-sm">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>{t('properties')}</SheetTitle>
                  </SheetHeader>
                   <PropertiesPanel 
                      selectedQuestion={selectedQuestion}
                      onUpdateQuestion={updateQuestion}
                    />
                </SheetContent>
            </Sheet>
          </>
      )}
    </div>
  )
}

    