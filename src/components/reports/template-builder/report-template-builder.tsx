'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Calculator, Type, BarChart3, FileText, Save, Eye } from 'lucide-react';
import { backend } from '@/services/backend/backend';
import { useTenant } from '@/context/tenant-context';
import type { ReportTemplate, CustomFormula, FormVariable, Evaluation } from '@/services/backend/types';

interface ReportTemplateBuilderProps {
    evaluation: Evaluation;
    template?: ReportTemplate;
    onSave?: (template: ReportTemplate) => void;
    onCancel?: () => void;
}

interface ReportPage {
    id: string;
    type: 'cover' | 'content' | 'charts' | 'summary';
    title: string;
    elements: ReportElement[];
}

interface ReportElement {
    id: string;
    type: 'text' | 'variable' | 'formula' | 'chart' | 'table';
    content: string;
    variableId?: string;
    formulaId?: string;
    style?: {
        fontSize?: string;
        fontWeight?: string;
        color?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

export function ReportTemplateBuilder({ evaluation, template, onSave, onCancel }: ReportTemplateBuilderProps) {
    const t = useTranslations('ReportBuilder');
    const tTemplate = useTranslations('TemplateBuilder');
    const { currentTenant } = useTenant();
    
    const [templateName, setTemplateName] = useState(template?.name || '');
    const [templateType, setTemplateType] = useState<'individual' | 'aggregate'>(template?.type || 'individual');
    const [pages, setPages] = useState<ReportPage[]>(template?.pages as ReportPage[] || []);
    const [variables, setVariables] = useState<FormVariable[]>([]);
    const [customFormulas, setCustomFormulas] = useState<CustomFormula[]>(template?.customFormulas || []);
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        loadVariables();
        if (pages.length === 0) {
            initializeDefaultPages();
        }
    }, [evaluation.id]);

    const loadVariables = async () => {
        if (!currentTenant) return;
        try {
            const vars = await backend().getFormVariables(currentTenant.id, evaluation.id);
            setVariables(vars);
        } catch (error) {
            console.error('Error loading variables:', error);
        }
    };

    const initializeDefaultPages = () => {
        const defaultPages: ReportPage[] = [
            {
                id: 'cover',
                type: 'cover',
                title: 'Cover Page',
                elements: [
                    {
                        id: 'title',
                        type: 'text',
                        content: evaluation.title,
                        style: { fontSize: '24px', fontWeight: 'bold', alignment: 'center' }
                    },
                    {
                        id: 'date',
                        type: 'variable',
                        content: 'Report Date: {{completion_date}}',
                        variableId: 'completion_date'
                    }
                ]
            },
            {
                id: 'results',
                type: 'content',
                title: 'Results',
                elements: [
                    {
                        id: 'summary',
                        type: 'text',
                        content: 'Evaluation Results Summary',
                        style: { fontSize: '18px', fontWeight: 'bold' }
                    }
                ]
            }
        ];
        setPages(defaultPages);
        setSelectedPageId('cover');
    };

    const addPage = () => {
        const newPage: ReportPage = {
            id: `page_${Date.now()}`,
            type: 'content',
            title: 'New Page',
            elements: []
        };
        setPages([...pages, newPage]);
        setSelectedPageId(newPage.id);
    };

    const updatePage = (pageId: string, updates: Partial<ReportPage>) => {
        setPages(pages.map(page => 
            page.id === pageId ? { ...page, ...updates } : page
        ));
    };

    const deletePage = (pageId: string) => {
        const newPages = pages.filter(page => page.id !== pageId);
        setPages(newPages);
        if (selectedPageId === pageId && newPages.length > 0) {
            setSelectedPageId(newPages[0].id);
        }
    };

    const addElement = (pageId: string, type: ReportElement['type']) => {
        const newElement: ReportElement = {
            id: `element_${Date.now()}`,
            type,
            content: getDefaultContent(type),
            style: { alignment: 'left' }
        };

        updatePage(pageId, {
            elements: [...(pages.find(p => p.id === pageId)?.elements || []), newElement]
        });
    };

