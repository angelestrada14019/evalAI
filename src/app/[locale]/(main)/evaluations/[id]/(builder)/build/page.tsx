
'use client'

import React from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslations } from 'next-intl'
import { BuilderHeader } from '@/components/evaluations/builder/builder-header'
import { FormElementsPanel } from '@/components/evaluations/builder/form-elements-panel'
import { PropertiesPanel } from '@/components/evaluations/builder/properties-panel'
import { FormCanvas } from '@/components/evaluations/builder/form-canvas'
import { MobileFAB } from '@/components/evaluations/builder/mobile-fab'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getNewFormItem, questionTypes, createDefaultTemplate } from '@/components/evaluations/builder/question-types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VariablesPanel } from '@/components/evaluations/builder/variables-panel'
import { useFormBuilder } from '@/context/form-builder-context'


function FormBuilderContent({ evaluationId }: { evaluationId: string }) {
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

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const t = useTranslations('FormBuilderPage');
  const tq = useTranslations('QuestionTypes');

  React.useEffect(() => {
    if (!template) {
      console.log(`No template found, loading default for ID: ${evaluationId}`);
      setTemplate(createDefaultTemplate(t, tq));
    }
  }, [template, setTemplate, evaluationId, t, tq]);


  const sensors = useSensors(useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }
  ));

  const handleSelectQuestion = (item) => {
    setSelectedQuestion(item);
    if (!isLargeScreen) {
      setIsPropertiesSheetOpen(true);
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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
      const newItem = getNewFormItem(type, t, tq, template.items);
      
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

  const updateQuestion = (id, updates) => {
    if (!template) return;
    const newItems = template.items.map(item => item.id === id ? { ...item, ...updates } : item);
    const newTemplate = { ...template, items: newItems };
    setTemplate(newTemplate);
    if (selectedQuestion?.id === id) {
        setSelectedQuestion(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteQuestion = (id) => {
    if (!template) return;
    const newItems = template.items.filter(item => item.id !== id);
    setTemplate({ ...template, items: newItems });
    if (selectedQuestion?.id === id) {
        setSelectedQuestion(newItems.length > 0 ? newItems[Math.max(0, newItems.findIndex(item => item.id === id) -1)] : null);
    }
  };

  const addItemFromPalette = (type) => {
    if (!template) return;
    const newItem = getNewFormItem(type, t, tq, template.items);
    const updatedItems = [...template.items, newItem];
    setTemplate({ ...template, items: updatedItems });
    setIsElementsSheetOpen(false);

    setTimeout(() => {
        handleSelectQuestion(newItem);
        const element = document.getElementById(newItem.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
  
  const handleSave = () => {
    if (template) {
        console.log("--- SAVING FORM ---");
        console.log(JSON.stringify(template, null, 2));
    }
  }

  if (!template) {
    return <div className="flex w-full min-h-screen items-center justify-center">{t('loading')}</div>;
  }
  
  const activePaletteItem = activeId && activeId.startsWith('palette-') ? questionTypes.find(q => `palette-${q.type}` === activeId) : null;
  const activeFormItem = activeId && !activeId.startsWith('palette-') ? template.items.find(i => i.id === activeId) : null;

  if (isLargeScreen) {
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen">
            <BuilderHeader 
                onSave={handleSave}
            />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                <aside className="lg:col-span-2 bg-card border-r">
                    <Tabs defaultValue="elements" className="h-full flex flex-col">
                        <TabsList className="m-2">
                            <TabsTrigger value="elements">Elements</TabsTrigger>
                            <TabsTrigger value="variables">Variables</TabsTrigger>
                        </TabsList>
                        <TabsContent value="elements" className="flex-1 overflow-y-auto">
                            <SortableContext items={questionTypes.map(q => `palette-${q.type}`)} strategy={verticalListSortingStrategy}>
                                <FormElementsPanel />
                            </SortableContext>
                        </TabsContent>
                        <TabsContent value="variables" className="flex-1 overflow-y-auto">
                            <VariablesPanel items={template.items} />
                        </TabsContent>
                    </Tabs>
                </aside>

                <main className="lg:col-span-7 py-4 md:py-8 overflow-y-auto">
                <FormCanvas 
                    items={template.items}
                    selectedQuestionId={selectedQuestion?.id}
                    onSelectQuestion={handleSelectQuestion}
                    onDeleteQuestion={deleteQuestion}
                />
                </main>
                
                <aside className="lg:col-span-3 bg-card border-l overflow-y-auto">
                    <PropertiesPanel 
                    selectedQuestion={selectedQuestion}
                    onUpdateQuestion={updateQuestion}
                    />
                </aside>
            </div>
            </div>

            <DragOverlay>
                {activePaletteItem ? (
                    <Button variant="default" className="w-full justify-start cursor-grabbing shadow-lg">
                    <activePaletteItem.icon className="mr-2 h-4 w-4" />
                    {tq(activePaletteItem.type as any)}
                    </Button>
                ) : activeFormItem ? (
                    <div id={activeFormItem.id} className="p-4 rounded-md shadow-xl opacity-90 bg-card">
                        <p>{activeFormItem.label}</p>
                    </div>
                ): null}
            </DragOverlay>
        </DndContext>
    )
  }

  // Mobile layout
  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-screen">
          <BuilderHeader onSave={handleSave} />
           <main className="lg:col-span-7 py-4 md:py-8 overflow-y-auto flex-1">
              <FormCanvas 
                items={template.items}
                selectedQuestionId={selectedQuestion?.id}
                onSelectQuestion={handleSelectQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            </main>
        </div>
        <DragOverlay>
            {activePaletteItem ? (
                <Button variant="default" className="w-full justify-start cursor-grabbing shadow-lg">
                <activePaletteItem.icon className="mr-2 h-4 w-4" />
                {tq(activePaletteItem.type as any)}
                </Button>
            ) : activeFormItem ? (
                <div id={activeFormItem.id} className="p-4 rounded-md shadow-xl opacity-90 bg-card">
                    <p>{activeFormItem.label}</p>
                </div>
            ): null}
        </DragOverlay>
      </DndContext>

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
              <Tabs defaultValue="elements" className="h-full flex flex-col">
                <TabsList className="m-2">
                    <TabsTrigger value="elements">Elements</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                </TabsList>
                <TabsContent value="elements" className="flex-1 overflow-y-auto p-2">
                    <FormElementsPanel onAddItem={addItemFromPalette} />
                </TabsContent>
                <TabsContent value="variables" className="flex-1 overflow-y-auto">
                    <VariablesPanel items={template.items} />
                </TabsContent>
            </Tabs>
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
  )
}


export default function FormBuilderPage({ evaluationId }: { evaluationId: string }) {
    return (
        <FormBuilderContent evaluationId={evaluationId} />
    );
}
