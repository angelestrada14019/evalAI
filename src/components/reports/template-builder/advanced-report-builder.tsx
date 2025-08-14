'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, X, Calculator, Type, BarChart3, FileText, Save, Eye, Settings,
  Image, Table, PieChart, TrendingUp, Target, Users, Award, Palette,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Upload, Trash2, Copy, Move, RotateCcw, RotateCw, ZoomIn, ZoomOut
} from 'lucide-react';
import { backend } from '@/services/backend/backend';
import { useTenant } from '@/context/tenant-context';
import type { ReportTemplate, CustomFormula, FormVariable, Evaluation } from '@/services/backend/types';

interface AdvancedReportBuilderProps {
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
    background?: {
        color?: string;
        gradient?: string;
        image?: string;
    };
}

interface ReportElement {
    id: string;
    type: 'text' | 'variable' | 'formula' | 'chart' | 'table' | 'image' | 'logo' | 'divider' | 'shape';
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    variableId?: string;
    formulaId?: string;
    chartType?: 'bar' | 'pie' | 'line' | 'column' | 'gauge' | 'radar' | 'bubble';
    style: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
        fontStyle?: 'normal' | 'italic';
        textDecoration?: 'none' | 'underline' | 'line-through';
        color?: string;
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number;
        padding?: number;
        margin?: number;
        alignment?: 'left' | 'center' | 'right' | 'justify';
        opacity?: number;
        rotation?: number;
        shadow?: boolean;
        shadowColor?: string;
        shadowBlur?: number;
        shadowOffset?: { x: number; y: number };
    };
    animation?: {
        type?: 'fadeIn' | 'slideIn' | 'bounce' | 'none';
        duration?: number;
        delay?: number;
    };
}

const WIDGET_CATEGORIES = {
    basic: {
        title: 'Basic Elements',
        widgets: [
            { type: 'text', icon: Type, label: 'Text' },
            { type: 'image', icon: Image, label: 'Image' },
            { type: 'logo', icon: Award, label: 'Logo' },
            { type: 'divider', icon: Target, label: 'Divider' }
        ]
    },
    data: {
        title: 'Data Elements',
        widgets: [
            { type: 'variable', icon: FileText, label: 'Variable' },
            { type: 'formula', icon: Calculator, label: 'Formula' },
            { type: 'table', icon: Table, label: 'Response Table' },
            { type: 'table', icon: Users, label: 'Top-Flop Table' }
        ]
    },
    charts: {
        title: 'Chart Widgets',
        widgets: [
            { type: 'chart', icon: BarChart3, label: 'Column Chart', chartType: 'column' },
            { type: 'chart', icon: PieChart, label: 'Pie Chart', chartType: 'pie' },
            { type: 'chart', icon: TrendingUp, label: 'XY Chart', chartType: 'line' },
            { type: 'chart', icon: Target, label: 'Gauge Chart', chartType: 'gauge' },
            { type: 'chart', icon: Award, label: 'Radar Chart', chartType: 'radar' },
            { type: 'chart', icon: Users, label: 'Bubble Chart', chartType: 'bubble' }
        ]
    },
    kpi: {
        title: 'KPI Widgets',
        widgets: [
            { type: 'formula', icon: Target, label: 'KPI Score' },
            { type: 'formula', icon: TrendingUp, label: 'Progress Bar' },
            { type: 'chart', icon: Award, label: 'Speedometer', chartType: 'gauge' }
        ]
    }
};

const FONT_FAMILIES = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New'
];

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
    '#808080', '#C0C0C0', '#800000', '#808000', '#008080', '#FF69B4'
];

