import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Case } from './types';
import Auth from './components/Auth';
import CaseList from './components/CaseList';
import CaseForm from './components/CaseForm';
import DeleteConfirmation from './components/DeleteConfirmation';
import TrashModal from './components/TrashModal';
import VersionHistoryModal from './components/VersionHistoryModal';
import { Scale, Plus, Moon, Sun, Trash2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [trash, setTrash] = useState<Case[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState('date-desc');
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [viewingHistory, setViewingHistory] = useState<Case | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchCases();
    }
  }, [session]);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error);
      return;
    }

    setCases(data || []);
  };

  const handleAddCase = async (newCase: Case) => {
    const { error } = await supabase
      .from('cases')
      .insert([{
        type: newCase.type,
        case_number: newCase.case_number,
        client_name: newCase.client_name,
        offense: newCase.offense,
        court: newCase.court,
        court_date: newCase.court_date,
        next_step: newCase.next_step,
        follow_up: newCase.follow_up,
        checklist: newCase.checklist,
        transcripts: newCase.transcripts
      }]);

    if (error) {
      console.error('Error adding case:', error);
      return;
    }

    setIsFormOpen(false);
    fetchCases();
  };

  const handleEditCase = async (updatedCase: Case) => {
    const { error } = await supabase
      .from('cases')
      .update({
        type: updatedCase.type,
        case_number: updatedCase.case_number,
        client_name: updatedCase.client_name,
        offense: updatedCase.offense,
        court: updatedCase.court,
        court_date: updatedCase.court_date,
        next_step: updatedCase.next_step,
        follow_up: updatedCase.follow_up,
        checklist: updatedCase.checklist,
        transcripts: updatedCase.transcripts
      })
      .eq('id', updatedCase.id);

    if (error) {
      console.error('Error updating case:', error);
      return;
    }

    setEditingCase(null);
    fetchCases();
  };

  const handleDeleteCase = async (caseToDelete: Case) => {
    const { error } = await supabase
      .from('cases')
      .update({ deleted: true })
      .eq('id', caseToDelete.id);

    if (error) {
      console.error('Error deleting case:', error);
      return;
    }

    setDeletingCase(null);
    fetchCases();
  };

  const sortCases = (casesToSort: Case[]) => {
    if (!Array.isArray(casesToSort)) {
      return [];
    }

    return [...casesToSort].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.client_name.localeCompare(b.client_name);
        case 'name-desc':
          return b.client_name.localeCompare(a.client_name);
        case 'date-asc':
          return new Date(a.court_date).getTime() - new Date(b.court_date).getTime();
        case 'date-desc':
          return new Date(b.court_date).getTime() - new Date(a.court_date).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredCases = cases.filter(c => c.type === selectedTab);
  const sortedCases = sortCases(filteredCases);

  if (!session) {
    return <Auth darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-neutral-900' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold">Case Tracker</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsTrashOpen(true)}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-100'
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Case</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className={`flex gap-2 p-1 rounded-lg ${
            darkMode ? 'bg-neutral-800' : 'bg-white'
          }`}>
            {['upcoming', 'heavy', 'dallas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTab === tab
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'hover:bg-neutral-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <CaseList
            cases={sortedCases}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            updateCase={handleEditCase}
            onEdit={setEditingCase}
            onDelete={setDeletingCase}
            onViewHistory={setViewingHistory}
            darkMode={darkMode}
          />
        </div>
      </main>

      {isFormOpen && (
        <CaseForm
          onSubmit={handleAddCase}
          onClose={() => setIsFormOpen(false)}
          darkMode={darkMode}
          availableTabs={['upcoming', 'heavy', 'dallas']}
        />
      )}

      {editingCase && (
        <CaseForm
          case={editingCase}
          onSubmit={handleEditCase}
          onClose={() => setEditingCase(null)}
          darkMode={darkMode}
          availableTabs={['upcoming', 'heavy', 'dallas']}
        />
      )}

      {deletingCase && (
        <DeleteConfirmation
          case={deletingCase}
          onConfirm={() => handleDeleteCase(deletingCase)}
          onCancel={() => setDeletingCase(null)}
          darkMode={darkMode}
        />
      )}

      {isTrashOpen && (
        <TrashModal
          trash={trash}
          restoreCase={async (caseToRestore) => {
            const { error } = await supabase
              .from('cases')
              .update({ deleted: false })
              .eq('id', caseToRestore.id);

            if (error) {
              console.error('Error restoring case:', error);
              return;
            }

            fetchCases();
          }}
          permanentlyDeleteCase={async (caseToDelete) => {
            const { error } = await supabase
              .from('cases')
              .delete()
              .eq('id', caseToDelete.id);

            if (error) {
              console.error('Error permanently deleting case:', error);
              return;
            }

            setTrash(trash.filter(c => c.id !== caseToDelete.id));
          }}
          onClose={() => setIsTrashOpen(false)}
          darkMode={darkMode}
        />
      )}

      {viewingHistory && (
        <VersionHistoryModal
          caseData={viewingHistory}
          versions={[]}
          onRestore={() => {}}
          onClose={() => setViewingHistory(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;