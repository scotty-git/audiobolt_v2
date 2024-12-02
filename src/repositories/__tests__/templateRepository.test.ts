import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateRepository } from '../templateRepository';
import { DatabaseError } from '../errors';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('templateRepository', () => {
  const mockTemplate = {
    id: 'test-1',
    title: 'Test Template',
    type: 'onboarding' as const,
    content: '{}',
    is_default: false,
    status: 'draft' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0.0',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a template successfully', async () => {
      const mockResult = {
        data: mockTemplate,
        error: null,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await templateRepository.create(mockTemplate);
      expect(result).toEqual(mockTemplate);
      expect(supabase.from).toHaveBeenCalledWith('templates');
    });

    it('should throw DatabaseError if creation fails', async () => {
      const mockError = new Error('Database error');
      const mockResult = {
        data: null,
        error: mockError,
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(templateRepository.create(mockTemplate)).rejects.toThrow(DatabaseError);
      await expect(templateRepository.create(mockTemplate)).rejects.toThrow('Failed to create template');
    });
  });

  describe('findById', () => {
    it('should find a template by id', async () => {
      const mockResult = {
        data: mockTemplate,
        error: null,
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await templateRepository.findById('test-1');
      expect(result).toEqual(mockTemplate);
    });

    it('should return null if template not found', async () => {
      const mockResult = {
        data: null,
        error: null,
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await templateRepository.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findByType', () => {
    it('should find templates by type', async () => {
      const mockResult = {
        data: [mockTemplate],
        error: null,
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await templateRepository.findByType('onboarding');
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('update', () => {
    it('should update a template successfully', async () => {
      const updatedTemplate = {
        ...mockTemplate,
        title: 'Updated Template',
      };

      const mockResult = {
        data: updatedTemplate,
        error: null,
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await templateRepository.update('test-1', { title: 'Updated Template' });
      expect(result).toEqual(updatedTemplate);
      expect(supabase.from).toHaveBeenCalledWith('templates');
    });

    it('should throw DatabaseError if update fails', async () => {
      const mockError = new Error('Database error');
      const mockResult = {
        data: null,
        error: mockError,
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(templateRepository.update('test-1', { title: 'Updated Template' }))
        .rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError if template not found', async () => {
      const mockResult = {
        data: null,
        error: null,
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResult),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(templateRepository.update('non-existent', { title: 'Updated Template' }))
        .rejects.toThrow('Template with id non-existent not found');
    });
  });
}); 