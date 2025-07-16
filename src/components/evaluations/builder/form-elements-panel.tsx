
'use client';

import { useSortable } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { questionTypes } from "./question-types";

function DraggablePaletteItem({ 
  type, 
  icon: Icon, 
  onClick 
}: { 
  type: string, 
  icon: React.ElementType,
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: `palette-${type}` });
  const t = useTranslations('QuestionTypes');

  const allListeners = onClick ? { onClick } : listeners;

  return (
      <Button 
        ref={setNodeRef}
        {...attributes}
        {...allListeners}
        variant="ghost" 
        className={cn("w-full justify-start cursor-grab", isDragging && "opacity-50 z-50 shadow-lg")}
      >
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        {t(type as any)}
      </Button>
  )
}

export function FormElementsPanel({ onAddItem }: { onAddItem?: (type: string) => void }) {
    return (
        <div className="p-4 space-y-2">
            {questionTypes.map((q) => (
              <DraggablePaletteItem 
                key={q.type} 
                type={q.type} 
                icon={q.icon}
                onClick={onAddItem ? () => onAddItem(q.type) : undefined}
              />
            ))}
        </div>
    );
}
