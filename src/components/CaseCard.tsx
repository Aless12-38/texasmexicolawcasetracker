import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Printer, History } from 'lucide-react';
import { Case, ViewMode } from '../types';
import ProgressBar from './ProgressBar';
import TranscriptSection from './TranscriptSection';
import PrintModal from './PrintModal';

interface CaseCardProps {
  caseData: Case;
  viewMode: ViewMode;
  updateCase: (updatedCase: Case) => void;
  onEdit: (caseData: Case) => void;
  onDelete: (caseData: Case) => void;
  onViewHistory: (caseData: Case) => void;
  darkMode: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  viewMode,
  updateCase,
  onEdit,
  onDelete,
  onViewHistory,
  darkMode
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const calculateProgress = () => {
    const checklistCount = Object.keys(caseData.checklist).length;
    const completedChecklist = Object.values(caseData.checklist).filter(item => item.checked).length;
    const checklistProgress = (completedChecklist / checklistCount) * 0.7;

    const totalTranscripts = caseData.transcripts.videos.items.length + caseData.transcripts.audio.items.length;
    const completedTranscripts = 
      caseData.transcripts.videos.items.filter(item => item.completed).length +
      caseData.transcripts.audio.items.filter(item => item.completed).length;
    const transcriptProgress = totalTranscripts > 0 ? (completedTranscripts / totalTranscripts) * 0.3 : 0;

    return Math.round((checklistProgress + transcriptProgress) * 100);
  };

  const handleChecklistChange = (key: keyof typeof caseData.checklist, checked: boolean) => {
    updateCase({
      ...caseData,
      checklist: {
        ...caseData.checklist,
        [key]: { ...caseData.checklist[key], checked }
      }
    });
  };

  const handleNoteChange = (key: keyof typeof caseData.checklist, notes: string) => {
    updateCase({
      ...caseData,
      checklist: {
        ...caseData.checklist,
        [key]: { ...caseData.checklist[key], notes }
      }
    });
  };

  if (viewMode === 'list') {
    return (
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        darkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold">{caseData.clientName}</h3>
                  <p className="text-sm opacity-75">Case #{caseData.caseNumber}</p>
                </div>
                <div className="flex-1">
                  <div className="w-full max-w-xs">
                    <ProgressBar progress={calculateProgress()} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewHistory(caseData)}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
                }`}
                title="View history"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
                }`}
                title="Print case"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(caseData)}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
                }`}
                title="Edit case"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(caseData)}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
                }`}
                title="Delete case"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className={`p-1.5 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
                }`}
              >
                {expanded ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-75">Offense</p>
                  <p>{caseData.offense}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Court</p>
                  <p>{caseData.court}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Court Date</p>
                  <p>{new Date(caseData.courtDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-75 mb-1">Next Step / Important</p>
                  <div className={`w-full px-3 py-2 rounded-lg ${
                    darkMode ? 'bg-neutral-700' : 'bg-gray-100'
                  }`}>
                    <p>{caseData.nextStep || 'No next steps specified'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm opacity-75 mb-1">To Follow Up / To Do</p>
                  <div className={`w-full px-3 py-2 rounded-lg ${
                    darkMode ? 'bg-neutral-700' : 'bg-gray-100'
                  }`}>
                    <p>{caseData.followUp || 'No follow-up items'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(caseData.checklist).map(([key, item]) => (
                  <div key={key} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => handleChecklistChange(key as keyof typeof caseData.checklist, e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{key}</p>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleNoteChange(key as keyof typeof caseData.checklist, e.target.value)}
                        placeholder="Add notes..."
                        className={`w-full mt-1 px-2 py-1 rounded ${
                          darkMode
                            ? 'bg-neutral-700 border-neutral-600'
                            : 'bg-gray-100 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <TranscriptSection
                transcripts={caseData.transcripts}
                updateTranscripts={(transcripts) => updateCase({ ...caseData, transcripts })}
                darkMode={darkMode}
              />
            </div>
          )}
        </div>

        {showPrintModal && (
          <PrintModal
            cases={[caseData]}
            selectedCase={caseData}
            onClose={() => setShowPrintModal(false)}
            darkMode={darkMode}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${
      darkMode ? 'bg-neutral-800' : 'bg-white'
    }`}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{caseData.clientName}</h3>
            <p className="text-sm opacity-75">Case #{caseData.caseNumber}</p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              onClick={() => onViewHistory(caseData)}
              className={`p-1.5 rounded-lg ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
              }`}
              title="View history"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className={`p-1.5 rounded-lg ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
              }`}
              title="Print case"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(caseData)}
              className={`p-1.5 rounded-lg ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
              }`}
              title="Edit case"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(caseData)}
              className={`p-1.5 rounded-lg ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
              }`}
              title="Delete case"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-1.5 rounded-lg ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
              }`}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <ProgressBar progress={calculateProgress()} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-75">Offense</p>
            <p>{caseData.offense}</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Court</p>
            <p>{caseData.court}</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Court Date</p>
            <p>{new Date(caseData.courtDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm opacity-75 mb-1">Next Step / Important</p>
            <div className={`w-full px-3 py-2 rounded-lg ${
              darkMode
                ? 'bg-neutral-700'
                : 'bg-gray-100'
            }`}>
              <p className={`${expanded ? '' : 'line-clamp-2'}`}>
                {caseData.nextStep || 'No next steps specified'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm opacity-75 mb-1">To Follow Up / To Do</p>
            <div className={`w-full px-3 py-2 rounded-lg ${
              darkMode
                ? 'bg-neutral-700'
                : 'bg-gray-100'
            }`}>
              <p className={`${expanded ? '' : 'line-clamp-2'}`}>
                {caseData.followUp || 'No follow-up items'}
              </p>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              {Object.entries(caseData.checklist).map(([key, item]) => (
                <div key={key} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleChecklistChange(key as keyof typeof caseData.checklist, e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{key}</p>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleNoteChange(key as keyof typeof caseData.checklist, e.target.value)}
                      placeholder="Add notes..."
                      className={`w-full mt-1 px-2 py-1 rounded ${
                        darkMode
                          ? 'bg-neutral-700 border-neutral-600'
                          : 'bg-gray-100 border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <TranscriptSection
              transcripts={caseData.transcripts}
              updateTranscripts={(transcripts) => updateCase({ ...caseData, transcripts })}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      {showPrintModal && (
        <PrintModal
          cases={[caseData]}
          selectedCase={caseData}
          onClose={() => setShowPrintModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default CaseCard;