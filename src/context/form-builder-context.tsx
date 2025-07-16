'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';
import type { FormItem, FormTemplate } from '@/components/evaluations/builder/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname } from 'next/navigation';

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
    isContextLoading: boolean;
    setIsContextLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
    isContextLoading: true,
    setIsContextLoading: () => {},
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
    const [isContextLoading, setIsContextLoading] = useState(true);
    const pathname = usePathname();
    
    useEffect(() => {
        // When the user navigates away from the builder, clear the template.
        // This ensures that stale data isn't carried over.
        if (!pathname.includes('/build')) {
            setTemplate(null);
            setSelectedQuestion(null);
        }
    }, [pathname]);


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
        isContextLoading,
        setIsContextLoading,
    };

    return (
        <FormBuilderContext.Provider value={value}>
            {children}
        </FormBuilderContext.Provider>
    );
};
