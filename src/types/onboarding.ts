import { z } from 'zod';

// Base schemas
export const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  isOptional: z.boolean(),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'choice', 'multiChoice']),
    text: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })),
});

export const onboardingFlowSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.literal('onboarding'),
  status: z.enum(['draft', 'published', 'archived']),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.string(),
  sections: z.array(sectionSchema),
  settings: z.object({
    allowSkipSections: z.boolean(),
    requireAllSections: z.boolean(),
    showProgressBar: z.boolean(),
    allowSaveProgress: z.boolean(),
  }),
  metadata: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createdBy: z.string().optional(),
    lastModifiedBy: z.string().optional(),
  }).optional(),
});

export const responseSchema = z.object({
  questionId: z.string(),
  value: z.any(),
  timestamp: z.string(),
});

export const userProgressSchema = z.object({
  userId: z.string(),
  flowId: z.string(),
  progress: z.object({
    completedSections: z.array(z.string()),
    skippedSections: z.array(z.string()),
    currentSectionId: z.string().optional(),
    lastUpdated: z.string(),
  }),
  responses: z.array(responseSchema),
  metadata: z.object({
    startedAt: z.string(),
    lastUpdated: z.string(),
    completedAt: z.string().optional(),
    deviceInfo: z.string(),
    userAgent: z.string(),
  }),
});

// Type definitions
export type Section = z.infer<typeof sectionSchema>;
export type OnboardingFlow = z.infer<typeof onboardingFlowSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type Response = z.infer<typeof responseSchema>;