export function AdvancedReportBuilder({ evaluation, template, onSave, onCancel }: AdvancedReportBuilderProps) {
    const t = useTranslations('ReportBuilder');
    const { currentTenant } = useTenant();
    const canvasRef = useRef<HTMLDivElement>(null);
    
    const [templateName, setTemplateName] = useState(template?.name || '');
    const [templateType, setTemplateType] = useState<'individual' | 'aggregate'>(template?.type || 'individual');
    const [pages, setPages] = useState<ReportPage[]>(template?.pages as ReportPage[] || []);
    const [variables, setVariables] = useState<FormVariable[]>([]);
    const [customFormulas, setCustomFormulas] = useState<CustomFormula[]>(template?.customFormulas || []);
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [selectedElementId, setSelectedElementId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [canvasZoom, setCanvasZoom] = useState(100);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);

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
                background: {
                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                elements: [
                    {
                        id: 'logo',
                        type: 'logo',
                        content: 'YourLogo',
                        position: { x: 50, y: 30 },
                        size: { width: 120, height: 40 },
                        style: {
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#FF6B35',
                            backgroundColor: 'transparent'
                        }
                    },
                    {
                        id: 'title',
                        type: 'text',
                        content: evaluation.title,
                        position: { x: 50, y: 150 },
                        size: { width: 600, height: 120 },
                        style: {
                            fontSize: 36,
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            alignment: 'left',
                            fontFamily: 'Arial'
                        }
                    },
                    {
                        id: 'subtitle',
                        type: 'text',
                        content: 'Management Self-Assessment Report',
                        position: { x: 50, y: 280 },
                        size: { width: 600, height: 60 },
                        style: {
                            fontSize: 24,
                            fontWeight: 'normal',
                            color: '#FFFFFF',
                            alignment: 'left',
                            fontFamily: 'Arial'
                        }
                    },
                    {
                        id: 'prepared-for',
                        type: 'variable',
                        content: 'Prepared for {{intro_field_response}}',
                        position: { x: 50, y: 380 },
                        size: { width: 400, height: 40 },
                        variableId: 'intro_field_response',
                        style: {
                            fontSize: 16,
                            fontWeight: 'normal',
                            color: '#E0E0E0',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: 10,
                            borderRadius: 4
                        }
                    },
                    {
                        id: 'date',
                        type: 'variable',
                        content: '{{response_date_and_time}}',
                        position: { x: 50, y: 440 },
                        size: { width: 300, height: 40 },
                        variableId: 'response_date_and_time',
                        style: {
                            fontSize: 16,
                            fontWeight: 'normal',
                            color: '#E0E0E0',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: 10,
                            borderRadius: 4
                        }
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
            elements: [],
            background: { color: '#FFFFFF' }
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

    const addElement = (pageId: string, type: ReportElement['type'], chartType?: string) => {
        const newElement: ReportElement = {
            id: `element_${Date.now()}`,
            type,
            content: getDefaultContent(type),
            position: { x: 100, y: 100 },
            size: getDefaultSize(type),
            chartType: chartType as any,
            style: getDefaultStyle(type)
        };

        updatePage(pageId, {
            elements: [...(pages.find(p => p.id === pageId)?.elements || []), newElement]
        });
        setSelectedElementId(newElement.id);
    };

    const getDefaultContent = (type: ReportElement['type']): string => {
        switch (type) {
            case 'text': return 'Enter your text here...';
            case 'variable': return 'Select a variable...';
            case 'formula': return 'Select a formula...';
            case 'chart': return 'Chart will be displayed here';
            case 'table': return 'Table will be displayed here';
            case 'image': return 'Click to upload image';
            case 'logo': return 'Your Logo';
            case 'divider': return '';
            case 'shape': return '';
            default: return '';
        }
    };

    const getDefaultSize = (type: ReportElement['type']) => {
        switch (type) {
            case 'text': return { width: 300, height: 60 };
            case 'variable': return { width: 250, height: 40 };
            case 'formula': return { width: 200, height: 40 };
            case 'chart': return { width: 400, height: 300 };
            case 'table': return { width: 500, height: 200 };
            case 'image': return { width: 200, height: 150 };
            case 'logo': return { width: 120, height: 40 };
            case 'divider': return { width: 300, height: 2 };
            case 'shape': return { width: 100, height: 100 };
            default: return { width: 200, height: 100 };
        }
    };

    const getDefaultStyle = (type: ReportElement['type']) => {
        const baseStyle = {
            fontSize: 14,
            fontFamily: 'Arial',
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            textDecoration: 'none' as const,
            color: '#000000',
            backgroundColor: 'transparent',
            borderColor: '#CCCCCC',
            borderWidth: 0,
            borderRadius: 0,
            padding: 8,
            margin: 0,
            alignment: 'left' as const,
            opacity: 1,
            rotation: 0,
            shadow: false,
            shadowColor: '#000000',
            shadowBlur: 4,
            shadowOffset: { x: 2, y: 2 }
        };

        switch (type) {
            case 'text':
                return { ...baseStyle, fontSize: 16 };
            case 'logo':
                return { ...baseStyle, fontWeight: 'bold' as const, fontSize: 18 };
            case 'divider':
                return { ...baseStyle, backgroundColor: '#CCCCCC', borderWidth: 0 };
            case 'chart':
                return { ...baseStyle, backgroundColor: '#F8F9FA', borderWidth: 1, borderRadius: 4 };
            default:
                return baseStyle;
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
        if (selectedElementId === elementId) {
            setSelectedElementId('');
        }
    };

    const duplicateElement = (pageId: string, elementId: string) => {
        const element = pages.find(p => p.id === pageId)?.elements.find(e => e.id === elementId);
        if (element) {
            const newElement = {
                ...element,
                id: `element_${Date.now()}`,
                position: { x: element.position.x + 20, y: element.position.y + 20 }
            };
            updatePage(pageId, {
                elements: [...(pages.find(p => p.id === pageId)?.elements || []), newElement]
            });
        }
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
    const selectedElement = selectedPage?.elements.find(element => element.id === selectedElementId);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Top Toolbar */}
            <div className="border-b bg-white p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Button size="sm" variant="outline" onClick={() => setCanvasZoom(Math.max(25, canvasZoom - 25))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{canvasZoom}%</span>
                        <Button size="sm" variant="outline" onClick={() => setCanvasZoom(Math.min(200, canvasZoom + 25))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div>
                        <Input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Template name..."
                            className="w-48"
                        />
                    </div>
                    <Select value={templateType} onValueChange={(value: 'individual' | 'aggregate') => setTemplateType(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="aggregate">Aggregate</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading || !templateName.trim()}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Template'}
                    </Button>
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Left Sidebar - Widgets */}
                <div className="w-80 border-r bg-white">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-orange-600">+ Add widgets</h3>
                    </div>
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                            {Object.entries(WIDGET_CATEGORIES).map(([key, category]) => (
                                <div key={key}>
                                    <h4 className="font-medium text-sm text-gray-600 mb-3">{category.title}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {category.widgets.map((widget, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                                                onClick={() => addElement(selectedPageId, widget.type, (widget as any).chartType)}
                                            >
                                                <widget.icon className="h-6 w-6 text-gray-600" />
                                                <span className="text-xs text-center">{widget.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col">
                    {/* Canvas Toolbar */}
                    <div className="border-b bg-white p-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {pages.map((page) => (
                                    <Button
                                        key={page.id}
                                        size="sm"
                                        variant={selectedPageId === page.id ? "default" : "outline"}
                                        onClick={() => setSelectedPageId(page.id)}
                                        className="relative"
                                    >
                                        {page.title}
                                        {pages.length > 1 && (
                                            <X 
                                                className="h-3 w-3 ml-2 hover:bg-red-100 rounded"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePage(page.id);
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                                <Button size="sm" variant="outline" onClick={addPage}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                                <Label className="text-sm">Grid</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                                <Label className="text-sm">Snap</Label>
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-auto bg-gray-100 p-8">
                        {selectedPage && (
                            <div 
                                ref={canvasRef}
                                className="relative mx-auto bg-white shadow-lg"
                                style={{ 
                                    width: '794px', 
                                    height: '1123px', // A4 proportions
                                    transform: `scale(${canvasZoom / 100})`,
                                    transformOrigin: 'top center',
                                    background: selectedPage.background?.gradient || selectedPage.background?.color || '#FFFFFF',
                                    backgroundImage: showGrid ? 'radial-gradient(circle, #ddd 1px, transparent 1px)' : 'none',
                                    backgroundSize: showGrid ? '20px 20px' : 'auto'
                                }}
                            >
                                {selectedPage.elements.map((element) => (
                                    <div
                                        key={element.id}
                                        className={`absolute cursor-pointer border-2 transition-all ${
                                            selectedElementId === element.id 
                                                ? 'border-blue-500 border-dashed' 
                                                : 'border-transparent hover:border-gray-300'
                                        }`}
                                        style={{
                                            left: element.position.x,
                                            top: element.position.y,
                                            width: element.size.width,
                                            height: element.size.height,
                                            transform: `rotate(${element.style.rotation || 0}deg)`,
                                            opacity: element.style.opacity || 1
                                        }}
                                        onClick={() => setSelectedElementId(element.id)}
                                    >
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{
                                                fontSize: element.style.fontSize,
                                                fontFamily: element.style.fontFamily,
                                                fontWeight: element.style.fontWeight,
                                                fontStyle: element.style.fontStyle,
                                                textDecoration: element.style.textDecoration,
                                                color: element.style.color,
                                                backgroundColor: element.style.backgroundColor,
                                                border: element.style.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor}` : 'none',
                                                borderRadius: element.style.borderRadius,
                                                padding: element.style.padding,
                                                textAlign: element.style.alignment,
                                                boxShadow: element.style.shadow 
                                                    ? `${element.style.shadowOffset?.x || 2}px ${element.style.shadowOffset?.y || 2}px ${element.style.shadowBlur || 4}px ${element.style.shadowColor || '#000000'}40`
                                                    : 'none'
                                            }}
                                        >
                                            {element.type === 'text' && element.content}
                                            {element.type === 'variable' && element.content}
                                            {element.type === 'formula' && element.content}
                                            {element.type === 'logo' && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <Award className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span>{element.content}</span>
                                                </div>
                                            )}
                                            {element.type === 'chart' && (
                                                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                                    <BarChart3 className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            {element.type === 'image' && (
                                                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                                    <Image className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            {element.type === 'divider' && (
                                                <div className="w-full h-full bg-current"></div>
                                            )}
                                        </div>

                                        {/* Element Controls */}
                                        {selectedElementId === element.id && (
                                            <div className="absolute -top-8 left-0 flex gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => duplicateElement(selectedPageId, element.id)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => deleteElement(selectedPageId, element.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-80 border-l bg-white">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </h3>
                    </div>
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                            {selectedElement ? (
                                <>
                                    {/* Element Properties */}
                                    <div>
                                        <h4 className="font-medium mb-3">Element Properties</h4>
                                        <div className="space-y-3">
                                            {/* Content */}
                                            {(selectedElement.type === 'text' || selectedElement.type === 'logo') && (
                                                <div>
                                                    <Label>Content</Label>
                                                    <Textarea
                                                        value={selectedElement.content}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { content: e.target.value })}
                                                        placeholder="Enter text..."
                                                        rows={3}
                                                    />
                                                </div>
                                            )}

                                            {/* Variable Selection */}
                                            {selectedElement.type === 'variable' && (
                                                <div>
                                                    <Label>Variable</Label>
                                                    <Select
                                                        value={selectedElement.variableId}
                                                        onValueChange={(value) => updateElement(selectedPageId, selectedElement.id, { variableId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select variable..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {variables.map((variable) => (
                                                                <SelectItem key={variable.id} value={variable.variableId}>
                                                                    {variable.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {/* Formula Selection */}
                                            {selectedElement.type === 'formula' && (
                                                <div>
                                                    <Label>Formula</Label>
                                                    <Select
                                                        value={selectedElement.formulaId}
                                                        onValueChange={(value) => updateElement(selectedPageId, selectedElement.id, { formulaId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select formula..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {customFormulas.map((formula) => (
                                                                <SelectItem key={formula.id} value={formula.id}>
                                                                    {formula.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Typography */}
                                    <div>
                                        <h4 className="font-medium mb-3">Typography</h4>
                                        <div className="space-y-3">
                                            {/* Font Family */}
                                            <div>
                                                <Label>Font Family</Label>
                                                <Select
                                                    value={selectedElement.style.fontFamily}
                                                    onValueChange={(value) => updateElement(selectedPageId, selectedElement.id, { 
                                                        style: { ...selectedElement.style, fontFamily: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {FONT_FAMILIES.map((font) => (
                                                            <SelectItem key={font} value={font}>{font}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Font Size */}
                                            <div>
                                                <Label>Font Size: {selectedElement.style.fontSize}px</Label>
                                                <Slider
                                                    value={[selectedElement.style.fontSize || 14]}
                                                    onValueChange={([value]) => updateElement(selectedPageId, selectedElement.id, { 
                                                        style: { ...selectedElement.style, fontSize: value }
                                                    })}
                                                    min={8}
                                                    max={72}
                                                    step={1}
                                                />
                                            </div>

                                            {/* Font Weight */}
                                            <div>
                                                <Label>Font Weight</Label>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedElement.style.fontWeight === 'normal' ? 'default' : 'outline'}
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, fontWeight: 'normal' }
                                                        })}
                                                    >
                                                        Normal
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'outline'}
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, fontWeight: 'bold' }
                                                        })}
                                                    >
                                                        <Bold className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Text Alignment */}
                                            <div>
                                                <Label>Text Alignment</Label>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedElement.style.alignment === 'left' ? 'default' : 'outline'}
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, alignment: 'left' }
                                                        })}
                                                    >
                                                        <AlignLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={selectedElement.style.alignment === 'center' ? 'default' : 'outline'}
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, alignment: 'center' }
                                                        })}
                                                    >
                                                        <AlignCenter className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={selectedElement.style.alignment === 'right' ? 'default' : 'outline'}
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, alignment: 'right' }
                                                        })}
                                                    >
                                                        <AlignRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div>
                                        <h4 className="font-medium mb-3">Colors</h4>
                                        <div className="space-y-3">
                                            {/* Text Color */}
                                            <div>
                                                <Label>Text Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={selectedElement.style.color}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, color: e.target.value }
                                                        })}
                                                        className="w-12 h-8 p-1"
                                                    />
                                                    <Input
                                                        value={selectedElement.style.color}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, color: e.target.value }
                                                        })}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-6 gap-1 mt-2">
                                                    {PRESET_COLORS.map((color) => (
                                                        <button
                                                            key={color}
                                                            className="w-6 h-6 rounded border border-gray-300"
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                                style: { ...selectedElement.style, color }
                                                            })}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Background Color */}
                                            <div>
                                                <Label>Background Color</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={selectedElement.style.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.style.backgroundColor}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, backgroundColor: e.target.value }
                                                        })}
                                                        className="w-12 h-8 p-1"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, backgroundColor: 'transparent' }
                                                        })}
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Position & Size */}
                                    <div>
                                        <h4 className="font-medium mb-3">Position & Size</h4>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>X Position</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedElement.position.x}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Y Position</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedElement.position.y}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Width</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedElement.size.width}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            size: { ...selectedElement.size, width: parseInt(e.target.value) || 0 }
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Height</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedElement.size.height}
                                                        onChange={(e) => updateElement(selectedPageId, selectedElement.id, { 
                                                            size: { ...selectedElement.size, height: parseInt(e.target.value) || 0 }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Effects */}
                                    <div>
                                        <h4 className="font-medium mb-3">Effects</h4>
                                        <div className="space-y-3">
                                            {/* Opacity */}
                                            <div>
                                                <Label>Opacity: {Math.round((selectedElement.style.opacity || 1) * 100)}%</Label>
                                                <Slider
                                                    value={[(selectedElement.style.opacity || 1) * 100]}
                                                    onValueChange={([value]) => updateElement(selectedPageId, selectedElement.id, { 
                                                        style: { ...selectedElement.style, opacity: value / 100 }
                                                    })}
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                />
                                            </div>

                                            {/* Rotation */}
                                            <div>
                                                <Label>Rotation: {selectedElement.style.rotation || 0}°</Label>
                                                <Slider
                                                    value={[selectedElement.style.rotation || 0]}
                                                    onValueChange={([value]) => updateElement(selectedPageId, selectedElement.id, { 
                                                        style: { ...selectedElement.style, rotation: value }
                                                    })}
                                                    min={-180}
                                                    max={180}
                                                    step={5}
                                                />
                                            </div>

                                            {/* Shadow */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={selectedElement.style.shadow || false}
                                                        onCheckedChange={(checked) => updateElement(selectedPageId, selectedElement.id, { 
                                                            style: { ...selectedElement.style, shadow: checked }
                                                        })}
                                                    />
                                                    <Label>Drop Shadow</Label>
                                                </div>
                                            </div>

                                            {/* Border Radius */}
                                            <div>
                                                <Label>Border Radius: {selectedElement.style.borderRadius || 0}px</Label>
                                                <Slider
                                                    value={[selectedElement.style.borderRadius || 0]}
                                                    onValueChange={([value]) => updateElement(selectedPageId, selectedElement.id, { 
                                                        style: { ...selectedElement.style, borderRadius: value }
                                                    })}
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>Select an element to edit its properties</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
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
                                <div key={page.id} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 p-3 border-b">
                                        <h3 className="font-medium">{page.title}</h3>
                                    </div>
                                    <div 
                                        className="relative"
                                        style={{ 
                                            width: '100%',
                                            height: '400px',
                                            background: page.background?.gradient || page.background?.color || '#FFFFFF',
                                            transform: 'scale(0.3)',
                                            transformOrigin: 'top left'
                                        }}
                                    >
                                        {page.elements.map((element) => (
                                            <div
                                                key={element.id}
                                                className="absolute"
                                                style={{
                                                    left: element.position.x,
                                                    top: element.position.y,
                                                    width: element.size.width,
                                                    height: element.size.height,
                                                    fontSize: element.style.fontSize,
                                                    fontFamily: element.style.fontFamily,
                                                    fontWeight: element.style.fontWeight,
                                                    color: element.style.color,
                                                    backgroundColor: element.style.backgroundColor,
                                                    textAlign: element.style.alignment,
                                                    padding: element.style.padding,
                                                    borderRadius: element.style.borderRadius,
                                                    opacity: element.style.opacity,
                                                    transform: `rotate(${element.style.rotation || 0}deg)`
                                                }}
                                            >
                                                {element.content}
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
