
import React from 'react';
import { ChatMessageInterface, Sender } from '../types';

interface ChatMessageProps {
  message: ChatMessageInterface;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-md ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
