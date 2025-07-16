'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useFormBuilder } from '@/context/form-builder-context';
import { getNewFormItem, createDefaultTemplate } from '@/components/evaluations/builder/question-types';
import type { FormItem } from '@/components/evaluations/builder/types';
import { BuilderHeader } from '@/components/evaluations/builder/builder-header';
import { FormElementsPanel } from '@/components/evaluations/builder/form-elements-panel';
import { FormCanvas } from '@/components/evaluations/builder/form-canvas';
import { PropertiesPanel } from '@/components/evaluations/builder/properties-panel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MobileFAB } from '@/components/evaluations/builder/mobile-fab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VariablesPanel } from '@/components/evaluations/builder/variables-panel';
import { SortableFormItem } from '@/components/evaluations/builder/sortable-form-item';

function FormBuilderContent({ evaluationId }: { evaluationId: string }) {
    const t = useTranslations('FormBuilderPage');
    const tq = useTranslations('QuestionTypes');
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

    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        if (!template) {
            console.log(`No template found in context, loading default for ID: ${evaluationId}`);
            setTemplate(createDefaultTemplate(t, tq));
        }
    }, [template, setTemplate, evaluationId, t, tq]);

    if (!template) {
        return <div className="text-center p-8">{t('loading')}</div>;
    }

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;
        
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
        const newItems = template.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        setTemplate({ ...template, items: newItems });
        if (selectedQuestion && selectedQuestion.id === id) {
            setSelectedQuestion({ ...selectedQuestion, ...updates });
        }
    };
    
    const addQuestion = (type: string) => {
       const newItem = getNewFormItem(type, t, tq, template.items);
       const newItems = [...template.items, newItem];
       setTemplate({ ...template, items: newItems });
       setSelectedQuestion(newItem);
       setIsElementsSheetOpen(false);
    }

    const deleteQuestion = (id: string) => {
        const newItems = template.items.filter(item => item.id !== id);
        setTemplate({ ...template, items: newItems });
        if (selectedQuestion && selectedQuestion.id === id) {
            setSelectedQuestion(null);
        }
    };
    
    const handleSave = () => {
        console.log("Saving template:", JSON.stringify(template, null, 2));
        alert("Evaluation saved! (Check console for output)");
    }

    const activeItem = activeId ? template.items.find(item => item.id === activeId) : null;

    const renderDesktopLayout = () => (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
            <aside className="col-span-2 border-r overflow-y-auto">
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
                onPropertiesClick={() => setIsPropertiesSheetOpen(true)}
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


export default function FormBuilderPage({ params }: { params: { id: string } }) {
    return (
        <FormBuilderContent evaluationId={params.id} />
    );
}