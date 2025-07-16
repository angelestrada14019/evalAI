'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useFormBuilder } from '@/context/form-builder-context';
import { getNewFormItem, createDefaultTemplate } from '@/components/evaluations/builder/question-types';
import type { FormItem, FormTemplate } from '@/components/evaluations/builder/types';
import { BuilderHeader } from '@/components/evaluations/builder/builder-header';
import { FormElementsPanel } from '@/components/evaluations/builder/form-elements-panel';
import { FormCanvas } from '@/components/evaluations/builder/form-canvas';
import { PropertiesPanel } from '@/components/evaluations/builder/properties-panel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MobileFAB } from '@/components/evaluations/builder/mobile-fab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VariablesPanel } from '@/components/evaluations/builder/variables-panel';
import { SortableFormItem } from '@/components/evaluations/builder/sortable-form-item';
import { backend } from '@/services/backend/backend';
import { Skeleton } from '@/components/ui/skeleton';

export function FormBuilderContent({ evaluationId }: { evaluationId: string }) {
    const t = useTranslations('FormBuilderPage');
    const tq = useTranslations('QuestionTypes');
    const router = useRouter();
    const { 
        template, 
        setTemplate, 
        selectedQuestion, 
        setSelectedQuestion,
        isLargeScreen,
        isElementsSheetOpen,
        setIsElementsSheetOpen,
        isPropertiesSheetOpen,
        setIsPropertiesSheetOpen,
        isContextLoading,
        setIsContextLoading,
    } = useFormBuilder();
    
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        const loadEvaluation = async () => {
            setIsContextLoading(true);
            const isNewEvaluation = evaluationId.startsWith('new_');

            if (!isNewEvaluation) {
                try {
                    const existingEvaluation = await backend().getEvaluationById(evaluationId);
                    if (existingEvaluation) {
                        setTemplate(existingEvaluation);
                    } else {
                        router.push('/evaluations');
                    }
                } catch (error) {
                    console.error("Failed to load evaluation:", error);
                    router.push('/evaluations');
                }
            } else if (isNewEvaluation && !template) {
                 setTemplate(createDefaultTemplate(t, tq));
            }
            setIsContextLoading(false);
        };

        loadEvaluation();
    }, [evaluationId, setTemplate, setIsContextLoading, router, t, tq, template]);

    useEffect(() => {
      if(template && !selectedQuestion && template.items.length > 0) {
        // Automatically select the first non-readonly question if available
        const firstEditableQuestion = template.items.find(item => !item.readOnly);
        setSelectedQuestion(firstEditableQuestion || template.items[0]);
      }
    }, [template, selectedQuestion, setSelectedQuestion]);

    if (isContextLoading || !template) {
        return (
            <div className="flex flex-col h-full">
                 <header className="flex-shrink-0 p-3 md:p-4 border-b bg-card">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <Skeleton className="h-10 w-1/3" />
                         <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                 </header>
                 <div className="p-8 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full mt-4" />
                </div>
            </div>
        );
    }

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || !template) return;
        
        if (active.id.startsWith('palette-')) {
            const type = active.id.replace('palette-', '');
            const newItem = getNewFormItem(type, t, tq, template.items);
            const newItems = [...template.items, newItem];
            setTemplate({ ...template, items: newItems });
            setSelectedQuestion(newItem);
            return;
        }

        if (active.id !== over.id) {
            const oldIndex = template.items.findIndex(item => item.id === active.id);
            const newIndex = template.items.findIndex(item => item.id === over.id);
            const newItems = arrayMove(template.items, oldIndex, newIndex);
            setTemplate({ ...template, items: newItems });
        }
    };

    const updateQuestion = (id: string, updates: Partial<FormItem>) => {
        if (!template) return;
        const newItems = template.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        setTemplate({ ...template, items: newItems });
        if (selectedQuestion && selectedQuestion.id === id) {
            setSelectedQuestion({ ...selectedQuestion, ...updates });
        }
    };
    
    const addQuestion = (type: string) => {
       if (!template) return;
       const newItem = getNewFormItem(type, t, tq, template.items);
       const newItems = [...template.items, newItem];
       setTemplate({ ...template, items: newItems });
       setSelectedQuestion(newItem);
       setIsElementsSheetOpen(false);
    }

    const deleteQuestion = (id: string) => {
        if (!template) return;
        const newItems = template.items.filter(item => item.id !== id);
        
        if (selectedQuestion && selectedQuestion.id === id) {
            const deletedIndex = template.items.findIndex(item => item.id === id);
            const newSelection = newItems[deletedIndex] || newItems[deletedIndex - 1] || null;
            setSelectedQuestion(newSelection);
        }
        setTemplate({ ...template, items: newItems });
    };
    
    const handleSave = async () => {
        if (!template) return;
        
        const savedEvaluation = await backend().saveEvaluation(template);
        
        setTemplate(savedEvaluation);

        alert(`Evaluation "${savedEvaluation.title}" saved!`);

        if (evaluationId !== savedEvaluation.id) {
            router.replace(`/evaluations/${savedEvaluation.id}/build`);
        }
    }

    const activeItem = activeId && template ? template.items.find(item => item.id === activeId) : null;

    const renderDesktopLayout = () => (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
            <aside className="col-span-2 border-r">
                 <Tabs defaultValue="elements" className="h-full flex flex-col">
                    <TabsList className="m-4">
                        <TabsTrigger value="elements" className="flex-1">{t('formElements')}</TabsTrigger>
                        <TabsTrigger value="variables" className="flex-1">Variables</TabsTrigger>
                    </TabsList>
                    <TabsContent value="elements" className="flex-1 overflow-y-auto">
                       <FormElementsPanel />
                    </TabsContent>
                    <TabsContent value="variables" className="flex-1 overflow-y-auto">
                        <VariablesPanel items={template.items} />
                    </TabsContent>
                </Tabs>
            </aside>
            <main className="col-span-7 p-4 md:p-8 overflow-y-auto">
                <FormCanvas
                    items={template.items}
                    selectedQuestionId={selectedQuestion?.id}
                    onSelectQuestion={setSelectedQuestion}
                    onDeleteQuestion={deleteQuestion}
                />
            </main>
            <aside className="col-span-3 border-l overflow-y-auto">
                <PropertiesPanel
                    selectedQuestion={selectedQuestion}
                    onUpdateQuestion={updateQuestion}
                />
            </aside>
        </div>
    );
    
    const renderMobileLayout = () => (
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <FormCanvas
                items={template.items}
                selectedQuestionId={selectedQuestion?.id}
                onSelectQuestion={(item) => {
                    setSelectedQuestion(item)
                    setIsPropertiesSheetOpen(true)
                }}
                onDeleteQuestion={deleteQuestion}
            />
            <MobileFAB 
                onElementsClick={() => setIsElementsSheetOpen(true)}
                onPropertiesClick={() => {
                  if (selectedQuestion) {
                    setIsPropertiesSheetOpen(true)
                  } else {
                    alert('Please select a question first.')
                  }
                }}
            />
            <Sheet open={isElementsSheetOpen} onOpenChange={setIsElementsSheetOpen}>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>{t('formElements')}</SheetTitle>
                    </SheetHeader>
                     <FormElementsPanel onAddItem={addQuestion} />
                </SheetContent>
            </Sheet>
            <Sheet open={isPropertiesSheetOpen} onOpenChange={setIsPropertiesSheetOpen}>
                <SheetContent side="right">
                     <PropertiesPanel
                        selectedQuestion={selectedQuestion}
                        onUpdateQuestion={updateQuestion}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="h-full flex flex-col bg-background">
                <BuilderHeader onSave={handleSave} />
                {isLargeScreen ? renderDesktopLayout() : renderMobileLayout()}
            </div>
             <DragOverlay>
                {activeId && activeId.startsWith('palette-') ? (
                    <div className="p-2 bg-primary text-primary-foreground rounded-md shadow-lg">
                        {t('newQuestionLabel', { type: tq(activeId.replace('palette-', '') as any) })}
                    </div>
                ) : activeItem ? (
                     <div className="opacity-75">
                         <SortableFormItem 
                             item={activeItem} 
                             index={0} 
                             selected={false} 
                             onSelect={() => {}} 
                             onDelete={() => {}}
                         />
                     </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
