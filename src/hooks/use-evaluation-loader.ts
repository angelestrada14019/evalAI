'use client'

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { backend } from "@/services/backend/backend";
import { createDefaultTemplate } from "@/components/evaluations/builder/question-types";
import type { FormTemplate } from "@/components/evaluations/builder/types";
import { useFormBuilder } from "@/context/form-builder-context";

export const useEvaluationLoader = (evaluationId: string) => {
    const [template, setTemplate] = useState<FormTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const t = useTranslations('FormBuilderPage');
    const tq = useTranslations('QuestionTypes');
    const context = useFormBuilder();

    useEffect(() => {
        const loadEvaluation = async () => {
            setIsLoading(true);
            const isNewEvaluation = evaluationId.startsWith('new_');

            try {
                if (isNewEvaluation) {
                    if (context.template) {
                        setTemplate(context.template);
                    } else {
                        setTemplate(createDefaultTemplate(t, tq));
                    }
                } else {
                    const existingEvaluation = await backend().getEvaluationById(evaluationId);
                    if (existingEvaluation) {
                        setTemplate(existingEvaluation);
                    } else {
                        console.error(`Evaluation with id ${evaluationId} not found.`);
                        router.push('/evaluations');
                    }
                }
            } catch (error) {
                 console.error("Failed to load evaluation:", error);
                 router.push('/evaluations');
            } finally {
                setIsLoading(false);
            }
        };

        loadEvaluation();
    }, [evaluationId, router, t, tq, context.template]);

    return { template, isLoading };
};
