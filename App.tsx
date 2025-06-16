
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './components/ChatMessage';
import OptionButton from './components/OptionButton';
import SubjectSelector from './components/SubjectSelector';
import { generateMCQ, getTutorExplanation } from './services/geminiService';
import type { ChatMessageInterface, QuizQuestion, GroundingChunk } from './types';
import { Sender, ChatMode } from './types'; 
import { BOT_NAME, INITIAL_BOT_GREETING, QUIZ_PROMPT_OPTIONS, SUBJECTS } from './constants';

const SendIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.GREETING);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((text: string, sender: Sender, isLoadingFlag: boolean = false): string => {
    const newMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: newMessageId, text, sender, timestamp: new Date(), isLoading: isLoadingFlag }]);
    return newMessageId;
  }, []);
  
  const updateMessage = useCallback((messageId: string, newText: string, newIsLoading: boolean = false, groundingChunks?: GroundingChunk[] | null) => {
    let finalText = newText;
    if (groundingChunks && groundingChunks.length > 0) {
      const sources = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
        .map((chunk, index) => `${index + 1}. [${chunk.web!.title}](${chunk.web!.uri})`)
        .join('\n');
      if (sources) {
        finalText += `\n\n**Sources:**\n${sources}`;
      }
    }

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text: finalText, isLoading: newIsLoading, timestamp: new Date() } : msg
    ));
  }, []);


  useEffect(() => {
    if (chatMode === ChatMode.GREETING) {
      addMessage(INITIAL_BOT_GREETING, Sender.BOT);
      setChatMode(ChatMode.AWAITING_MODE_CHOICE);
    }
  }, [chatMode, addMessage, setChatMode]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const onSelectSubjectInternal = useCallback(async (subject: string) => {
    setSelectedSubject(subject);
    setChatMode(ChatMode.QUIZ_ACTIVE);
    setIsLoading(true);
    const loadingMsgId = addMessage(`Okay, generating a question about ${subject}...`, Sender.BOT, true);
    
    const quiz = await generateMCQ(subject);
    if (quiz) {
      updateMessage(loadingMsgId, quiz.questionText, false); 
      setCurrentQuiz(quiz);
    } else {
      updateMessage(loadingMsgId, `Sorry, I couldn't generate a question for ${subject} right now. Please try another subject or ask me a question.`, false);
      setChatMode(ChatMode.AWAITING_MODE_CHOICE); 
    }
    setIsLoading(false);
  }, [addMessage, updateMessage, setSelectedSubject, setChatMode, setIsLoading, setCurrentQuiz]);
  
  const onSelectSubject = useCallback(onSelectSubjectInternal, [onSelectSubjectInternal]);

  const processUserInput = useCallback(async (input: string) => {
    const lowerInput = input.toLowerCase().trim();
    addMessage(input, Sender.USER);
    setUserInput('');
    setIsLoading(true);
    let loadingMsgId: string | null = null;

    if (chatMode === ChatMode.AWAITING_MODE_CHOICE) {
      if (lowerInput.includes('quiz') || lowerInput.includes('start quiz')) {
        setChatMode(ChatMode.SUBJECT_SELECTION);
        addMessage("Great! Let's start with a quiz. Which subject would you like to focus on?", Sender.BOT);
      } else {
        setChatMode(ChatMode.TUTOR_ACTIVE);
        loadingMsgId = addMessage("Thinking...", Sender.BOT, true);
        const tutorResponse = await getTutorExplanation(input);
        if (tutorResponse.text && loadingMsgId) {
          updateMessage(loadingMsgId, tutorResponse.text, false, tutorResponse.groundingMetadata?.groundingChunks);
        } else if(loadingMsgId) {
          updateMessage(loadingMsgId, "Sorry, I encountered an issue trying to understand that. Could you try rephrasing?", false);
        }
      }
    } else if (chatMode === ChatMode.SUBJECT_SELECTION) {
        const potentialSubject = SUBJECTS.find(s => s.toLowerCase() === lowerInput);
        if (potentialSubject) {
            onSelectSubject(potentialSubject);
        } else {
            addMessage(`I didn't recognize "${input}" as a subject. Let me see if I can help with that as a general question.`, Sender.BOT);
            setChatMode(ChatMode.TUTOR_ACTIVE);
            loadingMsgId = addMessage("Thinking...", Sender.BOT, true);
            const tutorResponse = await getTutorExplanation(input);
            if (tutorResponse.text && loadingMsgId) {
                updateMessage(loadingMsgId, tutorResponse.text, false, tutorResponse.groundingMetadata?.groundingChunks);
            } else if (loadingMsgId) {
                updateMessage(loadingMsgId, "I couldn't process that as a subject or a question. Please pick a subject from the list, or ask a clear question.", false);
            }
        }
    } else if (chatMode === ChatMode.QUIZ_ACTIVE) {
        if (lowerInput === 'next' && selectedSubject) {
            loadingMsgId = addMessage(`Fetching next question for ${selectedSubject}...`, Sender.BOT, true);
            const quiz = await generateMCQ(selectedSubject);
            if (quiz && loadingMsgId) {
                updateMessage(loadingMsgId, quiz.questionText, false);
                setCurrentQuiz(quiz);
            } else if (loadingMsgId) {
                updateMessage(loadingMsgId, "Sorry, I couldn't generate another question. Try a different subject or ask me something.", false);
                setChatMode(ChatMode.AWAITING_MODE_CHOICE); 
            }
        } else if (lowerInput === 'subjects') {
            setChatMode(ChatMode.SUBJECT_SELECTION);
            setCurrentQuiz(null);
            addMessage("Okay, let's pick a different subject.", Sender.BOT);
        } else { 
            setChatMode(ChatMode.TUTOR_ACTIVE);
            setCurrentQuiz(null); 
            loadingMsgId = addMessage("Thinking...", Sender.BOT, true);
            const tutorResponse = await getTutorExplanation(input);
             if (tutorResponse.text && loadingMsgId) {
              updateMessage(loadingMsgId, tutorResponse.text, false, tutorResponse.groundingMetadata?.groundingChunks);
            } else if(loadingMsgId) {
              updateMessage(loadingMsgId, "Sorry, I couldn't process that. Try 'next', 'subjects', or ask another question.", false);
            }
        }
    } else if (chatMode === ChatMode.TUTOR_ACTIVE) {
        loadingMsgId = addMessage("Thinking...", Sender.BOT, true);
        const tutorResponse = await getTutorExplanation(input);
        if (tutorResponse.text && loadingMsgId) {
            updateMessage(loadingMsgId, tutorResponse.text, false, tutorResponse.groundingMetadata?.groundingChunks);
        } else if(loadingMsgId) {
            updateMessage(loadingMsgId, "Sorry, I had trouble with that request. Could you try again or ask something else?", false);
        }
    }
    setIsLoading(false);
  }, [addMessage, updateMessage, chatMode, selectedSubject, onSelectSubject, setIsLoading, setChatMode, setCurrentQuiz, setUserInput]); 


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      processUserInput(userInput);
    }
  };

  const handleOptionSelect = useCallback((optionId: string) => {
    if (!currentQuiz || currentQuiz.isAnswered) return;

    const isCorrect = optionId === currentQuiz.correctAnswerId;
    setCurrentQuiz(prev => prev ? { ...prev, isAnswered: true, selectedOptionId: optionId, isUserCorrect: isCorrect } : null);

    let feedback = isCorrect 
      ? `Correct! Well done. \n\nExplanation: ${currentQuiz.explanation}`
      : `Not quite. The correct answer was ${currentQuiz.correctAnswerId}. \n\nExplanation: ${currentQuiz.explanation}`;
    
    feedback += `\n\n${QUIZ_PROMPT_OPTIONS}`;
    addMessage(feedback, Sender.BOT);
    setChatMode(ChatMode.QUIZ_ACTIVE); 
  }, [currentQuiz, addMessage, setChatMode, setCurrentQuiz]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-50 shadow-2xl">
      <header className="bg-indigo-600 text-white p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold">{BOT_NAME}</h1>
      </header>

      <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        
        {chatMode === ChatMode.SUBJECT_SELECTION && !isLoading && (
          <SubjectSelector onSelectSubject={onSelectSubject} />
        )}

        {currentQuiz && (
          <div className="my-4 p-4 bg-white rounded-lg shadow">
             {!currentQuiz.isAnswered && <p className="text-sm text-gray-600 mb-3">Select an answer for the question above:</p>}
            <div className="space-y-2">
              {currentQuiz.options.map(opt => (
                <OptionButton
                  key={opt.id}
                  option={opt}
                  onClick={handleOptionSelect}
                  disabled={currentQuiz.isAnswered || isLoading}
                  isSelected={currentQuiz.selectedOptionId === opt.id}
                  isCorrect={currentQuiz.isAnswered && opt.id === currentQuiz.correctAnswerId}
                  wasSelectedAndIncorrect={currentQuiz.isAnswered && currentQuiz.selectedOptionId === opt.id && !currentQuiz.isUserCorrect}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-3 border-t border-slate-300">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={handleUserInputChange}
            placeholder={
              isLoading ? "Bot is thinking..." : 
              chatMode === ChatMode.SUBJECT_SELECTION ? "Select a subject above or type..." : 
              currentQuiz && !currentQuiz.isAnswered ? "Select an option above or type..." :
              "Type your message or command..."
            }
            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
            disabled={isLoading || (chatMode === ChatMode.SUBJECT_SELECTION && !isLoading) || (currentQuiz != null && !currentQuiz.isAnswered)}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-300 disabled:cursor-not-allowed transition duration-150"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
