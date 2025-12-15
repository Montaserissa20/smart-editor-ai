export enum EditorMode {
  ACADEMIC = 'ACADEMIC',
  NOVEL = 'NOVEL',
  GENERAL = 'GENERAL',
}

export enum EditorActionType {
  AUTOCOMPLETE = 'AUTOCOMPLETE',
  REWRITE = 'REWRITE',
  IMPROVE = 'IMPROVE',
  SUMMARIZE = 'SUMMARIZE',
  RATE = 'RATE',
  NONE = 'NONE'
}

export interface FeedbackData {
  score: number;
  critique: string;
  improvements: string[];
}

export interface VoiceCommandResponse {
  action: 'REWRITE' | 'IMPROVE' | 'SUMMARIZE' | 'RATE' | 'AUTOCOMPLETE' | 'CHANGE_MODE' | 'UNKNOWN';
  mode?: EditorMode;
  targetText?: string; // For things like "Rewrite the last sentence" - though simpler to just act on selection
  instruction?: string; // E.g., "Make it funny"
}