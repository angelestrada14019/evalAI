
'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Star } from "lucide-react";
import type { FormItem } from "./types";

interface SortableFormItemProps {
    item: FormItem;
    index: number;
    selected: boolean;
    onSelect: () => void;
    onDelete: (id: string) => void;
}

export function SortableFormItem({ item, index, selected, onSelect, onDelete }: SortableFormItemProps) {
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
            <div ref={setNodeRef} style={style} className="relative flex items-center gap-4 py-2">
                <div 
                    onClick={onSelect} 
                    className={cn("absolute inset-0 -mx-4 rounded-md cursor-pointer", selected && "bg-primary/5")}
                ></div>
                <div {...attributes} {...listeners} className="cursor-grab touch-none relative z-10">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div onClick={onSelect} className="flex-1 relative z-10 cursor-pointer">
                    <h3 className="text-xl font-bold">{item.label}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="relative z-10"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
        )
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn("p-4 transition-shadow", selected ? 'border-2 border-primary shadow-lg' : 'hover:shadow-md')}
        >
            <div className="flex items-start gap-4">
                <div {...attributes} {...listeners} className="cursor-grab touch-none">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                </div>
                <div className="flex-1 cursor-pointer" onClick={onSelect}>
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
                     {item.type === 'Rating Scale' && (
                        <div className="flex items-center gap-1 mt-2">
                           {Array.from({ length: item.ratingConfig?.max ?? 5 }).map((_, i) => (
                               <Star key={i} className="h-6 w-6 text-yellow-400" />
                           ))}
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
        </Card>
    );
}
