import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Case, TabType } from '../types';

interface CaseFormProps {
  case?: Case | null;
  onSubmit: (caseData: Case) => void;
  onClose: () => void;
  darkMode: boolean;
  availableTabs: string[];
}

const CaseForm: React.FC<CaseFormProps> = ({
  case: editingCase,
  onSubmit,
  onClose,
  darkMode,
  availableTabs,
}) => {
  const [formData, setFormData] = useState<Partial<Case>>(
    editingCase || {
      type: availableTabs[0] as TabType,
      case_number: '',
      client_name: '',
      offense: '',
      court: '',
      court_date: '',
      next_step: '',
      follow_up: '',
      checklist: {
        DME: { checked: false, notes: '' },
        'Scan OCR': { checked: false, notes: '' },
        Organized: { checked: false, notes: '' },
        'Checklist DME': { checked: false, notes: '' },
        'Justice Text Added': { checked: false, notes: '' },
        Dropbox: { checked: false, notes: '' },
      },
      transcripts: {
        videos: {
          total: 0,
          items: [],
        },
        audio: {
          total: 0,
          items: [],
        },
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the form data
    const submissionData = { ...formData };
    
    // Convert empty court_date to null
    if (!submissionData.court_date) {
      submissionData.court_date = null;
    } else {
      // Ensure the date is in ISO format with timezone
      submissionData.court_date = new Date(submissionData.court_date).toISOString();
    }
    
    onSubmit(submissionData as Case);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className={`relative w-full max-w-2xl rounded-lg shadow-lg ${
          darkMode ? 'bg-neutral-800' : 'bg-white'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-opacity-10 border-white">
          <h2 className="text-xl font-bold">
            {editingCase ? 'Edit Case' : 'Add New Case'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TabType })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {availableTabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Case Number</label>
                <input
                  type="text"
                  value={formData.case_number}
                  onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Offense</label>
                <input
                  type="text"
                  value={formData.offense}
                  onChange={(e) => setFormData({ ...formData, offense: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Court</label>
                <input
                  type="text"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Court Date</label>
                <input
                  type="date"
                  value={formData.court_date}
                  onChange={(e) => setFormData({ ...formData, court_date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-neutral-700 border-neutral-600'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Next Step / Important</label>
              <textarea
                value={formData.next_step}
                onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                placeholder="Add next step or important notes..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-neutral-700 border-neutral-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">To Follow Up / To Do</label>
              <textarea
                value={formData.follow_up}
                onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
                placeholder="Add follow-up items or to-do tasks..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-neutral-700 border-neutral-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Checklist</h3>
              <div className="grid gap-4">
                {Object.entries(formData.checklist || {}).map(([key, item]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => setFormData({
                          ...formData,
                          checklist: {
                            ...formData.checklist,
                            [key]: { ...item, checked: e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <label>{key}</label>
                    </div>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => setFormData({
                        ...formData,
                        checklist: {
                          ...formData.checklist,
                          [key]: { ...item, notes: e.target.value }
                        }
                      })}
                      placeholder="Add notes..."
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? 'bg-neutral-700 border-neutral-600'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Transcripts</h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Videos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.transcripts?.videos.total || 0}
                    onChange={(e) => {
                      const total = Math.max(0, parseInt(e.target.value) || 0);
                      const items = Array(total).fill(null).map((_, i) => ({
                        id: crypto.randomUUID(),
                        completed: false
                      }));
                      setFormData({
                        ...formData,
                        transcripts: {
                          ...formData.transcripts,
                          videos: { total, items }
                        }
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-neutral-700 border-neutral-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Audio</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.transcripts?.audio.total || 0}
                    onChange={(e) => {
                      const total = Math.max(0, parseInt(e.target.value) || 0);
                      const items = Array(total).fill(null).map((_, i) => ({
                        id: crypto.randomUUID(),
                        completed: false
                      }));
                      setFormData({
                        ...formData,
                        transcripts: {
                          ...formData.transcripts,
                          audio: { total, items }
                        }
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-neutral-700 border-neutral-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 p-6 border-t border-opacity-10 border-white bg-inherit">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            {editingCase ? 'Save Changes' : 'Add Case'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;