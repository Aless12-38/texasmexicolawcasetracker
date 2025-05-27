import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { Case } from './types';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [sortOption, setSortOption] = useState('date-desc');

  const handleAddCase = async (newCase: Case) => {
    const caseData = {
      type: newCase.type,
      case_number: newCase.case_number,
      client_name: newCase.client_name,
      offense: newCase.offense,
      court: newCase.court,
      court_date: newCase.court_date,
      next_step: newCase.next_step,
      follow_up: newCase.follow_up,
      checklist: newCase.checklist,
      transcripts: newCase.transcripts,
      user_id: session?.user?.id
    };
    
    const { error } = await supabase
      .from('cases')
      .insert([caseData]);

    if (error) {
      console.error('Error adding case:', error);
      return;
    }

    addToHistory(newCase);
    setIsFormOpen(false);
  };

  const handleEditCase = async (updatedCase: Case) => {
    const caseData = {
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
    };

    const { error } = await supabase
      .from('cases')
      .update(caseData)
      .eq('id', updatedCase.id);

    if (error) {
      console.error('Error updating case:', error);
      return;
    }

    addToHistory(updatedCase);
    setEditingCase(null);
  };

  const sortCases = (casesToSort: Case[]) => {
    // Return empty array if casesToSort is not an array
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
        case 'progress-asc':
          return calculateProgress(a) - calculateProgress(b);
        case 'progress-desc':
          return calculateProgress(b) - calculateProgress(a);
        default:
          return 0;
      }
    });
  };

  return (
    <div>
      {/* Your existing JSX content will go here */}
    </div>
  );
}

export default App;