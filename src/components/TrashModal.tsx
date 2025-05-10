import React from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import { Case } from '../types';

interface TrashModalProps {
  trash: Case[];
  restoreCase: (caseToRestore: Case) => void;
  permanentlyDeleteCase: (caseToDelete: Case) => void;
  onClose: () => void;
  darkMode: boolean;
}

const TrashModal: React.FC<TrashModalProps> = ({
  trash,
  restoreCase,
  permanentlyDeleteCase,
  onClose,
  darkMode,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-lg ${
        darkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-opacity-10 border-white">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-xl font-bold">Trash</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {trash.length === 0 ? (
            <p className="text-center opacity-75">Trash is empty</p>
          ) : (
            <div className="space-y-4">
              {trash.map(caseItem => (
                <div
                  key={caseItem.id}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-neutral-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{caseItem.client_name}</p>
                      <p className="text-sm opacity-75">Case #{caseItem.case_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreCase(caseItem)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => permanentlyDeleteCase(caseItem)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-75">
                    <p>Court Date: {new Date(caseItem.court_date).toLocaleDateString()}</p>
                    <p>Offense: {caseItem.offense}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrashModal;