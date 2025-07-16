
'use client'

import { ListChecks, Pilcrow, SlidersHorizontal, Star, Table, Upload, Heading1 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid';
import type { FormItem, FormTemplate } from "./types"

export const questionTypes = [
  { type: "Multiple Choice", icon: ListChecks },
  { type: "Text Input", icon: Pilcrow },
  { type: "Slider", icon: SlidersHorizontal },
  { type: "Rating Scale", icon: Star },
  { type: "Section Header", icon: Heading1 },
  { type: "Matrix Table", icon: Table },
  { type: "File Upload", icon: Upload },
];

const generateVariableId = (label: string, existingIds: string[]): string => {
    const baseId = label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // remove special characters
        .replace(/\s+/g, '_') // replace spaces with underscores
        .substring(0, 50);

    let finalId = baseId;
    let counter = 1;
    while (existingIds.includes(finalId)) {
        finalId = `${baseId}_${counter}`;
        counter++;
    }
    return finalId;
}


export const getNewFormItem = (type: string, t: any, tq: any, existingItems: FormItem[] = [], label?: string): FormItem => {
  const defaultLabel = label || t('newQuestionLabel', { type: tq(type as any) });
  const existingVarIds = existingItems.map(item => item.variableId);

  const baseItem: Omit<FormItem, 'variableId' | 'type'> = {
    id: uuidv4(),
    label: defaultLabel,
    required: false,
    readOnly: false,
    imageUrl: null,
  };

  const itemWithType = { ...baseItem, type };
  const variableId = generateVariableId(itemWithType.label, existingVarIds);
  
  const finalBaseItem = { ...itemWithType, variableId };

  switch (type) {
    case 'Multiple Choice':
      return {
        ...finalBaseItem,
        options: [
            { id: uuidv4(), label: 'Option 1', value: 1 },
            { id: uuidv4(), label: 'Option 2', value: 2 }
        ]
      };
    case 'Rating Scale':
        return {
            ...finalBaseItem,
            ratingConfig: { max: 5 },
        }
    case 'Slider':
      return {
        ...finalBaseItem,
        sliderConfig: { min: 0, max: 100, step: 1 }
      };
    case 'Matrix Table':
      return {
        ...finalBaseItem,
        matrixConfig: {
            rows: ['Quality', 'Speed'],
            columns: [
                { id: uuidv4(), label: 'Poor', value: 1 },
                { id: uuidv4(), label: 'Average', value: 2 },
                { id: uuidv4(), label: 'Good', value: 3 },
            ]
        }
      };
    case 'File Upload':
        return {
            ...finalBaseItem,
            fileUploadConfig: {
                allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                maxSizeMB: 100,
            }
        }
    default:
      return finalBaseItem;
  }
};

export const createDefaultTemplate = (t: any, tq: any): FormTemplate => {
    const items: FormItem[] = [];
    
    const firstNameItem = getNewFormItem('Text Input', t, tq, items, 'Nombre');
    items.push({ ...firstNameItem, required: true, readOnly: true });

    const lastNameItem = getNewFormItem('Text Input', t, tq, items, 'Apellido');
    items.push({ ...lastNameItem, required: true, readOnly: true });

    const emailItem = getNewFormItem('Text Input', t, tq, items, 'Correo Electrónico');
    items.push({ ...emailItem, required: true, readOnly: true });

    return {
        title: "New Evaluation",
        description: "Start building your form.",
        items: items
    };
};
