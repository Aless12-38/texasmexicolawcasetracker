import React from 'react';
import { X } from 'lucide-react';
import { Case, CaseVersion } from '../types';

interface VersionHistoryModalProps {
  caseData: Case;
  versions: CaseVersion[];
  onRestore: (caseId: string, version: number) => void;
  
  onClose: () => void;
  darkMode: boolean;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  caseData,
  versions,
  onRestore,
  onClose,
  darkMode,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-lg ${
        darkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-opacity-10 border-white">
          <div>
            <h2 className="text-xl font-bold">Version History</h2>
            <p className="text-sm opacity-75">
              {caseData.clientName} - Case #{caseData.caseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {versions.length === 0 ? (
            <p className="text-center opacity-75">No version history available</p>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.timestamp}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-neutral-700' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">
                      {new Date(version.timestamp).toLocaleString()}
                    </p>
                    <button
                      onClick={() => onRestore(caseData.id, index)}
                      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
                    >
                      Restore
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="opacity-75">Next Step:</span>{' '}
                      {version.data.nextStep || 'None'}
                    </p>
                    <p>
                      <span className="opacity-75">Follow Up:</span>{' '}
                      {version.data.followUp || 'None'}
                    </p>
                    <p>
                      <span className="opacity-75">Checklist Items Completed:</span>{' '}
                      {Object.values(version.data.checklist).filter(item => item.checked).length}/
                      {Object.values(version.data.checklist).length}
                    </p>
                    <p>
                      <span className="opacity-75">Transcripts Completed:</span>{' '}
                      {version.data.transcripts.videos.items.filter(i => i.completed).length +
                        version.data.transcripts.audio.items.filter(i => i.completed).length}/
                      {version.data.transcripts.videos.items.length +
                        version.data.transcripts.audio.items.length}
                    </p>
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

export default VersionHistoryModal;