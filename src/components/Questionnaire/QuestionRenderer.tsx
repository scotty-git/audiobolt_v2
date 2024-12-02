import React from 'react';
import { Question } from '../../types';

interface QuestionRendererProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={question.type}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.validation.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            min={question.validation.minValue}
            max={question.validation.maxValue}
            step={question.validation.step}
            placeholder={question.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.validation.required}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.validation.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option.value);
                    } else {
                      const index = newValue.indexOf(option.value);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    onChange(newValue);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={value === option.value}
                  onChange={(e) => onChange(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'long_text':
        return (
          <textarea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.validation.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.validation.required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {question.text}
          {question.validation.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.description && (
          <span className="text-sm text-gray-500">{question.description}</span>
        )}
      </div>
      {renderInput()}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};