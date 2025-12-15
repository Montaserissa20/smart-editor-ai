import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered
} from 'lucide-react';

interface FormattingSidebarProps {
  onFormat: (command: string, value?: string) => void;
}

const FormattingSidebar: React.FC<FormattingSidebarProps> = ({ onFormat }) => {
  
  // Helper to prevent focus loss when clicking buttons
  const handleMouseDown = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault();
    onFormat(command, value);
  };

  const btnClass = "p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors w-full flex justify-center items-center h-10";

  return (
    <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">FMT</div>
      
      <button 
        onMouseDown={(e) => handleMouseDown(e, 'bold')}
        className={btnClass}
        title="Bold"
      >
        <Bold size={20} />
      </button>
      
      <button 
        onMouseDown={(e) => handleMouseDown(e, 'italic')}
        className={btnClass}
        title="Italic"
      >
        <Italic size={20} />
      </button>

      <button 
        onMouseDown={(e) => handleMouseDown(e, 'underline')}
        className={btnClass}
        title="Underline"
      >
        <Underline size={20} />
      </button>

      <div className="w-8 h-px bg-slate-200 my-1"></div>

      <button 
        onMouseDown={(e) => handleMouseDown(e, 'formatBlock', 'H1')}
        className={btnClass}
        title="Heading 1"
      >
        <span className="font-bold text-xl leading-none font-serif">H1</span>
      </button>

      <button 
        onMouseDown={(e) => handleMouseDown(e, 'formatBlock', 'H2')}
        className={btnClass}
        title="Heading 2"
      >
        <span className="font-bold text-lg leading-none font-serif">H2</span>
      </button>

      <div className="w-8 h-px bg-slate-200 my-1"></div>

      <button 
        onMouseDown={(e) => handleMouseDown(e, 'insertUnorderedList')}
        className={btnClass}
        title="Bullet List"
      >
        <List size={20} />
      </button>

      <button 
        onMouseDown={(e) => handleMouseDown(e, 'insertOrderedList')}
        className={btnClass}
        title="Numbered List"
      >
        <ListOrdered size={20} />
      </button>

      <div className="w-8 h-px bg-slate-200 my-1"></div>

      {/* Colors */}
      <div className="flex flex-col gap-2 pt-1 items-center">
        <button 
          onMouseDown={(e) => handleMouseDown(e, 'foreColor', '#000000')}
          className="w-5 h-5 rounded-full bg-black border border-slate-200 hover:scale-125 transition-transform ring-1 ring-slate-100"
          title="Black"
        />
        <button 
          onMouseDown={(e) => handleMouseDown(e, 'foreColor', '#2563eb')}
          className="w-5 h-5 rounded-full bg-blue-600 border border-slate-200 hover:scale-125 transition-transform ring-1 ring-slate-100"
          title="Blue"
        />
        <button 
          onMouseDown={(e) => handleMouseDown(e, 'foreColor', '#dc2626')}
          className="w-5 h-5 rounded-full bg-red-600 border border-slate-200 hover:scale-125 transition-transform ring-1 ring-slate-100"
          title="Red"
        />
        <button 
          onMouseDown={(e) => handleMouseDown(e, 'foreColor', '#16a34a')}
          className="w-5 h-5 rounded-full bg-green-600 border border-slate-200 hover:scale-125 transition-transform ring-1 ring-slate-100"
          title="Green"
        />
      </div>

    </div>
  );
};

export default FormattingSidebar;