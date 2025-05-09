import React from 'react';
import CaseCard from './CaseCard';
import { Case, ViewMode } from '../types';
import { LayoutGrid, List } from 'lucide-react';

interface CaseListProps {
  cases: Case[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  updateCase: (updatedCase: Case) => void;
  onEdit: (caseData: Case) => void;
  onDelete: (caseData: Case) => void;
  onViewHistory: (caseData: Case) => void;
  darkMode: boolean;
}

const CaseList: React.FC<CaseListProps> = ({
  cases,
  viewMode,
  onViewModeChange,
  updateCase,
  onEdit,
  onDelete,
  onViewHistory,
  darkMode
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className={`inline-flex rounded-lg overflow-hidden ${
          darkMode ? 'bg-neutral-800' : 'bg-white'
        }`}>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-green-500 text-white'
                : darkMode
                ? 'hover:bg-neutral-700'
                : 'hover:bg-gray-100'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-green-500 text-white'
                : darkMode
                ? 'hover:bg-neutral-700'
                : 'hover:bg-gray-100'
            }`}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' 
        ? "grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
        : "space-y-4"
      }>
        {cases.map((caseItem) => (
          <CaseCard
            key={caseItem.id}
            caseData={caseItem}
            viewMode={viewMode}
            updateCase={updateCase}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
            darkMode={darkMode}
          />
        ))}
        {cases.length === 0 && (
          <div className={`col-span-full text-center py-8 rounded-lg ${
            darkMode ? 'bg-neutral-800' : 'bg-white'
          }`}>
            <p className="text-lg opacity-75">No cases found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;