import React from 'react';
import { Transcripts, MediaItem } from '../types';
import ProgressBar from './ProgressBar';

interface TranscriptSectionProps {
  transcripts: Transcripts;
  updateTranscripts: (transcripts: Transcripts) => void;
  darkMode: boolean;
}

const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  transcripts,
  updateTranscripts,
  darkMode,
}) => {
  const handleTotalChange = (type: 'videos' | 'audio', total: number) => {
    const currentItems = transcripts[type].items;
    let newItems: MediaItem[] = [...currentItems];

    if (total > currentItems.length) {
      // Add new items
      for (let i = currentItems.length; i < total; i++) {
        newItems.push({ id: crypto.randomUUID(), completed: false });
      }
    } else if (total < currentItems.length) {
      // Remove excess items
      newItems = currentItems.slice(0, total);
    }

    updateTranscripts({
      ...transcripts,
      [type]: {
        total,
        items: newItems,
      },
    });
  };

  const toggleItemCompletion = (type: 'videos' | 'audio', itemId: string) => {
    updateTranscripts({
      ...transcripts,
      [type]: {
        ...transcripts[type],
        items: transcripts[type].items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      },
    });
  };

  const calculateProgress = () => {
    const totalItems = transcripts.videos.items.length + transcripts.audio.items.length;
    if (totalItems === 0) return 0;
    
    const completedItems = 
      transcripts.videos.items.filter(item => item.completed).length +
      transcripts.audio.items.filter(item => item.completed).length;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Transcripts</h4>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm opacity-75">Videos</label>
            <input
              type="number"
              min="0"
              value={transcripts.videos.total}
              onChange={(e) => handleTotalChange('videos', Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-20 px-2 py-1 rounded ${
                darkMode
                  ? 'bg-neutral-700 border-neutral-600'
                  : 'bg-gray-100 border-gray-200'
              }`}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {transcripts.videos.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => toggleItemCompletion('videos', item.id)}
                className={`p-2 rounded transition-colors ${
                  item.completed
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-neutral-700 hover:bg-neutral-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={`Video ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm opacity-75">Audio</label>
            <input
              type="number"
              min="0"
              value={transcripts.audio.total}
              onChange={(e) => handleTotalChange('audio', Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-20 px-2 py-1 rounded ${
                darkMode
                  ? 'bg-neutral-700 border-neutral-600'
                  : 'bg-gray-100 border-gray-200'
              }`}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {transcripts.audio.items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => toggleItemCompletion('audio', item.id)}
                className={`p-2 rounded transition-colors ${
                  item.completed
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-neutral-700 hover:bg-neutral-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={`Audio ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProgressBar progress={calculateProgress()} />
    </div>
  );
};

export default TranscriptSection;