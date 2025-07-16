
'use server';
/**
 * @fileOverview Mock implementation of the BackendService for development and testing.
 */
import type { DashboardStats, Evaluation, FormTemplate } from './types';
import { v4 as uuidv4 } from 'uuid';

const MOCK_EVALUATIONS_LIST: Evaluation[] = [
    { id: 'eval_001', title: 'Q3 2024 Engineering Performance Review', status: 'Active', responses: 45, lastModified: '2024-07-15T10:00:00Z' },
    { id: 'eval_002', title: 'New Hire Onboarding Survey', status: 'Active', responses: 120, lastModified: '2024-07-12T14:30:00Z' },
    { id: 'eval_003', title: 'UX/UI Design Competency Matrix', status: 'Draft', responses: 0, lastModified: '2024-07-18T09:00:00Z' },
    { id: 'eval_004', title: 'Sales Team Q2 Skills Assessment', status: 'Archived', responses: 88, lastModified: '2024-06-28T17:00:00Z' },
    { id: 'eval_005', title: 'Annual Employee Satisfaction Poll', status: 'Active', responses: 350, lastModified: '2024-07-01T11:00:00Z' },
];

const MOCK_FULL_EVALUATIONS: { [key: string]: FormTemplate } = {
    'eval_001': {
        id: 'eval_001',
        title: 'Q3 2024 Engineering Performance Review',
        description: 'A comprehensive review of engineering performance for the third quarter.',
        items: [
            // Simplified version for the mock
            { id: uuidv4(), type: 'Rating Scale', label: 'Code Quality', variableId: 'code_quality', required: true, ratingConfig: { max: 5 } },
            { id: uuidv4(), type: 'Rating Scale', label: 'Team Collaboration', variableId: 'team_collab', required: true, ratingConfig: { max: 5 } },
            { id: uuidv4(), type: 'Text Input', label: 'General Feedback', variableId: 'feedback', required: false },
        ]
    },
    'eval_004': {
        id: 'eval_004',
        title: 'Sales Team Q2 Skills Assessment',
        description: 'Assessing the skills of the sales team for the second quarter.',
        items: [
            { id: uuidv4(), type: 'Slider', label: 'Negotiation Skills', variableId: 'negotiation_skills', required: true, sliderConfig: { min: 1, max: 10, step: 1 } },
            { id: uuidv4(), type: 'Multiple Choice', label: 'Product Knowledge', variableId: 'product_knowledge', required: true, options: [
                { id: uuidv4(), label: 'Needs Improvement', value: 1 },
                { id: uuidv4(), label: 'Meets Expectations', value: 2 },
                { id: uuidv4(), label: 'Exceeds Expectations', value: 3 },
            ] },
            { id: uuidv4(), type: 'Text Input', label: 'Client Feedback Highlights', variableId: 'client_feedback', required: false },
        ]
    }
};


export async function getDashboardStats(): Promise<DashboardStats> {
    console.log('[Backend Mock] Fetching dashboard stats');
    
    return {
        totalEvaluations: { value: 1257, change: "+20.1% from last month" },
        avgScore: { value: 82.4, change: "+2.1 from last month" },
        activeForms: { value: 12, change: "+2 since last week" },
        responseRate: { value: "94%", change: "-1.2% from last month" },
    };
}

export async function getEvaluations(): Promise<Evaluation[]> {
    console.log('[Backend Mock] Fetching evaluations list');
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return MOCK_EVALUATIONS_LIST;
}

export async function getEvaluationById(id: string): Promise<FormTemplate | null> {
    console.log(`[Backend Mock] Fetching evaluation by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const evaluation = MOCK_FULL_EVALUATIONS[id] || null;
    return evaluation;
}

export async function saveEvaluation(template: FormTemplate): Promise<FormTemplate> {
    console.log(`[Backend Mock] Saving evaluation: ${template.title}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const isNew = !template.id || template.id.startsWith('new_');
    
    if (isNew) {
        // This is a new evaluation, create a new ID
        const newId = `eval_${String(Object.keys(MOCK_FULL_EVALUATIONS).length + 1).padStart(3, '0')}`;
        const newTemplate = { ...template, id: newId };
        MOCK_FULL_EVALUATIONS[newId] = newTemplate;
        
        MOCK_EVALUATIONS_LIST.unshift({
            id: newId,
            title: newTemplate.title,
            status: 'Draft',
            responses: 0,
            lastModified: new Date().toISOString(),
        });
        
        console.log(`[Backend Mock] Created new evaluation with ID: ${newId}`);
        return newTemplate;

    } else {
        // This is an existing evaluation, update it
        MOCK_FULL_EVALUATIONS[template.id] = template;
        
        const listItem = MOCK_EVALUATIONS_LIST.find(e => e.id === template.id);
        if (listItem) {
            listItem.title = template.title;
            listItem.lastModified = new Date().toISOString();
        }
        
        console.log(`[Backend Mock] Updated evaluation with ID: ${template.id}`);
        return template;
    }
}
