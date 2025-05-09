import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Case } from '../types';

interface DeleteConfirmationProps {
  case: Case;
  onConfirm: () => void;
  onCancel: () => void;
  darkMode: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  case: caseToDelete,
  onConfirm,
  onCancel,
  darkMode,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-lg shadow-lg p-6 ${
        darkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h2 className="text-xl font-bold">Delete Case</h2>
        </div>
        
        <p className="mb-4">
          Are you sure you want to delete the case for{' '}
          <span className="font-semibold">{caseToDelete.clientName}</span>?
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;