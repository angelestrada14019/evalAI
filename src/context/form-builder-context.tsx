'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { FormItem, FormTemplate } from '@/components/evaluations/builder/types';
import { useIsMobile } from '@/hooks/use-mobile';

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

export const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const useFormBuilder = () => {
    const context = useContext(FormBuilderContext);
    if (!context) {
        throw new Error('useFormBuilder must be used within a FormBuilderProvider');
    }
    return context;
};

interface FormBuilderProviderProps {
    children: ReactNode;
}

export const FormBuilderProvider = ({ children }: FormBuilderProviderProps) => {
    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<FormItem | null>(null);
    const isMobile = useIsMobile();
    const [isElementsSheetOpen, setIsElementsSheetOpen] = useState(false);
    const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);
    
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
