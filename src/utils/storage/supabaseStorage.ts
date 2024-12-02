import { templateRepository } from '../../repositories/templateRepository';
import { progressRepository } from '../../repositories/progressRepository';
import { responseRepository } from '../../repositories/responseRepository';
import { DatabaseError } from '../../repositories/errors';
import { Template, Progress, Response } from '../../lib/supabase';
import { OnboardingFlow, UserProgress } from '../../types/onboarding';

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCache<T>(type: string, id: string): T | null {
  const key = `${type}:${id}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache(type: string, id: string, data: any): void {
  const key = `${type}:${id}`;
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(type: string, id: string): void {
  const key = `${type}:${id}`;
  cache.delete(key);
}

// Template-specific functions
export const saveOnboardingFlow = async (flow: OnboardingFlow): Promise<void> => {
  try {
    await templateRepository.update(flow.id, {
      title: flow.title,
      type: 'onboarding',
      content: JSON.stringify(flow),
      is_default: flow.isDefault,
      status: flow.status,
      updated_at: new Date().toISOString(),
      version: flow.version,
      category: flow.metadata?.category,
      tags: flow.metadata?.tags
    });
    clearCache('onboarding', flow.id);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to save onboarding flow', error);
  }
};

export const loadOnboardingFlow = async (flowId: string): Promise<OnboardingFlow | null> => {
  try {
    // Check cache first
    const cached = getCache<OnboardingFlow>('onboarding', flowId);
    if (cached) return cached;

    const template = await templateRepository.findById(flowId);
    if (!template || template.type !== 'onboarding') return null;

    // Parse the content
    const flow = JSON.parse(template.content) as OnboardingFlow;
    
    // Cache the result
    setCache('onboarding', flowId, flow);
    return flow;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to load onboarding flow', error);
  }
};

// Progress-specific functions
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await progressRepository.update(progress.userId, {
      user_id: progress.userId,
      template_id: progress.flowId,
      completed_sections: progress.progress.completedSections,
      skipped_sections: progress.progress.skippedSections,
      current_section_id: progress.progress.currentSectionId,
      last_updated: new Date().toISOString()
    });
    clearCache('progress', `${progress.userId}:${progress.flowId}`);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to save user progress', error);
  }
};

export const loadUserProgress = async (userId: string, flowId: string): Promise<UserProgress | null> => {
  try {
    // Check cache first
    const cached = getCache<UserProgress>('progress', `${userId}:${flowId}`);
    if (cached) return cached;

    const progress = await progressRepository.findByUserAndTemplate(userId, flowId);
    if (!progress) return null;

    // Convert from database model to application model
    const userProgress: UserProgress = {
      userId: progress.user_id,
      flowId: progress.template_id,
      progress: {
        completedSections: progress.completed_sections,
        skippedSections: progress.skipped_sections,
        currentSectionId: progress.current_section_id,
        lastUpdated: progress.last_updated
      },
      responses: [], // We'll need to load responses separately
      metadata: {
        startedAt: progress.last_updated,
        lastUpdated: progress.last_updated,
        deviceInfo: 'unknown',
        userAgent: 'unknown'
      }
    };

    // Cache the result
    setCache('progress', `${userId}:${flowId}`, userProgress);
    return userProgress;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to load user progress', error);
  }
};

// Offline support
let offlineQueue: Array<{
  type: 'template' | 'onboarding' | 'progress';
  operation: 'save' | 'delete';
  data: any;
}> = [];

export const processOfflineQueue = async (): Promise<void> => {
  const queue = [...offlineQueue];
  offlineQueue = [];

  for (const item of queue) {
    try {
      switch (item.type) {
        case 'template':
          if (item.operation === 'save') {
            await saveTemplate(item.data);
          }
          break;
        case 'onboarding':
          if (item.operation === 'save') {
            await saveOnboardingFlow(item.data);
          }
          break;
        case 'progress':
          if (item.operation === 'save') {
            await saveUserProgress(item.data);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to process offline item:', error);
      offlineQueue.push(item); // Re-queue failed items
    }
  }
};

// Export cache utilities
export const cache_utils = {
  clear: clearCache,
  clearType: (type: string) => clearCache(type),
  clearItem: (type: string, id: string) => clearCache(type, id)
}; 