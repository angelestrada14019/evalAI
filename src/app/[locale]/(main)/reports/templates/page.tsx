'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { AdvancedReportBuilder } from '@/components/reports/template-builder/advanced-report-builder';
import { backend } from '@/services/backend/backend';
import { useTenant } from '@/context/tenant-context';
import type { ReportTemplate, Evaluation } from '@/services/backend/types';

export default function ReportTemplatesPage() {
    const t = useTranslations('ReportBuilder');
    const { currentTenant } = useTenant();
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [currentTenant]);

    const loadData = async () => {
        if (!currentTenant) return;
        
        setIsLoading(true);
        try {
            const [templatesData, evaluationsData] = await Promise.all([
                backend().getReportTemplates(currentTenant.id),
                backend().getEvaluations(currentTenant.id)
            ]);
            setTemplates(templatesData);
            setEvaluations(evaluationsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTemplate = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setSelectedTemplate(null);
        setIsBuilderOpen(true);
    };

    const handleEditTemplate = (template: ReportTemplate) => {
        const evaluation = evaluations.find(e => e.id === template.evaluationId);
        if (evaluation) {
            setSelectedEvaluation(evaluation);
            setSelectedTemplate(template);
            setIsBuilderOpen(true);
        }
    };

    const handleSaveTemplate = (template: ReportTemplate) => {
        setTemplates(prev => {
            const existing = prev.find(t => t.id === template.id);
            if (existing) {
                return prev.map(t => t.id === template.id ? template : t);
            } else {
                return [...prev, template];
            }
        });
        setIsBuilderOpen(false);
        setSelectedTemplate(null);
        setSelectedEvaluation(null);
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!currentTenant) return;
        
        try {
            await backend().deleteReportTemplate(currentTenant.id, templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    if (isBuilderOpen && selectedEvaluation) {
        return (
            <AdvancedReportBuilder
                evaluation={selectedEvaluation}
                template={selectedTemplate || undefined}
                onSave={handleSaveTemplate}
                onCancel={() => {
                    setIsBuilderOpen(false);
                    setSelectedTemplate(null);
                    setSelectedEvaluation(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('reportTemplates')}</h1>
                    <p className="text-muted-foreground">
                        {t('manageTemplates')}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Evaluations Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {t('createTemplateFor')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {evaluations.map((evaluation) => (
                                    <Card key={evaluation.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <h3 className="font-medium">{evaluation.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {evaluation.description || 'No description'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        {evaluation.responses} {t('responses')}
                                                    </span>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleCreateTemplate(evaluation)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        {t('createTemplate')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Existing Templates Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('existingTemplates')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {templates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('noTemplatesYet')}
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {templates.map((template) => {
                                        const evaluation = evaluations.find(e => e.id === template.evaluationId);
                                        return (
                                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-medium">{template.name}</h3>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEditTemplate(template)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            For: {evaluation?.title || t('unknownEvaluation')}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                                                                {template.type}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {template.pages?.length || 0} {t('pages')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
