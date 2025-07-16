
export interface Option {
  id: string;
  label: string;
  value: number;
}

export interface FormItem {
  id: string;
  variableId: string;
  type: string;
  label: string;
  required: boolean;
  readOnly?: boolean;
  imageUrl?: string | null;
  // Specific configurations
  options?: Option[];
  sliderConfig?: { min: number; max: number; step: number };
  ratingConfig?: { max: number };
  matrixConfig?: { rows: string[]; columns: Option[] };
  fileUploadConfig?: { allowedTypes: string[]; maxSizeMB: number };
}

export interface FormTemplate {
  id?: string | null; // Optional: will be null/undefined for new templates
  title: string;
  description: string;
  items: FormItem[];
}
