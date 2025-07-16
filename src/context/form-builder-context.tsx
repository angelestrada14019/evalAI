
'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import type { FormItem, FormTemplate } from '@/components/evaluations/builder/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from 'next-intl';
import { createDefaultTemplate } from '@/components/evaluations/builder/question-types';

interface FormBuilderContextType {
    template: FormTemplate | null;
    setTemplate: React.Dispatch<React.SetStateAction<FormTemplate | null>>;
    selectedQuestion: FormItem | null;
    setSelectedQuestion: React.Dispatch<React.SetStateAction<FormItem | null>>;
    isLargeScreen: boolean;
    isElementsSheetOpen: boolean;
    setIsElementsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isPropertiesSheetOpen: boolean;
    setIsPropertiesSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormBuilderContext = createContext<FormBuilderContextType>({
    template: null,
    setTemplate: () => {},
    selectedQuestion: null,
    setSelectedQuestion: () => {},
    isLargeScreen: true,
    isElementsSheetOpen: false,
    setIsElementsSheetOpen: () => {},
    isPropertiesSheetOpen: false,
    setIsPropertiesSheetOpen: () => {},
});

export const useFormBuilder = () => {
    const context = useContext(FormBuilderContext);
    if (!context) {
        throw new Error('useFormBuilder must be used within a FormBuilderProvider');
    }
    return context;
};

export const FormBuilderProvider = ({ children }: { children: React.ReactNode }) => {
    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<FormItem | null>(null);
    const isMobile = useIsMobile();
    const [isElementsSheetOpen, setIsElementsSheetOpen] = useState(false);
    const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);
    
    const t = useTranslations('FormBuilderPage');
    const tq = useTranslations('QuestionTypes');

    useEffect(() => {
        if (template === null) {
            setTemplate(createDefaultTemplate(t, tq));
        }
    }, [template, t, tq]);

    useEffect(() => {
        if (!isMobile) {
            setIsElementsSheetOpen(false);
            setIsPropertiesSheetOpen(false);
        }
    }, [isMobile]);

    const value = {
        template,
        setTemplate,
        selectedQuestion,
        setSelectedQuestion,
        isLargeScreen: !isMobile,
        isElementsSheetOpen,
        setIsElementsSheetOpen,
        isPropertiesSheetOpen,
        setIsPropertiesSheetOpen,
    };

    return (
        <FormBuilderContext.Provider value={value}>
            {children}
        </FormBuilderContext.Provider>
    );
};
