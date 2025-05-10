import { Case } from '../types';

export const defaultCases: Case[] = [
  {
    id: '1',
    type: 'upcoming',
    case_number: 'F23-12345',
    client_name: 'John Smith',
    offense: 'Aggravated Assault',
    court: 'Criminal District Court 2',
    court_date: '2024-04-15',
    next_step: 'Review new evidence from prosecution',
    follow_up: 'Contact expert witness for availability',
    checklist: {
      DME: { checked: true, notes: 'Completed on 3/15' },
      'Scan OCR': { checked: true, notes: 'All documents processed' },
      Organized: { checked: false, notes: '' },
      'Checklist DME': { checked: false, notes: '' },
      'Justice Text Added': { checked: true, notes: 'Added to system' },
      Dropbox: { checked: false, notes: 'Pending upload' },
    },
    transcripts: {
      videos: {
        total: 4,
        items: [
          { id: '1', completed: true },
          { id: '2', completed: true },
          { id: '3', completed: false },
          { id: '4', completed: false },
        ],
      },
      audio: {
        total: 2,
        items: [
          { id: '5', completed: true },
          { id: '6', completed: false },
        ],
      },
    },
  },
  {
    id: '2',
    type: 'heavy',
    case_number: 'F23-67890',
    client_name: 'Jane Doe',
    offense: 'Capital Murder',
    court: 'Criminal District Court 5',
    court_date: '2024-05-20',
    next_step: 'Schedule meeting with expert witness',
    follow_up: 'Follow up on DNA test results',
    checklist: {
      DME: { checked: true, notes: '' },
      'Scan OCR': { checked: true, notes: '' },
      Organized: { checked: true, notes: 'Files sorted by date' },
      'Checklist DME': { checked: false, notes: 'In progress' },
      'Justice Text Added': { checked: false, notes: '' },
      Dropbox: { checked: true, notes: 'Shared with team' },
    },
    transcripts: {
      videos: {
        total: 8,
        items: Array(8).fill(null).map((_, i) => ({
          id: `v${i}`,
          completed: i < 5,
        })),
      },
      audio: {
        total: 4,
        items: Array(4).fill(null).map((_, i) => ({
          id: `a${i}`,
          completed: i < 3,
        })),
      },
    },
  },
  {
    id: '3',
    type: 'dallas',
    case_number: 'F23-11111',
    client_name: 'Robert Johnson',
    offense: 'Robbery',
    court: 'Dallas County Court 3',
    court_date: '2024-04-30',
    next_step: 'File motion to suppress evidence',
    follow_up: 'Request surveillance footage from store',
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
        total: 2,
        items: Array(2).fill(null).map((_, i) => ({
          id: `v${i}`,
          completed: false,
        })),
      },
      audio: {
        total: 1,
        items: [{ id: 'a1', completed: false }],
      },
    },
  },
];