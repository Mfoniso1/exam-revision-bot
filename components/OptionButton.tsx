
import React from 'react';
import type { MCQOption } from '../types';

interface OptionButtonProps {
  option: MCQOption;
  onClick: (optionId: string) => void;
  disabled: boolean;
  isSelected?: boolean;
  isCorrect?: boolean; // True if this option is the correct one, after answering
  wasSelectedAndIncorrect?: boolean; // True if this option was selected by user and is incorrect
}

const OptionButton: React.FC<OptionButtonProps> = ({ 
  option, 
  onClick, 
  disabled, 
  isSelected, 
  isCorrect, 
  wasSelectedAndIncorrect 
}) => {
  let buttonStyle = "w-full text-left p-3 border rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400";

  if (disabled && isSelected) {
    if (isCorrect) {
      buttonStyle += " bg-green-500 text-white border-green-600";
    } else {
      buttonStyle += " bg-red-500 text-white border-red-600";
    }
  } else if (disabled && isCorrect) {
     // If question is answered, and this is the correct option (but not selected by user)
    buttonStyle += " bg-green-200 text-green-800 border-green-400";
  } else if (disabled && wasSelectedAndIncorrect) {
    // This case should be covered by the first if (disabled && isSelected && !isCorrect)
    // but kept for clarity, though it's redundant if isSelected is true for the incorrect one.
    buttonStyle += " bg-red-200 text-red-800 border-red-400";
  }
   else if (disabled) {
    buttonStyle += " bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed";
  } else {
    buttonStyle += " bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-300 hover:border-indigo-400";
  }


  return (
    <button
      onClick={() => onClick(option.id)}
      disabled={disabled}
      className={buttonStyle}
    >
      <span className="font-medium mr-2">{option.id}.</span>{option.text}
    </button>
  );
};

export default OptionButton;
