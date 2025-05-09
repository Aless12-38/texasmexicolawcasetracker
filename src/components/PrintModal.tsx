import React from 'react';
import { Printer, X } from 'lucide-react';
import { Case } from '../types';

interface PrintModalProps {
  cases: Case[];
  selectedCase?: Case | null;
  onClose: () => void;
  darkMode: boolean;
}

const PrintModal: React.FC<PrintModalProps> = ({
  cases,
  selectedCase,
  onClose,
  darkMode,
}) => {
  const handlePrint = (type: 'key' | 'all') => {
    const casesToPrint = selectedCase ? [selectedCase] : cases;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const calculateProgress = (caseItem: Case) => {
      const checklistCount = Object.keys(caseItem.checklist).length;
      const completedChecklist = Object.values(caseItem.checklist).filter(item => item.checked).length;
      
      const totalTranscripts = caseItem.transcripts.videos.items.length + caseItem.transcripts.audio.items.length;
      const completedTranscripts = 
        caseItem.transcripts.videos.items.filter(item => item.completed).length +
        caseItem.transcripts.audio.items.filter(item => item.completed).length;
      
      const checklistProgress = (completedChecklist / checklistCount) * 0.7;
      const transcriptProgress = totalTranscripts > 0 ? (completedTranscripts / totalTranscripts) * 0.3 : 0;
      
      return Math.round((checklistProgress + transcriptProgress) * 100);
    };

    const styles = `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          margin: 2rem;
          color: #333;
        }
        .case {
          border: 1px solid #ddd;
          padding: 1.5rem;
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }
        .header {
          border-bottom: 2px solid #333;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
        }
        .section {
          margin-bottom: 1.5rem;
        }
        .title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .label {
          font-weight: 500;
          color: #666;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e5e5e5;
          border-radius: 10px;
          overflow: hidden;
          margin: 0.5rem 0;
        }
        .progress-fill {
          height: 100%;
          background-color: #22c55e;
          transition: width 0.3s ease;
        }
        .progress-text {
          text-align: center;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 0.75rem;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .next-step {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        @media print {
          body { margin: 0; }
          .case { break-inside: avoid; }
          @page { margin: 2cm; }
        }
      </style>
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case Report - ${new Date().toLocaleDateString()}</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Case Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          ${casesToPrint.map(caseItem => `
            <div class="case">
              <div class="section">
                <div class="title">${caseItem.clientName}</div>
                <div class="grid">
                  <div>
                    <span class="label">Case Number:</span>
                    <span>${caseItem.caseNumber}</span>
                  </div>
                  <div>
                    <span class="label">Court:</span>
                    <span>${caseItem.court}</span>
                  </div>
                  <div>
                    <span class="label">Court Date:</span>
                    <span>${new Date(caseItem.courtDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span class="label">Offense:</span>
                    <span>${caseItem.offense}</span>
                  </div>
                </div>
                
                <div class="next-step">
                  <div class="label">Next Step / Important:</div>
                  <div>${caseItem.nextStep || 'No next steps specified'}</div>
                </div>

                <div class="label">Overall Progress:</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${calculateProgress(caseItem)}%"></div>
                </div>
                <div class="progress-text">${calculateProgress(caseItem)}% Complete</div>
              </div>

              ${type === 'all' ? `
                <div class="section">
                  <div class="title">Checklist</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(caseItem.checklist).map(([task, item]) => `
                        <tr>
                          <td>${task}</td>
                          <td>${item.checked ? '✓' : '✗'}</td>
                          <td>${item.notes}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                <div class="section">
                  <div class="title">Transcripts</div>
                  <table>
                    <tr>
                      <th>Type</th>
                      <th>Progress</th>
                    </tr>
                    <tr>
                      <td>Videos</td>
                      <td>${caseItem.transcripts.videos.items.filter(i => i.completed).length}/${caseItem.transcripts.videos.items.length}</td>
                    </tr>
                    <tr>
                      <td>Audio</td>
                      <td>${caseItem.transcripts.audio.items.filter(i => i.completed).length}/${caseItem.transcripts.audio.items.length}</td>
                    </tr>
                  </table>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for resources to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-lg shadow-lg p-6 ${
        darkMode ? 'bg-neutral-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            <h2 className="text-xl font-bold">Print Options</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-opacity-10 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handlePrint('key')}
            className={`w-full p-4 rounded-lg text-left ${
              darkMode
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <h3 className="font-medium mb-1">Print Key Details</h3>
            <p className="text-sm opacity-75">
              Basic information including client name, case number, court details, and next steps
            </p>
          </button>

          <button
            onClick={() => handlePrint('all')}
            className={`w-full p-4 rounded-lg text-left ${
              darkMode
                ? 'bg-neutral-700 hover:bg-neutral-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <h3 className="font-medium mb-1">Print All Details</h3>
            <p className="text-sm opacity-75">
              Complete case information including checklist, transcript status, and all notes
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;