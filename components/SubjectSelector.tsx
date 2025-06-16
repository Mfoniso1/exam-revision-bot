
import React from 'react';
import { SUBJECTS } from '../constants';

interface SubjectSelectorProps {
  onSelectSubject: (subject: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelectSubject }) => {
  return (
    <div className="my-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose a subject for your quiz:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => onSelectSubject(subject)}
            className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
