
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION_MCQ, SYSTEM_INSTRUCTION_TUTOR } from '../constants';
import type { QuizQuestion, GroundingMetadata } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseGeminiJsonResponse = <T,>(responseText: string): T | null => {
  let jsonString = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
  const match = jsonString.match(fenceRegex);
  if (match && match[1]) {
    jsonString = match[1].trim();
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error, "Raw text:", responseText);
    // Try to find a JSON object within the string if it's not perfectly formatted
    const jsonMatch = jsonString.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]) as T;
        } catch (e) {
            console.error("Failed to parse extracted JSON object:", e, "Extracted text:", jsonMatch[1]);
        }
    }
    return null;
  }
};

export const generateMCQ = async (subject: string): Promise<QuizQuestion | null> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: `Generate an MCQ for the subject: ${subject}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MCQ,
        responseMimeType: "application/json",
      },
    });
    
    const mcqData = parseGeminiJsonResponse<Omit<QuizQuestion, 'isAnswered'>>(response.text);
    if (mcqData) {
      return { ...mcqData, isAnswered: false };
    }
    return null;
  } catch (error) {
    console.error("Error generating MCQ:", error);
    return null;
  }
};

export const getTutorExplanation = async (query: string): Promise<{text: string | null, groundingMetadata?: GroundingMetadata | null}> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: query,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_TUTOR,
        // Example of enabling Google Search, remove if not desired or if it causes issues.
        // tools: [{googleSearch: {}}],
      },
    });
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    return { text: response.text, groundingMetadata: groundingMetadata ?? null };
  } catch (error) {
    console.error("Error getting tutor explanation:", error);
    return { text: null, groundingMetadata: null };
  }
};
