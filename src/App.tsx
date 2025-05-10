import React, { useState, useEffect } from 'react';
import { Sun, Moon, Scale, Plus, Printer, ArrowUpDown, GripVertical, X, Edit2, History, Trash2, Menu, LogOut } from 'lucide-react';
import { Case, TabType, SortOption, CaseHistory, ViewMode } from './types';
import { defaultCases } from './data/defaultCases';
import CaseList from './components/CaseList';
import CaseForm from './components/CaseForm';
import DeleteConfirmation from './components/DeleteConfirmation';
import PrintModal from './components/PrintModal';
import VersionHistoryModal from './components/VersionHistoryModal';
import TrashModal from './components/TrashModal';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const MAX_HISTORY_VERSIONS = 10;
const AUTO_SAVE_DELAY = 2000; // 2 seconds

function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved as ViewMode) || 'grid';
  });
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('cases');
    return saved ? JSON.parse(saved) : defaultCases;
  });
  const [trash, setTrash] = useState<Case[]>(() => {
    const saved = localStorage.getItem('trash');
    return saved ? JSON.parse(saved) : [];
  });
  const [caseHistory, setCaseHistory] = useState<CaseHistory>(() => {
    const saved = localStorage.getItem('caseHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCaseForHistory, setSelectedCaseForHistory] = useState<Case | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabs, setTabs] = useState<string[]>(() => {
    const saved = localStorage.getItem('tabs');
    return saved ? JSON.parse(saved) : ['upcoming', 'heavy', 'dallas'];
  });
  const [activeTab, setActiveTab] = useState<TabType>(tabs[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null);

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
    const channel = supabase
      .channel('cases_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        async (payload) => {
          // Fetch the latest data from Supabase
          const { data: updatedCases, error } = await supabase
            .from('cases')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching updated cases:', error);
            return;
          }

          setCases(updatedCases);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cases', JSON.stringify(cases));
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('trash', JSON.stringify(trash));
  }, [trash]);

  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(caseHistory));
  }, [caseHistory]);

  useEffect(() => {
    localStorage.setItem('tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const addToHistory = (updatedCase: Case) => {
    setCaseHistory(prevHistory => {
      const caseVersions = prevHistory[updatedCase.id] || [];
      const newVersion = {
        timestamp: Date.now(),
        data: { ...updatedCase }
      };

      const updatedVersions = [newVersion, ...caseVersions].slice(0, MAX_HISTORY_VERSIONS);
      return {
        ...prevHistory,
        [updatedCase.id]: updatedVersions
      };
    });
  };

  const restoreVersion = (caseId: string, version: number) => {
    const historicalCase = caseHistory[caseId][version].data;
    setCases(cases.map(c => c.id === caseId ? historicalCase : c));
    setShowHistory(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAddCase = async (newCase: Case) => {
    const caseWithId = { 
      ...newCase, 
      id: crypto.randomUUID(),
      user_id: session?.user?.id
    };
    
    const { error } = await supabase
      .from('cases')
      .insert([caseWithId]);

    if (error) {
      console.error('Error adding case:', error);
      return;
    }

    addToHistory(caseWithId);
    setIsFormOpen(false);
  };

  const handleEditCase = async (updatedCase: Case) => {
    const { error } = await supabase
      .from('cases')
      .update(updatedCase)
      .eq('id', updatedCase.id);

    if (error) {
      console.error('Error updating case:', error);
      return;
    }

    addToHistory(updatedCase);
    setEditingCase(null);
  };

  const handleDeleteCase = async () => {
    if (deletingCase) {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', deletingCase.id);

      if (error) {
        console.error('Error deleting case:', error);
        return;
      }

      setTrash([...trash, { ...deletingCase, deleted: true }]);
      setDeletingCase(null);
    }
  };

  const restoreCase = async (caseToRestore: Case) => {
    const { error } = await supabase
      .from('cases')
      .insert([{ ...caseToRestore, deleted: false }]);

    if (error) {
      console.error('Error restoring case:', error);
      return;
    }

    setTrash(trash.filter(c => c.id !== caseToRestore.id));
  };

  const permanentlyDeleteCase = (caseToDelete: Case) => {
    setTrash(trash.filter(c => c.id !== caseToDelete.id));
  };

  const calculateProgress = (caseItem: Case) => {
    const checklistCount = Object.keys(caseItem.checklist).length;
    const completedChecklist = Object.values(caseItem.checklist).filter(item => item.checked).length;
    const transcriptProgress = 
      (caseItem.transcripts.videos.items.filter(i => i.completed).length +
       caseItem.transcripts.audio.items.filter(i => i.completed).length) /
      (caseItem.transcripts.videos.items.length + caseItem.transcripts.audio.items.length || 1);
    
    return Math.round(((completedChecklist / checklistCount) * 0.7 + transcriptProgress * 0.3) * 100);
  };

  const sortCases = (casesToSort: Case[]) => {
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
        case 'progress-asc':
          return calculateProgress(a) - calculateProgress(b);
        case 'progress-desc':
          return calculateProgress(b) - calculateProgress(a);
        default:
          return 0;
      }
    });
  };

  const handleAddTab = () => {
    if (newTabName.trim()) {
      setTabs([...tabs, newTabName.trim().toLowerCase()]);
      setActiveTab(newTabName.trim().toLowerCase());
      setIsAddingTab(false);
      setNewTabName('');
    }
  };

  const handleDeleteTab = (tabToDelete: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab !== tabToDelete);
      setTabs(newTabs);
      if (activeTab === tabToDelete) {
        setActiveTab(newTabs[0]);
      }
      setCases(cases.map(c => c.type === tabToDelete ? { ...c, type: newTabs[0] } : c));
    }
  };

  const handleMoveTab = (fromIndex: number, toIndex: number) => {
    const newTabs = [...tabs];
    const [movedTab] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, movedTab);
    setTabs(newTabs);
  };

  const handleRenameTab = (oldName: string, newName: string) => {
    if (newName.trim() && newName.trim() !== oldName) {
      const newTabs = tabs.map(tab => tab === oldName ? newName.trim().toLowerCase() : tab);
      setTabs(newTabs);
      if (activeTab === oldName) {
        setActiveTab(newName.trim().toLowerCase());
      }
      setCases(cases.map(c => c.type === oldName ? { ...c, type: newName.trim().toLowerCase() } : c));
      setEditingTabName(null);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-green-500', 'bg-opacity-10');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-green-500', 'bg-opacity-10');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    handleMoveTab(fromIndex, toIndex);
    e.currentTarget.classList.remove('bg-green-500', 'bg-opacity-10');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 p-4 ${darkMode ? 'bg-neutral-800' : 'bg-white'} shadow-lg`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold">Case Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className={`fixed inset-0 z-50 md:static md:flex md:items-center md:gap-4 transition-all duration-300 ${
                isMobileMenuOpen
                  ? 'flex flex-col items-stretch bg-black bg-opacity-50'
                  : 'hidden'
              }`}>
                <div className={`${
                  isMobileMenuOpen
                    ? 'flex flex-col gap-4 p-4 mt-16 mx-4 rounded-lg'
                    : 'flex items-center gap-4'
                } ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                  <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-2 px-4 py-2 ${
                      darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                    } rounded-lg transition-colors`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => setIsTrashOpen(true)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 ${
                      darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                    } rounded-lg transition-colors w-full md:w-auto`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Trash</span>
                    {trash.length > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {trash.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 ${
                      darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                    } rounded-lg transition-colors w-full md:w-auto`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Case</span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full ${
                      darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  {isMobileMenuOpen && (
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="md:hidden px-4 py-2 text-center rounded-lg bg-opacity-10 bg-white hover:bg-opacity-20"
                    >
                      Close Menu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
            {isEditingTabs ? (
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab, index) => (
                  <div
                    key={tab}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-move transition-colors ${
                      darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <GripVertical className="w-4 h-4" />
                    {editingTabName === tab ? (
                      <input
                        type="text"
                        value={editingTabName}
                        onChange={(e) => setEditingTabName(e.target.value)}
                        onBlur={() => handleRenameTab(tab, editingTabName)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameTab(tab, editingTabName)}
                        className={`px-2 py-1 rounded ${
                          darkMode ? 'bg-neutral-700 text-white' : 'bg-gray-100'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                        <button
                          onClick={() => setEditingTabName(tab)}
                          className="p-1 hover:text-green-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {tabs.length > 1 && (
                          <button
                            onClick={() => handleDeleteTab(tab)}
                            className="p-1 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setIsEditingTabs(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-neutral-800 hover:bg-neutral-700'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Cases
                  </button>
                ))}
                <button
                  onClick={() => setIsEditingTabs(true)}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {isAddingTab ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      placeholder="New tab name"
                      className={`px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-neutral-700 text-white' : 'bg-white'
                      }`}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTab()}
                    />
                    <button
                      onClick={handleAddTab}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingTab(false)}
                      className={`px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTab(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-end">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-neutral-800 text-white' : 'bg-white'
              }`}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="date-asc">Court Date (Earliest)</option>
              <option value="date-desc">Court Date (Latest)</option>
              <option value="progress-asc">Progress (Low-High)</option>
              <option value="progress-desc">Progress (High-Low)</option>
            </select>
          </div>
        </div>

        <CaseList
          cases={sortCases(cases.filter((c) => c.type === activeTab && !c.deleted))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          updateCase={(updatedCase) => {
            setCases(cases.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
            addToHistory(updatedCase);
          }}
          onEdit={setEditingCase}
          onDelete={setDeletingCase}
          onViewHistory={(caseData) => {
            setSelectedCaseForHistory(caseData);
            setShowHistory(true);
          }}
          darkMode={darkMode}
        />
      </main>

      {(isFormOpen || editingCase) && (
        <CaseForm
          case={editingCase}
          onSubmit={editingCase ? handleEditCase : handleAddCase}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCase(null);
          }}
          darkMode={darkMode}
          availableTabs={tabs}
        />
      )}

      {deletingCase && (
        <DeleteConfirmation
          case={deletingCase}
          onConfirm={handleDeleteCase}
          onCancel={() => setDeletingCase(null)}
          darkMode={darkMode}
        />
      )}

      {showPrintModal && (
        <PrintModal
          cases={cases.filter((c) => c.type === activeTab)}
          onClose={() => setShowPrintModal(false)}
          darkMode={darkMode}
        />
      )}

      {showHistory && selectedCaseForHistory && (
        <VersionHistoryModal
          caseData={selectedCaseForHistory}
          versions={caseHistory[selectedCaseForHistory.id] || []}
          onRestore={restoreVersion}
          onClose={() => {
            setShowHistory(false);
            setSelectedCaseForHistory(null);
          }}
          darkMode={darkMode}
        />
      )}

      {isTrashOpen && (
        <TrashModal
          trash={trash}
          restoreCase={restoreCase}
          permanentlyDeleteCase={permanentlyDeleteCase}
          onClose={() => setIsTrashOpen(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;