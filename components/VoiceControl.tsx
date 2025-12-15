import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceControlProps {
  onVoiceCommand: (audioBase64: string) => void;
  isProcessing: boolean;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onVoiceCommand, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onVoiceCommand(base64);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 z-50 flex items-center gap-2 ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-primary hover:bg-blue-700 text-white'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isRecording ? <Square size={24} /> : <Mic size={24} />}
      {isRecording && <span className="text-sm font-semibold">Listening...</span>}
    </button>
  );
};

export default VoiceControl;
