import React, { useRef } from 'react';
import { EditorMode } from '../types';
import { GraduationCap, BookOpen, Sparkles, Mic, PenTool, BrainCircuit, FileText, Upload, Loader2 } from 'lucide-react';
import { extractRawText } from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface HomePageProps {
  onStart: (mode: EditorMode, initialText?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let text = "";
      const fileName = file.name.toLowerCase();

      // Handle Word Documents (.docx)
      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await extractRawText({ arrayBuffer });
        text = result.value;
        if (result.messages.length > 0) {
          console.warn("Word import warnings:", result.messages);
        }
      } 
      // Handle PDF Documents (.pdf)
      else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        // Pages are 1-indexed
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text items and join them with spaces. 
          // Note: Layout preservation is difficult in raw text extraction, so we just join with spaces.
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
            
          fullText += pageText + '\n\n';
        }
        text = fullText;
      }
      // Handle Text-based files (.txt, .md, .json)
      else {
        text = await file.text();
      }

      if (!text.trim()) {
        alert("The uploaded file appears to be empty or text could not be extracted.");
        setIsUploading(false);
        return;
      }

      onStart(EditorMode.GENERAL, text);
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to read the file. Please ensure it is a valid .docx, .pdf, .txt, or .md file.");
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    // Reset value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="max-w-6xl w-full space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight font-serif">
            Smart Editor
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-light">
            Your AI-powered writing companion. <br/>
            Where words meet intelligence.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <button
            onClick={() => onStart(EditorMode.ACADEMIC)}
            className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 border border-slate-200 text-left hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-6">
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600">
                <GraduationCap size={28} />
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    Strict
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">Academic Mode</h3>
            <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 text-sm">
              Designed for research papers and essays. Focuses on clarity, formal tone, citations, and structured arguments.
            </p>
          </button>

          <button
            onClick={() => onStart(EditorMode.NOVEL)}
            className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-300 border border-slate-200 text-left hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-6">
                <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 text-purple-600">
                <BookOpen size={28} />
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    Creative
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">Novel Mode</h3>
            <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 text-sm">
              Perfect for storytelling. Enhances narrative flow, character development, and creative expression.
            </p>
          </button>

          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 border border-slate-200 text-left hover:-translate-y-1 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between mb-6">
                <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 text-emerald-600">
                  {isUploading ? <Loader2 className="animate-spin" size={28} /> : <FileText size={28} />}
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    Upload
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">AI Grader</h3>
            <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 text-sm">
              Upload a document (.pdf, .docx, .txt) to instantly rate its quality and get actionable feedback.
            </p>
            {/* Extended accept attribute to catch all variations of text, word, and pdf files */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.md,.json,.docx,.pdf,text/plain,text/markdown,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" 
              className="hidden" 
            />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-200/60 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 transition-all shadow-sm">
                    <PenTool size={20} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Smart Rewrite</h4>
                    <p className="text-sm text-slate-500">Instantly improve clarity & tone</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-amber-200 group-hover:text-amber-600 transition-all shadow-sm">
                    <BrainCircuit size={20} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-1">AI Critique</h4>
                    <p className="text-sm text-slate-500">Get detailed scoring & feedback</p>
                </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 group">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-green-200 group-hover:text-green-600 transition-all shadow-sm">
                    <Mic size={20} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Voice Control</h4>
                    <p className="text-sm text-slate-500">Edit hands-free with AI</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;