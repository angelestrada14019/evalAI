
'use client'

import React, { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useTranslations } from 'next-intl'
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
  
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isElementsSheetOpen, setIsElementsSheetOpen] = useState(false);
  const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }
  ));

  useEffect(() => {
    const storedTemplate = localStorage.getItem('generatedTemplate');
    if (storedTemplate) {
      try {
        const parsedTemplate = JSON.parse(storedTemplate);
        setTemplate(parsedTemplate);
        if (parsedTemplate.items && parsedTemplate.items.length > 0) {
          if (isLargeScreen) {
            setSelectedQuestion(parsedTemplate.items[0]);
          }
        }
      } catch (error) {
        console.error("Failed to parse template from localStorage", error);
        setTemplate({ title: "Error Loading Template", description: "Could not load the evaluation template.", items: [] });
      }
    } else {
      setTemplate({ title: "New Evaluation", description: "Start building your form.", items: [] });
    }
  }, [isLargeScreen]);

  useEffect(() => {
    if(!isLargeScreen) {
        setSelectedQuestion(null);
    } else {
      if (template && template.items.length > 0 && !selectedQuestion) {
        setSelectedQuestion(template.items[0]);
      }
    }
  }, [isLargeScreen, template, selectedQuestion]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    
    if (!isLargeScreen && id.startsWith('palette-')) {
      setIsElementsSheetOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !template) return;

    const isDroppingFromPalette = active.id.toString().startsWith('palette-');
    const isDroppingOnCanvas = over.id === 'canvas-droppable';
    const isDroppingOnItem = template.items.some(item => item.id === over.id);

    if (isDroppingFromPalette && (isDroppingOnCanvas || isDroppingOnItem)) {
      const type = active.id.toString().replace('palette-', '');
      const newItem = getNewFormItem(type, t, tq);
      
      let newIndex = template.items.length;
      if (isDroppingOnItem) {
        const overIndex = template.items.findIndex(item => item.id === over.id);
        newIndex = overIndex + 1;
      }
      
      const updatedItems = [
        ...template.items.slice(0, newIndex),
        newItem,
        ...template.items.slice(newIndex)
      ];

      setTemplate({ ...template, items: updatedItems });
      handleSelectQuestion(newItem);
      return;
    }

    if (!isDroppingFromPalette && active.id !== over.id) {
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
    if (!isLargeScreen) {
      setIsPropertiesSheetOpen(true);
    }
  }

  if (!template) {
    return <div className="flex h-screen w-full items-center justify-center">{t('loading')}</div>;
  }
  
  const activePaletteItem = activeId && activeId.startsWith('palette-') ? questionTypes.find(q => `palette-${q.type}` === activeId) : null;
  const activeFormItem = activeId && !activeId.startsWith('palette-') ? template.items.find(i => i.id === activeId) : null;

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col">
          <BuilderHeader title={template.title} description={template.description} />
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
            
            {isLargeScreen && (
              <aside className="lg:col-span-2 bg-card border-r">
                <FormElementsPanel />
              </aside>
            )}

            <main className="lg:col-span-7 py-4 md:py-8">
              <FormCanvas 
                items={template.items}
                selectedQuestionId={selectedQuestion?.id}
                onSelectQuestion={handleSelectQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            </main>
            
            {isLargeScreen && (
              <aside className="lg:col-span-3 bg-card border-l min-h-screen">
                <PropertiesPanel 
                  selectedQuestion={selectedQuestion}
                  onUpdateQuestion={updateQuestion}
                />
              </aside>
            )}
          </div>
        </div>

        <DragOverlay>
            {activePaletteItem ? (
                <Button variant="default" className="w-full justify-start cursor-grabbing shadow-lg">
                <activePaletteItem.icon className="mr-2 h-4 w-4" />
                {tq(activePaletteItem.type as any)}
                </Button>
            ) : activeFormItem ? (
                <div className="p-4 rounded-md shadow-xl opacity-90 bg-card">
                    <p>{activeFormItem.label}</p>
                </div>
            ): null}
        </DragOverlay>
      </DndContext>
      
      {!isLargeScreen && (
        <>
          <MobileFAB 
            onElementsClick={() => setIsElementsSheetOpen(true)}
            onPropertiesClick={() => {
              if(selectedQuestion) {
                setIsPropertiesSheetOpen(true);
              }
            }}
          />

          <Sheet open={isElementsSheetOpen} onOpenChange={setIsElementsSheetOpen}>
            <SheetContent side="left" className="p-0 w-[85vw] max-w-sm flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>{t('formElements')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <FormElementsPanel />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isPropertiesSheetOpen} onOpenChange={setIsPropertiesSheetOpen}>
            <SheetContent side="right" className="p-0 w-[85vw] max-w-sm flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>{t('properties')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <PropertiesPanel 
                  selectedQuestion={selectedQuestion}
                  onUpdateQuestion={updateQuestion}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  )
}
