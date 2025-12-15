import React from 'react';
import { EditorMode } from '../types';
import { 
  BookOpen, 
  GraduationCap, 
  Wand2, 
  FileText, 
  Star, 
  MoreHorizontal,
  Sparkles,
  Home,
  Feather
} from 'lucide-react';

interface ToolbarProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  onAction: (action: string) => void;
  onHome: () => void;
  isProcessing: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ mode, setMode, onAction, onHome, isProcessing }) => {
  
  const btnClass = "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeBtnClass = "bg-slate-200 text-slate-900";
  const inactiveBtnClass = "text-slate-500 hover:bg-slate-100 hover:text-slate-900";

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault(); // Prevent focus loss from editor
    onAction(action);
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-4 h-16">
      
      <div className="flex items-center gap-4">
        {/* Home Button */}
        <button 
          onClick={onHome}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to Home"
        >
           <Home size={20} />
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode(EditorMode.ACADEMIC)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mode === EditorMode.ACADEMIC ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <GraduationCap size={16} />
            Academic
          </button>
          <button
            onClick={() => setMode(EditorMode.NOVEL)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mode === EditorMode.NOVEL ? 'bg-white shadow-sm text-purple-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BookOpen size={16} />
            Novel
          </button>
          <button
            onClick={() => setMode(EditorMode.GENERAL)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${mode === EditorMode.GENERAL ? 'bg-white shadow-sm text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Feather size={16} />
            General
          </button>
        </div>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-1">
        <button 
          onMouseDown={(e) => handleAction(e, 'autocomplete')}
          disabled={isProcessing}
          className={`${btnClass} ${inactiveBtnClass}`}
          title="Autocomplete (Tab)"
        >
          <MoreHorizontal size={16} />
          Complete
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button 
          onMouseDown={(e) => handleAction(e, 'improve')}
          disabled={isProcessing}
          className={`${btnClass} text-purple-600 hover:bg-purple-50`}
        >
          <Sparkles size={16} />
          Improve Selected
        </button>
        <button 
          onMouseDown={(e) => handleAction(e, 'rewrite')}
          disabled={isProcessing}
          className={`${btnClass} ${inactiveBtnClass}`}
        >
          <Wand2 size={16} />
          Rewrite
        </button>
        <button 
          onMouseDown={(e) => handleAction(e, 'summarize')}
          disabled={isProcessing}
          className={`${btnClass} ${inactiveBtnClass}`}
        >
          <FileText size={16} />
          Summarize
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button 
          onMouseDown={(e) => handleAction(e, 'rate')}
          disabled={isProcessing}
          className={`${btnClass} text-amber-600 hover:bg-amber-50`}
        >
          <Star size={16} />
          Rate
        </button>
      </div>
    </div>
  );
};

export default Toolbar;