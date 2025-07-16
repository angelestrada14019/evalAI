
'use client'

import { ListChecks, Pilcrow, SlidersHorizontal, Star, Table, Upload, Heading1 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid';
import type { FormItem, FormTemplate } from "./types"

export const questionTypes = [
  { type: "Multiple Choice", icon: ListChecks, idPrefix: 'opcion' },
  { type: "Text Input", icon: Pilcrow, idPrefix: 'texto' },
  { type: "Slider", icon: SlidersHorizontal, idPrefix: 'deslizador' },
  { type: "Rating Scale", icon: Star, idPrefix: 'puntuacion' },
  { type: "Section Header", icon: Heading1, idPrefix: 'seccion' },
  { type: "Matrix Table", icon: Table, idPrefix: 'matriz' },
  { type: "File Upload", icon: Upload, idPrefix: 'archivo' },
];

const generateVariableId = (type: string, existingItems: FormItem[] = []): string => {
    const questionTypeInfo = questionTypes.find(q => q.type === type);
    const prefix = questionTypeInfo ? questionTypeInfo.idPrefix : 'pregunta';
    
    let counter = 1;
    let newId = `${prefix}_${counter}`;
    
    // Ensure the generated ID is unique within the form
    while (existingItems.some(item => item.variableId === newId)) {
        counter++;
        newId = `${prefix}_${counter}`;
    }
    
    return newId;
}


export const getNewFormItem = (type: string, t: any, tq: any, existingItems: FormItem[] = [], label?: string): FormItem => {
  const defaultLabel = label || t('newQuestionLabel', { type: tq(type as any) });
  const itemId = uuidv4();

  const baseItem: Omit<FormItem, 'variableId' | 'type'> = {
    id: itemId,
    label: defaultLabel,
    required: false,
    readOnly: false,
    imageUrl: null,
  };

  const itemWithType = { ...baseItem, type };
  const variableId = generateVariableId(itemWithType.type, existingItems);
  
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
    
    let currentItems: FormItem[] = [];
    const firstNameItem = getNewFormItem('Text Input', t, tq, currentItems, 'Nombre');
    firstNameItem.variableId = 'nombre';
    currentItems.push({ ...firstNameItem, required: true, readOnly: true });

    const lastNameItem = getNewFormItem('Text Input', t, tq, currentItems, 'Apellido');
    lastNameItem.variableId = 'apellido';
    currentItems.push({ ...lastNameItem, required: true, readOnly: true });

    const emailItem = getNewFormItem('Text Input', t, tq, currentItems, 'Correo Electrónico');
    emailItem.variableId = 'email';
    currentItems.push({ ...emailItem, required: true, readOnly: true });

    return {
        title: "New Evaluation",
        description: "Start building your form.",
        items: currentItems
    };
};
