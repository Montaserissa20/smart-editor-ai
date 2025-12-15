import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EditorMode, FeedbackData, VoiceCommandResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Helper to get client
const getClient = () => new GoogleGenAI({ apiKey });

// Helper for model names
const TEXT_MODEL = 'gemini-2.5-flash';

const getPersona = (mode: EditorMode) => {
  switch (mode) {
    case EditorMode.ACADEMIC: return "strict academic";
    case EditorMode.NOVEL: return "creative writing";
    case EditorMode.GENERAL: return "professional";
    default: return "helpful";
  }
};

export const generateAutocomplete = async (
  currentText: string,
  mode: EditorMode
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();
  
  const persona = getPersona(mode);
  const prompt = `You are a ${persona} assistant. 
  Continue the following text naturally.
  Return ONLY the continuation text. Do not contain or repeat the original text.
  
  Current Text:
  "${currentText.slice(-2000)}"`; // Send last 2000 chars for context

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 300,
      temperature: 0.5, 
    }
  });

  return response.text || "";
};

export const rewriteText = async (
  text: string,
  mode: EditorMode,
  instruction?: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();
  const persona = getPersona(mode);

  const prompt = `You are an expert ${persona} editor. 
  Rewrite the selected text.
  ${instruction ? `Instruction: ${instruction}` : 'Improve clarity, flow, and tone.'}
  Return only the rewritten text, no explanations.
  
  Text to rewrite:
  "${text}"`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
  });

  return response.text || text;
};

export const improveText = async (
  text: string,
  mode: EditorMode
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();
  const persona = getPersona(mode);

  const prompt = `You are a ${persona} editor. 
  Significantly improve the grammar, vocabulary, and flow of the selected text without changing its original meaning or removing key details.
  Return ONLY the improved text. Do not add conversational filler.
  
  Text to improve:
  "${text}"`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
  });

  return response.text || text;
};

export const summarizeText = async (
  text: string,
  mode: EditorMode
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();
  const persona = getPersona(mode);

  const prompt = `Summarize the following text concisely for a ${persona} context:
  
  "${text}"`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
  });

  return response.text || "";
};

export const rateWork = async (
  text: string,
  mode: EditorMode
): Promise<FeedbackData> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();
  const persona = getPersona(mode);

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "A score from 1-10 based on quality for the specific mode." },
      critique: { type: Type.STRING, description: "A paragraph of constructive critique." },
      improvements: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 3-5 specific actionable improvements."
      }
    },
    required: ["score", "critique", "improvements"]
  };

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Analyze this text as a ${persona} editor. Provide a score, critique, and improvements.\n\nText:\n"${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as FeedbackData;
  }
  throw new Error("Failed to generate feedback");
};

export const interpretVoiceCommand = async (
  audioBase64: string,
  currentMode: EditorMode
): Promise<VoiceCommandResponse> => {
  if (!apiKey) throw new Error("API Key not found");
  const ai = getClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      action: { 
        type: Type.STRING, 
        enum: ['REWRITE', 'IMPROVE', 'SUMMARIZE', 'RATE', 'AUTOCOMPLETE', 'CHANGE_MODE', 'UNKNOWN'],
        description: "The intended action."
      },
      mode: {
        type: Type.STRING,
        enum: ['ACADEMIC', 'NOVEL', 'GENERAL'],
        description: "If action is CHANGE_MODE, the target mode."
      },
      instruction: {
        type: Type.STRING,
        description: "Any specific instruction for rewrites (e.g., 'make it funny')."
      }
    },
    required: ["action"]
  };

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType: "audio/wav", data: audioBase64 } },
        { text: `You are a voice control assistant for a text editor. The user is currently in ${currentMode} mode. Interpret the user's audio command and map it to an editor action.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as VoiceCommandResponse;
  }
  return { action: 'UNKNOWN' };
};