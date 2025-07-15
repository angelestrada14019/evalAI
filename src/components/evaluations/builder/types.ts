
export interface FormItem {
  id: string;
  type: string;
  label: string;
  required: boolean;
  imageUrl?: string | null;
  // Specific configurations
  options?: string[];
  sliderConfig?: { min: number; max: number; step: number };
  ratingConfig?: { max: number };
}

export interface FormTemplate {
  title: string;
  description: string;
  items: FormItem[];
}

    