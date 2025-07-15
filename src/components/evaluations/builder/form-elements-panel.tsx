
'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { questionTypes } from "./question-types";

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

export function FormElementsPanel() {
    const t = useTranslations('FormBuilderPage');
    
    return (
        <div className="p-4 bg-card h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('formElements')}</h2>
            <SortableContext items={questionTypes.map(q => `palette-${q.type}`)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {questionTypes.map((q) => <DraggablePaletteItem key={q.type} type={q.type} icon={q.icon} />)}
                </div>
            </SortableContext>
        </div>
    );
}

    