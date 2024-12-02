export interface Template {
  id: string;
  title: string;
  type: 'onboarding' | 'questionnaire';
  content: Record<string, unknown>;
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  version: string;
  category?: string;
  tags?: string[];
  user_id: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'number' | 'text' | 'email' | 'select' | 'radio' | 'checkbox' | 'slider' | 'long_text';
  validation: {
    required: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
    step?: number;
    minSelected?: number;
  };
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  isOptional: boolean;
  questions: Question[];
}

export interface Response {
  id: string;
  template_id: string;
  user_id: string;
  answers: string | Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  last_updated: string;
  metadata?: Record<string, unknown>;
} 