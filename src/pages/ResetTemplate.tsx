import React, { useState } from 'react';
import { templateRepository } from '../db/repositories';
import { useNavigate } from 'react-router-dom';

export const ResetTemplate: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      setStatus('loading');
      setError(null);
      const result = await templateRepository.resetDefaultTemplate();
      console.log('Reset template result:', result);
      
      // Verify the template was saved correctly
      const template = await templateRepository.findDefaultOnboarding();
      console.log('Loaded template after reset:', template);
      console.log('Template content:', JSON.parse(template?.content || '{}'));
      
      setStatus('success');
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/onboarding/user');
      }, 2000);
    } catch (err) {
      console.error('Error resetting template:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Reset Default Template</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleReset}
          disabled={status === 'loading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Resetting...' : 'Reset Template'}
        </button>

        {status === 'success' && (
          <div className="p-4 bg-green-100 text-green-700 rounded-md">
            Template reset successfully! Redirecting to onboarding page...
          </div>
        )}

        {status === 'error' && error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}; 