    const getDefaultContent = (type: ReportElement['type']): string => {
        switch (type) {
            case 'text': return 'Enter your text here...';
            case 'variable': return 'Select a variable...';
            case 'formula': return 'Select a formula...';
            case 'chart': return 'Chart will be displayed here';
            case 'table': return 'Table will be displayed here';
            default: return '';
        }
    };

    const updateElement = (pageId: string, elementId: string, updates: Partial<ReportElement>) => {
        updatePage(pageId, {
            elements: pages.find(p => p.id === pageId)?.elements.map(element =>
                element.id === elementId ? { ...element, ...updates } : element
            ) || []
        });
    };

    const deleteElement = (pageId: string, elementId: string) => {
        updatePage(pageId, {
            elements: pages.find(p => p.id === pageId)?.elements.filter(element => 
                element.id !== elementId
            ) || []
        });
    };

    const addCustomFormula = () => {
        const newFormula: CustomFormula = {
            id: crypto.randomUUID(),
            tenantId: currentTenant!.id,
            name: 'New Formula',
            variableId: `formula_${Date.now()}`,
            formula: '',
            description: '',
            displayFormat: 'number',
            category: 'score',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setCustomFormulas([...customFormulas, newFormula]);
    };

    const updateCustomFormula = (formulaId: string, updates: Partial<CustomFormula>) => {
        setCustomFormulas(formulas => 
            formulas.map(formula => 
                formula.id === formulaId ? { ...formula, ...updates } : formula
            )
        );
    };

    const deleteCustomFormula = (formulaId: string) => {
        setCustomFormulas(formulas => formulas.filter(f => f.id !== formulaId));
    };

    const handleSave = async () => {
        if (!currentTenant || !templateName.trim()) return;

        setIsLoading(true);
        try {
            const templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
                tenantId: currentTenant.id,
                evaluationId: evaluation.id,
                name: templateName,
                type: templateType,
                customFormulas,
                pages
            };

            let savedTemplate: ReportTemplate;
            if (template?.id) {
                savedTemplate = await backend().updateReportTemplate(currentTenant.id, template.id, templateData);
            } else {
                savedTemplate = await backend().createReportTemplate(currentTenant.id, templateData);
            }

            onSave?.(savedTemplate);
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPage = pages.find(page => page.id === selectedPageId);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <Label htmlFor="template-name">{t('templateName')}</Label>
                            <Input
                                id="template-name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder={tTemplate('enterTemplateName')}
                                className="w-64"
                            />
                        </div>
                        <div>
                            <Label htmlFor="template-type">{t('templateType')}</Label>
                            <Select value={templateType} onValueChange={(value: 'individual' | 'aggregate') => setTemplateType(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">{t('individual')}</SelectItem>
                                    <SelectItem value="aggregate">{t('aggregate')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('preview')}
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || !templateName.trim()}>
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? t('saving') : t('save')}
                        </Button>
                        {onCancel && (
                            <Button variant="outline" onClick={onCancel}>
                                {t('cancel')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-80 border-r bg-muted/30">
                    <Tabs defaultValue="pages" className="h-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="pages">Pages</TabsTrigger>
                            <TabsTrigger value="variables">Variables</TabsTrigger>
                            <TabsTrigger value="formulas">Formulas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pages" className="h-full">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">Pages</h3>
                                    <Button size="sm" onClick={addPage}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <div className="space-y-2">
                                        {pages.map((page) => (
                                            <div
                                                key={page.id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    selectedPageId === page.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                                }`}
                                                onClick={() => setSelectedPageId(page.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{page.title}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {page.elements.length} elements
                                                        </div>
                                                    </div>
                                                    {pages.length > 1 && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deletePage(page.id);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="variables" className="h-full">
                            <div className="p-4">
                                <h3 className="font-medium mb-4">Available Variables</h3>
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <div className="space-y-2">
                                        {variables.map((variable) => (
                                            <div key={variable.id} className="p-3 rounded-lg border">
                                                <div className="font-medium">{variable.name}</div>
                                                <div className="text-sm text-muted-foreground">{variable.description}</div>
                                                <Badge variant="outline" className="mt-1">
                                                    {variable.type}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="formulas" className="h-full">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">Custom Formulas</h3>
                                    <Button size="sm" onClick={addCustomFormula}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <div className="space-y-2">
                                        {customFormulas.map((formula) => (
                                            <div key={formula.id} className="p-3 rounded-lg border">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={formula.name}
                                                            onChange={(e) => updateCustomFormula(formula.id, { name: e.target.value })}
                                                            className="font-medium mb-2"
                                                        />
                                        <Textarea
                                            value={formula.formula}
                                            onChange={(e) => updateCustomFormula(formula.id, { formula: e.target.value })}
                                            placeholder={tTemplate('enterFormula')}
                                            className="text-sm"
                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteCustomFormula(formula.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {selectedPage ? (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <Input
                                        value={selectedPage.title}
                                        onChange={(e) => updatePage(selectedPage.id, { title: e.target.value })}
                                        className="text-lg font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={() => addElement(selectedPage.id, 'text')}>
                                        <Type className="h-4 w-4 mr-1" />
                                        Text
                                    </Button>
                                    <Button size="sm" onClick={() => addElement(selectedPage.id, 'variable')}>
                                        <FileText className="h-4 w-4 mr-1" />
                                        Variable
                                    </Button>
                                    <Button size="sm" onClick={() => addElement(selectedPage.id, 'formula')}>
                                        <Calculator className="h-4 w-4 mr-1" />
                                        Formula
                                    </Button>
                                    <Button size="sm" onClick={() => addElement(selectedPage.id, 'chart')}>
                                        <BarChart3 className="h-4 w-4 mr-1" />
                                        Chart
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedPage.elements.map((element) => (
                                    <Card key={element.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">{element.type}</Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteElement(selectedPage.id, element.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {element.type === 'text' && (
                                                <Textarea
                                                    value={element.content}
                                                    onChange={(e) => updateElement(selectedPage.id, element.id, { content: e.target.value })}
                                                    placeholder={tTemplate('enterTextContent')}
                                                />
                                            )}
                                            {element.type === 'variable' && (
                                                <div className="space-y-2">
                                                    <Select
                                                        value={element.variableId}
                                                        onValueChange={(value) => updateElement(selectedPage.id, element.id, { variableId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={tTemplate('selectVariable')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {variables.map((variable) => (
                                                                <SelectItem key={variable.id} value={variable.variableId}>
                                                                    {variable.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        value={element.content}
                                                        onChange={(e) => updateElement(selectedPage.id, element.id, { content: e.target.value })}
                                                        placeholder={tTemplate('displayFormat')}
                                                    />
                                                </div>
                                            )}
                                            {element.type === 'formula' && (
                                                <div className="space-y-2">
                                                    <Select
                                                        value={element.formulaId}
                                                        onValueChange={(value) => updateElement(selectedPage.id, element.id, { formulaId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={tTemplate('selectFormula')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {customFormulas.map((formula) => (
                                                                <SelectItem key={formula.id} value={formula.id}>
                                                                    {formula.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        value={element.content}
                                                        onChange={(e) => updateElement(selectedPage.id, element.id, { content: e.target.value })}
                                                        placeholder={tTemplate('displayFormatFormula')}
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a page to start editing
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Template Preview</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-8">
                            {pages.map((page) => (
                                <div key={page.id} className="border rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">{page.title}</h3>
                                    <div className="space-y-4">
                                        {page.elements.map((element) => (
                                            <div key={element.id} className="p-3 bg-muted/50 rounded">
                                                <Badge variant="outline" className="mb-2">{element.type}</Badge>
                                                <div style={element.style}>{element.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
