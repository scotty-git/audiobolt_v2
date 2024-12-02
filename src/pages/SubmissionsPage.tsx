import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Calendar, FileText, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { responseRepository } from '../db/repositories';
import { templateRepository } from '../db/repositories';
import { formatDate } from '../utils/dateUtils';
import { SubmissionDetails } from '../components/Submissions/SubmissionDetails';
import { EditSubmissionModal } from '../components/Submissions/EditSubmissionModal';
import { ExportButton } from '../components/Submissions/ExportButton';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { Template, Response } from '../types';

export const SubmissionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    response: Response;
    template: Template;
  } | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<{
    response: Response;
    template: Template;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [submissions, loadedTemplates] = await Promise.all([
          responseRepository.findAll(),
          templateRepository.findAll()
        ]);
        console.log('Loaded submissions:', submissions);
        console.log('Loaded templates:', loadedTemplates);
        setResponses(submissions);
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveEdit = async (updatedAnswers: Record<string, unknown>) => {
    if (!editingSubmission) return;

    try {
      const updatedResponse = await responseRepository.update(editingSubmission.response.id, {
        ...editingSubmission.response,
        answers: JSON.stringify(updatedAnswers)
      });

      setResponses(prev =>
        prev.map(r => (r.id === updatedResponse.id ? updatedResponse : r))
      );
      setEditingSubmission(null);
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission. Please try again.');
    }
  };

  const filteredResponses = responses.filter(response => {
    const template = templates.find(t => t.id === response.template_id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      template?.title.toLowerCase().includes(searchLower) ||
      formatDate(response.completed_at || '').toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (response: Response) => {
    try {
      await responseRepository.delete(response.id);
      setResponses(prev => prev.filter(r => r.id !== response.id));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Failed to delete submission. Please try again.');
    }
  };

  const handleExportSubmission = (submission: Response) => {
    try {
      const dataStr = JSON.stringify(submission, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `submission-${submission.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting submission:', error);
      alert('Failed to export submission');
    }
  };

  const renderSubmissionDetails = (submission: Response) => {
    try {
      // Parse answers if they're stored as a string
      const parsedAnswers = typeof submission.answers === 'string' 
        ? JSON.parse(submission.answers) 
        : submission.answers;

      console.log('Rendering submission details:', {
        submission,
        parsedAnswers
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {(submission.metadata as any)?.templateTitle || 'Untitled Submission'}
            </h2>
            <span className="text-sm text-gray-500">
              Submitted on {formatDate(submission.completed_at || submission.started_at || '')}
            </span>
          </div>

          {Object.entries(parsedAnswers).map(([questionId, answer]) => (
            <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{questionId}</h3>
              <p className="text-gray-700">
                {Array.isArray(answer) 
                  ? answer.join(', ')
                  : answer?.toString() || 'Not answered'}
              </p>
            </div>
          ))}

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleExportSubmission(submission)}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export as JSON
            </button>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering submission details:', error, submission);
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error displaying submission details. Please try again.
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Questionnaire Submissions
              </h1>
              <p className="text-gray-600">
                View and manage completed questionnaire responses
              </p>
            </div>
          </div>
          <ExportButton responses={responses} templates={templates} />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by template name or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                     placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No results match your search.' : 'Start by completing a questionnaire.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response) => {
                  const template = templates.find(t => t.id === response.template_id);
                  const answers = typeof response.answers === 'string' 
                    ? JSON.parse(response.answers)
                    : response.answers;
                    
                  return (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {response.template_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {template?.title || 'Unknown Template'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(response.completed_at || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {Object.keys(answers).length} answered
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSubmission({ response, template: template! })}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View submission"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            onClick={() => setEditingSubmission({ response, template: template! })}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit submission"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(response)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <SubmissionDetails
          response={selectedSubmission.response}
          template={selectedSubmission.template}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {editingSubmission && (
        <EditSubmissionModal
          response={editingSubmission.response}
          template={editingSubmission.template}
          onClose={() => setEditingSubmission(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteConfirmation && (
        <ConfirmationModal
          title="Delete Submission"
          message="Are you sure you want to delete this submission? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => handleDelete(deleteConfirmation)}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};