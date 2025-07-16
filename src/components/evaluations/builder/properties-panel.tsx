
'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, PlusCircle, Trash2 } from "lucide-react";
import type { FormItem } from "./types";

interface PropertiesPanelProps {
    selectedQuestion: FormItem | null;
    onUpdateQuestion: (id: string, updates: Partial<FormItem>) => void;
}

export function PropertiesPanel({ selectedQuestion, onUpdateQuestion }: PropertiesPanelProps) {
    const t = useTranslations('FormBuilderPage');
    const tq = useTranslations('QuestionTypes');

    if (!selectedQuestion) {
        return (
            <div className="p-4 bg-card h-full overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
                <div className="text-center py-12 text-muted-foreground">
                    <p>{t('selectQuestion')}</p>
                </div>
            </div>
        );
    }
    
    const { id, type, label, required, options, sliderConfig } = selectedQuestion;
    
    const update = (updates: Partial<FormItem>) => {
        onUpdateQuestion(id, updates);
    };
    
    const addOption = () => {
        const newOptions = [...(options || []), `Option ${(options?.length || 0) + 1}`];
        update({ options: newOptions });
    };
  
    const deleteOption = (optionIndex: number) => {
        const newOptions = options?.filter((_, i) => i !== optionIndex);
        update({ options: newOptions });
    };

    const updateOption = (optionIndex: number, value: string) => {
        const newOptions = options?.map((o, idx) => idx === optionIndex ? value : o);
        update({ options: newOptions });
    }

    return (
        <div className="p-4 bg-card h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
            <Card>
                <CardHeader><CardTitle className="text-base">{tq(type as any)}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question-text">{type === 'Section Header' ? 'Section Title' : t('questionText')}</Label>
                        <Textarea id="question-text" value={label} onChange={(e) => update({ label: e.target.value })} />
                    </div>
                    {type !== 'Section Header' && (
                        <>
                            <div className="space-y-2">
                                <Label>Image</Label>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => update({imageUrl: `https://placehold.co/600x400.png?text=${id.substring(0,4)}` })}>
                                    <ImagePlus className="mr-2 h-4 w-4" /> Add/Change Image
                                </Button>
                                {selectedQuestion.imageUrl && (
                                    <Button variant="link" size="sm" className="w-full text-destructive" onClick={() => update({imageUrl: null})}>
                                        Remove Image
                                    </Button>
                                )}
                            </div>
                            {type === 'Multiple Choice' && (
                                <div className="space-y-2">
                                    <Label>{t('options')}</Label>
                                    {options?.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                                            <Button variant="ghost" size="icon" onClick={() => deleteOption(i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" />{t('addOption')}</Button>
                                </div>
                            )}
                            {type === 'Slider' && (
                                <div className="space-y-4">
                                    <Label>Slider Configuration</Label>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex-1 space-y-1'>
                                            <Label htmlFor="slider-min" className='text-xs'>Min</Label>
                                            <Input id="slider-min" type="number" value={sliderConfig?.min} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, min: Number(e.target.value) } })} />
                                        </div>
                                        <div className='flex-1 space-y-1'>
                                            <Label htmlFor="slider-max" className='text-xs'>Max</Label>
                                            <Input id="slider-max" type="number" value={sliderConfig?.max} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, max: Number(e.target.value) } })} />
                                        </div>
                                        <div className='flex-1 space-y-1'>
                                            <Label htmlFor="slider-step" className='text-xs'>Step</Label>
                                            <Input id="slider-step" type="number" value={sliderConfig?.step} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, step: Number(e.target.value) } })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <Label htmlFor="required-switch">{t('required')}</Label>
                                <Switch id="required-switch" checked={required} onCheckedChange={(checked) => update({ required: checked })} />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
