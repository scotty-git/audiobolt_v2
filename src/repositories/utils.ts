import { PostgrestError, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { ValidationError } from './errors';

export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000;

export async function retry<T>(
  operation: () => Promise<PostgrestResponse<T>>
): Promise<PostgrestResponse<T>> {
  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const result = await operation();
      if (result.error) throw result.error;
      return result;
    } catch (error) {
      lastError = error as Error;
      attempts++;
      if (attempts < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      }
    }
  }

  throw lastError;
}

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateEnum<T extends string>(value: string, allowedValues: T[], fieldName: string): void {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
}

export function validateLength(value: string, min: number, max: number, fieldName: string): void {
  if (value.length < min || value.length > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max} characters`);
  }
}

export function validateDate(value: string, fieldName: string): void {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
}

export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }
}

export function handleSupabaseError(error: PostgrestError): never {
  switch (error.code) {
    case '23505': // Unique violation
      throw new ValidationError('A record with this identifier already exists');
    case '23503': // Foreign key violation
      throw new ValidationError('Referenced record does not exist');
    case '42P01': // Undefined table
      throw new Error('Database table not found');
    default:
      throw new Error(`Database error: ${error.message}`);
  }
} 