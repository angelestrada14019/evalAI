
'use client';

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { SortableFormItem } from "./sortable-form-item";
import type { FormItem } from "./types";

interface FormCanvasProps {
    items: FormItem[];
    selectedQuestionId?: string | null;
    onSelectQuestion: (item: FormItem) => void;
    onDeleteQuestion: (id: string) => void;
}

export function FormCanvas({ items, selectedQuestionId, onSelectQuestion, onDeleteQuestion }: FormCanvasProps) {
    const t = useTranslations('FormBuilderPage');
    
    return (
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6 max-w-3xl mx-auto px-4">
                {items.map((item, index) => (
                    <SortableFormItem
                        key={item.id}
                        item={item}
                        index={index}
                        selected={selectedQuestionId === item.id}
                        onSelect={() => onSelectQuestion(item)}
                        onDelete={onDeleteQuestion}
                    />
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground max-w-3xl mx-auto">
                    <p>{t('noQuestions')}</p>
                    <p className="text-sm">{t('noQuestionsHint')}</p>
                </div>
            )}
        </SortableContext>
    );
}

    