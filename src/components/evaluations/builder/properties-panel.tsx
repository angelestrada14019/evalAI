
'use client';

import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, PlusCircle, Trash2 } from "lucide-react";
import type { FormItem, Option } from "./types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PropertiesPanelProps {
    selectedQuestion: FormItem | null;
    onUpdateQuestion: (id: string, updates: Partial<FormItem>) => void;
}

const NON_SCORABLE_TYPES = ['Text Input', 'Section Header', 'File Upload'];

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
    
    const { id, type, label, required, readOnly, variableId, options, sliderConfig, matrixConfig, fileUploadConfig, ratingConfig } = selectedQuestion;
    
    const update = (updates: Partial<FormItem>) => {
        onUpdateQuestion(id, updates);
    };

    const handleOptionChange = (index: number, field: 'label' | 'value', value: string | number) => {
        if (!options) return;
        const newOptions = [...options];
        const optionToUpdate = { ...newOptions[index] };
        if (field === 'label') {
            optionToUpdate.label = value as string;
        } else {
            optionToUpdate.value = typeof value === 'string' ? parseFloat(value) : value;
        }
        newOptions[index] = optionToUpdate;
        update({ options: newOptions });
    };

    const addOption = () => {
        const newOption: Option = {
            id: uuidv4(),
            label: `Option ${(options?.length || 0) + 1}`,
            value: (options?.length || 0) + 1
        };
        update({ options: [...(options || []), newOption] });
    };

    const deleteOption = (index: number) => {
        update({ options: options?.filter((_, i) => i !== index) });
    };
    
    const handleMatrixListChange = (listType: 'rows' | 'columns', index: number, field: 'label' | 'value', value: string | number) => {
        if (!matrixConfig) return;
        if (listType === 'rows') {
            const newRows = [...matrixConfig.rows];
            newRows[index] = value as string;
            update({ matrixConfig: { ...matrixConfig, rows: newRows } });
        } else {
            const newCols = [...matrixConfig.columns];
            const colToUpdate = { ...newCols[index] };
             if (field === 'label') {
                colToUpdate.label = value as string;
            } else {
                colToUpdate.value = typeof value === 'string' ? parseFloat(value) : value;
            }
            newCols[index] = colToUpdate;
            update({ matrixConfig: { ...matrixConfig, columns: newCols } });
        }
    };
    
    const addMatrixToList = (listType: 'rows' | 'columns') => {
        if (!matrixConfig) return;
        if (listType === 'rows') {
            const newRows = [...matrixConfig.rows, `New Row`];
            update({ matrixConfig: { ...matrixConfig, rows: newRows } });
        } else {
             const newCol: Option = {
                id: uuidv4(),
                label: `New Col`,
                value: (matrixConfig.columns.length || 0) + 1
            };
            const newCols = [...matrixConfig.columns, newCol];
            update({ matrixConfig: { ...matrixConfig, columns: newCols } });
        }
    };

    const deleteMatrixFromList = (listType: 'rows' | 'columns', index: number) => {
        if (!matrixConfig) return;
        if (listType === 'rows') {
            const newRows = matrixConfig.rows.filter((_, i) => i !== index);
            update({ matrixConfig: { ...matrixConfig, rows: newRows } });
        } else {
            const newCols = matrixConfig.columns.filter((_, i) => i !== index);
            update({ matrixConfig: { ...matrixConfig, columns: newCols } });
        }
    };


    const renderOptionsEditor = () => (
        <div className="space-y-2">
            <Label>{t('options')}</Label>
            {options?.map((opt, i) => (
                <div key={`${opt.id}-${i}`} className="flex items-center gap-2">
                    <Input className="flex-1" value={opt.label} onChange={(e) => handleOptionChange(i, 'label', e.target.value)} />
                    <Input type="number" className="w-20" value={opt.value} onChange={(e) => handleOptionChange(i, 'value', e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => deleteOption(i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" /> {t('addOption')}</Button>
        </div>
    );

    const renderMatrixEditor = () => matrixConfig && (
         <div className="space-y-4">
            <div>
                <Label>{t('matrixRows')}</Label>
                {matrixConfig.rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2 mt-1">
                        <Input value={row} onChange={(e) => handleMatrixListChange('rows', i, 'label', e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteMatrixFromList('rows', i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addMatrixToList('rows')}><PlusCircle className="mr-2 h-4 w-4" /> {t('addRow')}</Button>
            </div>
            <div>
                <Label>{t('matrixCols')}</Label>
                {matrixConfig.columns.map((col, i) => (
                    <div key={col.id} className="flex items-center gap-2 mt-1">
                        <Input className="flex-1" value={col.label} onChange={(e) => handleMatrixListChange('columns', i, 'label', e.target.value)} />
                        <Input type="number" className="w-20" value={col.value} onChange={(e) => handleMatrixListChange('columns', i, 'value', e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteMatrixFromList('columns', i)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addMatrixToList('columns')}><PlusCircle className="mr-2 h-4 w-4" /> {t('addCol')}</Button>
            </div>
        </div>
    );

    const showScoringFields = !NON_SCORABLE_TYPES.includes(type);

    return (
        <div className="p-4 bg-card h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{t('properties')}</h2>
            <Card>
                <CardHeader><CardTitle className="text-base">{tq(type as any)}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question-text">{type === 'Section Header' ? t('sectionHeaderTitle') : t('questionText')}</Label>
                        <Textarea id="question-text" value={label} onChange={(e) => update({ label: e.target.value })} disabled={readOnly} />
                    </div>

                    {showScoringFields && (
                         <div className="space-y-2">
                            <Label htmlFor="variable-id">{t('variableIdLabel')}</Label>
                            <Input 
                                id="variable-id" 
                                value={variableId} 
                                onChange={(e) => update({ variableId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                disabled={readOnly}
                             />
                        </div>
                    )}

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
                    
                    {type === 'Multiple Choice' && renderOptionsEditor()}
                    {type === 'Matrix Table' && renderMatrixEditor()}

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
                            <div className="text-xs text-muted-foreground">{t('configReadOnlyHint')}</div>
                        </div>
                    )}

                    {type === 'Slider' && sliderConfig && (
                        <div className="space-y-4">
                            <Label>{t('sliderConfigTitle')}</Label>
                            <div className='flex items-center gap-2'>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-min" className='text-xs'>{t('min')}</Label>
                                    <Input id="slider-min" type="number" value={sliderConfig.min} onChange={(e) => update({ sliderConfig: { ...sliderConfig, min: Number(e.target.value) } })} />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-max" className='text-xs'>{t('max')}</Label>
                                    <Input id="slider-max" type="number" value={sliderConfig.max} onChange={(e) => update({ sliderConfig: { ...sliderConfig, max: Number(e.target.value) } })} />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="slider-step" className='text-xs'>{t('step')}</Label>
                                    <Input id="slider-step" type="number" value={sliderConfig.step} onChange={(e) => update({ sliderConfig: { ...sliderConfig, step: Number(e.target.value) } })} />
                                </div>
                            </div>
                        </div>
                    )}
                     {type === 'Rating Scale' && ratingConfig && (
                         <div className="space-y-4">
                            <Label>{t('sliderConfigTitle')}</Label>
                            <div className='flex items-center gap-2'>
                                <div className='flex-1 space-y-1'>
                                    <Label htmlFor="rating-max" className='text-xs'>{t('max')}</Label>
                                    <Input id="rating-max" type="number" value={ratingConfig.max} onChange={(e) => update({ ratingConfig: { ...ratingConfig, max: Number(e.target.value) } })} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {showScoringFields && (
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Label htmlFor="required-switch">{t('required')}</Label>
                        <Switch id="required-switch" checked={required} onCheckedChange={(checked) => update({ required: checked })} disabled={readOnly}/>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
