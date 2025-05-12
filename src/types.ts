export type TabType = string;

export type ViewMode = 'grid' | 'list';

export type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'progress-asc' | 'progress-desc';

export interface ChecklistItem {
  checked: boolean;
  notes: string;
}

export interface MediaItem {
  id: string;
  completed: boolean;
}

export interface Transcripts {
  videos: {
    total: number;
    items: MediaItem[];
  };
  audio: {
    total: number;
    items: MediaItem[];
  };
}

export interface Case {
  id: string;
  type: TabType;
  caseNumber: string;
  clientName: string;
  offense: string;
  court: string;
  court_date: string;
  next_step: string;
  follow_up: string;
  checklist: {
    DME: ChecklistItem;
    'Scan OCR': ChecklistItem;
    Organized: ChecklistItem;
    'Checklist DME': ChecklistItem;
    'Justice Text Added': ChecklistItem;
    Dropbox: ChecklistItem;
  };
  transcripts: Transcripts;
  deleted?: boolean;
  lastUpdated?: number;
}

export interface CaseVersion {
  timestamp: number;
  data: Case;
}

export interface CaseHistory {
  [caseId: string]: CaseVersion[];
}

export interface SocketEvents {
  casesUpdated: (cases: Case[]) => void;
  trashUpdated: (trash: Case[]) => void;
  historyUpdated: (history: CaseHistory) => void;
  tabsUpdated: (tabs: string[]) => void;
  updateCases: (cases: Case[]) => void;
  updateTrash: (trash: Case[]) => void;
  updateHistory: (history: CaseHistory) => void;
  updateTabs: (tabs: string[]) => void;
}