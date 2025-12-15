import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import FormattingSidebar from './components/FormattingSidebar';
import VoiceControl from './components/VoiceControl';
import FeedbackPanel from './components/FeedbackPanel';
import HomePage from './components/HomePage';
import { EditorMode, FeedbackData } from './types';
import * as geminiService from './services/geminiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [showHome, setShowHome] = useState(true);
  const [mode, setMode] = useState<EditorMode>(EditorMode.ACADEMIC);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  
  // State to hold text passing from Home to Editor
  const [pendingInitialText, setPendingInitialText] = useState<string | null>(null);
  const [autoRate, setAutoRate] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Update word count on content change
  const handleContentChange = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
    }
  };

  const handleStart = (selectedMode: EditorMode, initialText?: string) => {
    setMode(selectedMode);
    if (initialText) {
      setPendingInitialText(initialText);
      setAutoRate(true);
    }
    setShowHome(false);
  };

  // Effect to load initial text once editor is mounted
  useEffect(() => {
    if (!showHome && editorRef.current && pendingInitialText !== null) {
      editorRef.current.innerText = pendingInitialText;
      handleContentChange();
      setPendingInitialText(null);
      
      // Auto trigger rate if flagged
      if (autoRate) {
        handleAction('rate').then(() => setAutoRate(false));
      }
    }
  }, [showHome, pendingInitialText, autoRate]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const getSelectionData = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { text: '', isSelection: false };
    
    const text = selection.toString();
    // If no text selected, fallback to all text for some actions (like rate/summarize)
    if (!text && editorRef.current) {
       return { text: editorRef.current.innerText, isSelection: false };
    }
    
    return { text, isSelection: true };
  };

  const insertTextAtCursor = (text: string) => {
    if (editorRef.current) editorRef.current.focus();
    // Ensure document is in a state to accept commands
    document.execCommand('insertText', false, text);
    handleContentChange();
  };

  const handleAction = async (actionType: string, instruction?: string) => {
    setIsProcessing(true);
    setFeedback(null);
    setSummary(null);

    // 1. Capture the current selection range immediately (before async operations)
    const selection = window.getSelection();
    let savedRange: Range | null = null;
    
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      // Only capture if the selection intersects with the editor
      if (editorRef.current.contains(selection.anchorNode) || editorRef.current === selection.anchorNode) {
         savedRange = selection.getRangeAt(0).cloneRange();
      }
    }

    try {
      const { text, isSelection } = getSelectionData();
      
      // Allow autocomplete to proceed even if text is empty (it will use context)
      if (actionType !== 'autocomplete' && !text.trim()) {
        alert("Please write or select some text first.");
        setIsProcessing(false);
        return;
      }

      switch (actionType) {
        case 'autocomplete':
          let contextForCompletion = "";
          
          if (savedRange && editorRef.current) {
             // Collapse to end of selection so we append/continue instead of replacing user's selection
             savedRange.collapse(false);
             
             try {
               const preCaretRange = savedRange.cloneRange();
               preCaretRange.selectNodeContents(editorRef.current);
               // Context is everything up to the cursor (which is now at the end of any previous selection)
               preCaretRange.setEnd(savedRange.startContainer, savedRange.startOffset);
               contextForCompletion = preCaretRange.toString();
             } catch (e) {
               console.warn("Could not calculate precise context, falling back to full text", e);
               contextForCompletion = editorRef.current.innerText;
             }
          } else if (editorRef.current) {
             contextForCompletion = editorRef.current.innerText;
          }
          
          if (!contextForCompletion.trim()) {
            alert("Please start writing something for me to complete.");
            break;
          }

          const completion = await geminiService.generateAutocomplete(contextForCompletion, mode);
          
          if (editorRef.current) {
             editorRef.current.focus();
             const sel = window.getSelection();
             sel?.removeAllRanges();
             if (savedRange) {
               sel?.addRange(savedRange);
             } else {
               const range = document.createRange();
               range.selectNodeContents(editorRef.current);
               range.collapse(false);
               sel?.addRange(range);
             }
             insertTextAtCursor(completion);
          }
          break;

        case 'rewrite':
          const rewritten = await geminiService.rewriteText(text, mode, instruction);
          
          if (savedRange && isSelection && editorRef.current) {
             editorRef.current.focus();
             const sel = window.getSelection();
             sel?.removeAllRanges();
             sel?.addRange(savedRange);
             insertTextAtCursor(rewritten);
          } else {
            if (editorRef.current) editorRef.current.innerText = rewritten;
            handleContentChange();
          }
          break;

        case 'improve':
          const improved = await geminiService.improveText(text, mode);
          
          if (savedRange && isSelection && editorRef.current) {
             editorRef.current.focus();
             const sel = window.getSelection();
             sel?.removeAllRanges();
             sel?.addRange(savedRange);
             insertTextAtCursor(improved);
          } else {
             if (editorRef.current) editorRef.current.innerText = improved;
             handleContentChange();
          }
          break;

        case 'summarize':
          const summaryResult = await geminiService.summarizeText(text, mode);
          setSummary(summaryResult);
          break;

        case 'rate':
          const rating = await geminiService.rateWork(text, mode);
          setFeedback(rating);
          break;
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceCommand = async (audioBase64: string) => {
    setIsProcessing(true);
    try {
      const command = await geminiService.interpretVoiceCommand(audioBase64, mode);
      console.log("Voice Command:", command);

      if (command.action === 'CHANGE_MODE' && command.mode) {
        setMode(command.mode);
      } else if (command.action === 'UNKNOWN') {
        alert("Sorry, I didn't understand that command.");
      } else {
        const actionMap: Record<string, string> = {
          'REWRITE': 'rewrite',
          'IMPROVE': 'improve',
          'SUMMARIZE': 'summarize',
          'RATE': 'rate',
          'AUTOCOMPLETE': 'autocomplete'
        };
        const mappedAction = actionMap[command.action];
        if (mappedAction) {
          await handleAction(mappedAction, command.instruction);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to process voice command.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showHome) {
    return <HomePage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        onAction={handleAction} 
        onHome={() => setShowHome(true)}
        isProcessing={isProcessing} 
      />

      <div className="flex-1 flex overflow-hidden relative">
        <FormattingSidebar onFormat={executeCommand} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className={`max-w-4xl w-full min-h-[80vh] bg-white rounded-xl shadow-sm border border-slate-200 relative transition-all duration-300 ${isProcessing ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
            
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className={`w-full h-full p-12 outline-none text-slate-800 leading-relaxed overflow-y-auto prose prose-slate max-w-none 
                ${mode === EditorMode.NOVEL ? 'font-serif text-lg md:text-xl' : 'font-sans text-base md:text-lg'}
                [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                focus:ring-0
              `}
              style={{ minHeight: '80vh' }}
              spellCheck={false}
              suppressContentEditableWarning={true}
            />
            
            {wordCount === 0 && (
              <div className="absolute top-12 left-12 text-slate-300 pointer-events-none select-none text-lg">
                Start writing your {mode.toLowerCase()} masterpiece...
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl cursor-wait">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={48} />
                  <p className="text-sm font-medium text-slate-600 animate-pulse">AI is thinking...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-4xl mt-4 text-xs text-slate-400 text-right font-mono pr-2">
            {wordCount} words
          </div>
        </main>

        <FeedbackPanel 
          feedback={feedback} 
          summary={summary} 
          onClose={() => { setFeedback(null); setSummary(null); }} 
        />
      </div>
      
      <VoiceControl onVoiceCommand={handleVoiceCommand} isProcessing={isProcessing} />
    </div>
  );
};

export default App;