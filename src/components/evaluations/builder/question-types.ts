
'use client'

import { ListChecks, Pilcrow, SlidersHorizontal, Star, Table, Upload, Heading1 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid';
import type { FormItem } from "./types"

export const questionTypes = [
  { type: "Multiple Choice", icon: ListChecks },
  { type: "Text Input", icon: Pilcrow },
  { type: "Slider", icon: SlidersHorizontal },
  { type: "Rating Scale", icon: Star },
  { type: "Section Header", icon: Heading1 },
  { type: "Matrix Table", icon: Table },
  { type: "File Upload", icon: Upload },
];

export const getNewFormItem = (type: string, t: any, tq: any): FormItem => {
  const baseItem = {
    id: uuidv4(),
    type: type,
    label: t('newQuestionLabel', { type: tq(type as any) }),
    required: false,
    imageUrl: null,
  };

  switch (type) {
    case 'Multiple Choice':
      return {
        ...baseItem,
        options: ['Option 1', 'Option 2']
      };
    case 'Slider':
      return {
        ...baseItem,
        sliderConfig: { min: 0, max: 100, step: 1 }
      };
    case 'Rating Scale':
      return {
        ...baseItem,
        ratingConfig: { max: 5 }
      };
    case 'Matrix Table':
      return {
        ...baseItem,
        matrixConfig: {
            rows: ['Quality', 'Speed'],
            columns: ['Poor', 'Average', 'Good', 'Excellent']
        }
      };
    case 'File Upload':
        return {
            ...baseItem,
            fileUploadConfig: {
                allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                maxSizeMB: 100,
            }
        }
    default:
      return baseItem;
  }
};
