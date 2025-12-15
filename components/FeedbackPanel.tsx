import React from 'react';
import { FeedbackData } from '../types';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface FeedbackPanelProps {
  feedback: FeedbackData | null;
  summary: string | null;
  onClose: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, summary, onClose }) => {
  if (!feedback && !summary) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform border-l border-slate-200 overflow-y-auto z-20">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
        <h3 className="font-semibold text-slate-800">
          {feedback ? 'AI Critique' : 'Summary'}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {summary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Summary</h4>
            <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              {summary}
            </p>
          </div>
        )}

        {feedback && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 text-2xl font-bold border-4 border-blue-100">
                {feedback.score}
              </div>
              <p className="text-xs text-slate-400 mt-2">Overall Score</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Analysis</h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {feedback.critique}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Improvements</h4>
              <ul className="space-y-2">
                {feedback.improvements.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-700 bg-green-50 p-2 rounded-md border border-green-100">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;
