import { Case } from '../types';

export const defaultCases: Case[] = [
  {
    id: '1',
    type: 'upcoming',
    caseNumber: 'F23-12345',
    clientName: 'John Smith',
    offense: 'Aggravated Assault',
    court: 'Criminal District Court 2',
    courtDate: '2024-04-15',
    nextStep: 'Review new evidence from prosecution',
    followUp: 'Contact expert witness for availability',
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
    caseNumber: 'F23-67890',
    clientName: 'Jane Doe',
    offense: 'Capital Murder',
    court: 'Criminal District Court 5',
    courtDate: '2024-05-20',
    nextStep: 'Schedule meeting with expert witness',
    followUp: 'Follow up on DNA test results',
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
    caseNumber: 'F23-11111',
    clientName: 'Robert Johnson',
    offense: 'Robbery',
    court: 'Dallas County Court 3',
    courtDate: '2024-04-30',
    nextStep: 'File motion to suppress evidence',
    followUp: 'Request surveillance footage from store',
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