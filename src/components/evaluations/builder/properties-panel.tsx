
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    
    const { id, type, label, required, options, sliderConfig, matrixConfig, fileUploadConfig } = selectedQuestion;
    
    const update = (updates: Partial<FormItem>) => {
        onUpdateQuestion(id, updates);
    };
    
    const handleListChange = (listType: 'options' | 'matrixRows' | 'matrixCols', index: number, value: string) => {
        let newList: string[] | undefined;
        if (listType === 'options') {
            newList = [...(options || [])];
        } else if (listType === 'matrixRows') {
            newList = [...(matrixConfig?.rows || [])];
        } else if (listType === 'matrixCols') {
            newList = [...(matrixConfig?.columns || [])];
        }
        
        if (newList) {
            newList[index] = value;
            if (listType === 'options') update({ options: newList });
            if (listType === 'matrixRows') update({ matrixConfig: { ...matrixConfig!, rows: newList }});
            if (listType === 'matrixCols') update({ matrixConfig: { ...matrixConfig!, columns: newList }});
        }
    };
    
    const addToList = (listType: 'options' | 'matrixRows' | 'matrixCols') => {
        if (listType === 'options') {
            const newOptions = [...(options || []), `Option ${(options?.length || 0) + 1}`];
            update({ options: newOptions });
        } else if (listType === 'matrixRows') {
            const newRows = [...(matrixConfig?.rows || []), `New Row`];
            update({ matrixConfig: { ...matrixConfig!, rows: newRows }});
        } else if (listType === 'matrixCols') {
            const newCols = [...(matrixConfig?.columns || []), `New Col`];
            update({ matrixConfig: { ...matrixConfig!, columns: newCols }});
        }
    };

    const deleteFromList = (listType: 'options' | 'matrixRows' | 'matrixCols', index: number) => {
        let newList: string[] | undefined;
        if (listType === 'options') {
            newList = options?.filter((_, i) => i !== index);
            update({ options: newList });
        } else if (listType === 'matrixRows') {
            newList = matrixConfig?.rows.filter((_, i) => i !== index);
            update({ matrixConfig: { ...matrixConfig!, rows: newList || [] }});
        } else if (listType === 'matrixCols') {
            newList = matrixConfig?.columns.filter((_, i) => i !== index);
            update({ matrixConfig: { ...matrixConfig!, columns: newList || [] }});
        }
    };

    const getButtonText = (listType: 'options' | 'matrixRows' | 'matrixCols') => {
        if (listType === 'options') return t('addOption');
        if (listType === 'matrixRows') return t('addRow');
        if (listType === 'matrixCols') return t('addCol');
    }

    const renderListEditor = (title: string, list: string[] | undefined, listType: 'options' | 'matrixRows' | 'matrixCols') => (
        <div className="space-y-2">
            <Label>{title}</Label>
            {list?.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Input value={item} onChange={(e) => handleListChange(listType, i, e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => deleteFromList(listType, i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => addToList(listType)}><PlusCircle className="mr-2 h-4 w-4" /> {getButtonText(listType)}</Button>
        </div>
    );

    return (
        <div className="p-4 bg-card h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
            <Card>
                <CardHeader><CardTitle className="text-base">{tq(type as any)}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question-text">{type === 'Section Header' ? t('sectionHeaderTitle') : t('questionText')}</Label>
                        <Textarea id="question-text" value={label} onChange={(e) => update({ label: e.target.value })} />
                    </div>
                    {type !== 'Section Header' && (
                        <>
                            <div className="space-y-2">
                                <Label>{t('image')}</Label>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => update({imageUrl: `https://placehold.co/600x400.png?text=${id.substring(0,4)}` })}>
                                    <ImagePlus className="mr-2 h-4 w-4" /> {t('addImage')}
                                </Button>
                                {selectedQuestion.imageUrl && (
                                    <Button variant="link" size="sm" className="w-full text-destructive" onClick={() => update({imageUrl: null})}>
                                        {t('removeImage')}
                                    </Button>
                                )}
                            </div>
                            <Separator />
                        </>
                    )}
                    
                    {type === 'Multiple Choice' && renderListEditor(t('options'), options, 'options')}

                    {type === 'Matrix Table' && matrixConfig && (
                        <div className="space-y-4">
                            {renderListEditor(t('matrixRows'), matrixConfig.rows, 'matrixRows')}
                            {renderListEditor(t('matrixCols'), matrixConfig.columns, 'matrixCols')}
                        </div>
                    )}

                    {type === 'File Upload' && fileUploadConfig && (
                        <div className="space-y-2">
                            <Label>{t('fileUploadConfigTitle')}</Label>
                            <div className="text-sm p-3 bg-secondary rounded-md space-y-2">
                                <div>{t('maxSize')} <Badge variant="secondary">{fileUploadConfig.maxSizeMB} MB</Badge></div>
                                <div>
                                    {t('allowedTypes')}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {fileUploadConfig.allowedTypes.map(type => (
                                            <Badge key={type} variant="secondary">{type.split('/')[1]}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{t('configReadOnlyHint')}</p>
                        </div>
                    )}

                    {type === 'Slider' && (
                        <div className="space-y-4">
                            <Label>{t('sliderConfigTitle')}</Label>
                            <div className='flex items-center gap-2'>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-min" className='text-xs'>{t('min')}</Label>
                                    <Input id="slider-min" type="number" value={sliderConfig?.min} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, min: Number(e.target.value) } })} />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-max" className='text-xs'>{t('max')}</Label>
                                    <Input id="slider-max" type="number" value={sliderConfig?.max} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, max: Number(e.target.value) } })} />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-step" className='text-xs'>{t('step')}</Label>
                                    <Input id="slider-step" type="number" value={sliderConfig?.step} onChange={(e) => update({ sliderConfig: { ...sliderConfig!, step: Number(e.target.value) } })} />
                                </div>
                            </div>
                        </div>
                    )}
                    {type !== 'Section Header' && (
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Label htmlFor="required-switch">{t('required')}</Label>
                        <Switch id="required-switch" checked={required} onCheckedChange={(checked) => update({ required: checked })} />
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
