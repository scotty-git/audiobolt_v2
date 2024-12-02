import React from 'react';
import { Question } from '../../../types';

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  value,
  onChange,
}) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <input
            id={question.id}
            type={question.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={question.placeholder || 'Type your answer here...'}
            required={question.validation.required}
          />
        );

      case 'number':
        return (
          <input
            id={question.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            min={question.validation.minValue}
            max={question.validation.maxValue}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={question.placeholder || 'Enter a number...'}
            required={question.validation.required}
          />
        );
      
      case 'select':
        return (
          <select
            id={question.id}
            value={value || ''}
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
      
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  id={`${question.id}-${option.value}`}
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  required={question.validation.required}
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  id={`${question.id}-${option.value}`}
                  type="checkbox"
                  value={option.value}
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.validation.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}; 