
'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
        setIsPropertiesSheetOpen
    } = useFormBuilder();

    const [isLoading, setIsLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));
    
     useEffect(() => {
        const loadEvaluation = async () => {
            setIsLoading(true);
            try {
                let loadedTemplate;
                if (evaluationId.startsWith('new_')) {
                    const storedTemplate = sessionStorage.getItem('new_evaluation_template');
                    if (storedTemplate) {
                        loadedTemplate = JSON.parse(storedTemplate);
                        sessionStorage.removeItem('new_evaluation_template');
                    } else {
                        loadedTemplate = createDefaultTemplate(t, tq);
                    }
                } else {
                    const existingEvaluation = await backend().getEvaluationById(evaluationId);
                    if (existingEvaluation) {
                        loadedTemplate = existingEvaluation;
                    } else {
                        console.error(`Evaluation with id ${evaluationId} not found.`);
                        router.push('/evaluations');
                        return;
                    }
                }
                setTemplate(loadedTemplate);
            } catch (error) {
                console.error("Failed to load evaluation:", error);
                router.push('/evaluations');
            } finally {
                setIsLoading(false);
            }
        };

        if (evaluationId) {
            loadEvaluation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evaluationId, setTemplate]); 


    useEffect(() => {
      if(template && !selectedQuestion && template.items.length > 0) {
        const firstEditableQuestion = template.items.find(item => !item.readOnly);
        if (firstEditableQuestion) {
            setSelectedQuestion(firstEditableQuestion);
        }
      }
    }, [template, selectedQuestion, setSelectedQuestion]);

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
        const newTemplate = { ...template, items: newItems };
        setTemplate(newTemplate);

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

        if (template.id !== savedEvaluation.id) {
            router.replace(`/evaluations/${savedEvaluation.id}/build`);
        }
    }

    if (isLoading || !template) {
       return (
            <div className="flex flex-col h-full">
                 <header className="flex-shrink-0 p-3 md:p-4 border-b bg-card">
                    <div className='flex flex-col gap-4'>
                        <div className="min-w-0 flex-1 space-y-2">
                             <Skeleton className="h-7 w-1/2" />
                             <Skeleton className="h-5 w-3/4" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                 </header>
                 <div className="p-8 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    const activeItem = activeId ? template.items.find(item => item.id === activeId) : null;

    const renderDesktopLayout = () => (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
            <aside className="col-span-2 border-r flex flex-col">
                <Tabs defaultValue="elements" className="flex-1 flex flex-col overflow-y-hidden">
                    <div className="p-2 shrink-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="elements">{t('formElements')}</TabsTrigger>
                            <TabsTrigger value="variables">Variables</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="elements" className="flex-1 overflow-y-auto p-4">
                       <FormElementsPanel />
                    </TabsContent>
                    <TabsContent value="variables" className="flex-1 overflow-y-auto p-4">
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
                <SheetContent className="p-0 flex flex-col">
                    <SheetHeader className="p-6 pb-2 shrink-0">
                        <SheetTitle>{t('formElements')}</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto p-4">
                       <FormElementsPanel onAddItem={addQuestion} />
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet open={isPropertiesSheetOpen} onOpenChange={setIsPropertiesSheetOpen}>
                <SheetContent className="flex flex-col">
                    <SheetHeader className="shrink-0 p-6 pb-2">
                        <SheetTitle>{t('properties')}</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto flex-1">
                       <PropertiesPanel
                          selectedQuestion={selectedQuestion}
                          onUpdateQuestion={updateQuestion}
                       />
                    </div>
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
                        {tq(activeId.replace('palette-', '') as any)}
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
