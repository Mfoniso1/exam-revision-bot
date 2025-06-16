
export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessageInterface {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isLoading?: boolean; 
}

export interface MCQOption {
  id: string; // e.g., "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  questionText: string;
  options: MCQOption[];
  correctAnswerId: string;
  explanation: string;
  isAnswered: boolean;
  selectedOptionId?: string;
  isUserCorrect?: boolean;
}

export enum ChatMode {
  GREETING = 'greeting',
  AWAITING_MODE_CHOICE = 'awaiting_mode_choice',
  SUBJECT_SELECTION = 'subject_selection',
  QUIZ_ACTIVE = 'quiz_active',
  TUTOR_ACTIVE = 'tutor_active',
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields can be added here
}
