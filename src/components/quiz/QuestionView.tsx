import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Question } from '@/db/db';

interface QuestionViewProps {
    question: Question;
    onAnswer: (answer: string) => void;
    showResult?: boolean;
    userAnswer?: string;
    isAnswered?: boolean;
}

const QuestionView = ({
    question,
    onAnswer,
    showResult = false,
    userAnswer,
    isAnswered = false,
}: QuestionViewProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>(userAnswer || '');
    const [textAnswer, setTextAnswer] = useState<string>(userAnswer || '');

    const handleMCQSelect = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedAnswer(optionIndex.toString());
    };

    const handleSubmit = () => {
        const answer = question.type === 'mcq' ? selectedAnswer : textAnswer.trim();
        if (answer) {
            onAnswer(answer);
        }
    };

    const isCorrect = userAnswer === question.correctAnswer;

    return (
        <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {question.type === 'mcq' && (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-primary-700 dark:text-primary-300 font-semibold">MCQ</span>
                        </div>
                    )}
                    {question.type === 'short' && (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">SA</span>
                        </div>
                    )}
                    {question.type === 'long' && (
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">LA</span>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${question.difficulty === 'easy'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : question.difficulty === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                            {question.difficulty.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {question.body}
                    </p>
                </div>
            </div>

            {/* Options for MCQ */}
            {question.type === 'mcq' && question.options && (
                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index.toString();
                        const isCorrectOption = index.toString() === question.correctAnswer;
                        const showAsCorrect = showResult && isCorrectOption;
                        const showAsIncorrect = showResult && isSelected && !isCorrect;

                        return (
                            <button
                                key={index}
                                onClick={() => handleMCQSelect(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showAsCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : showAsIncorrect
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : isSelected
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                    } ${isAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                                ? 'border-primary-600 bg-primary-600'
                                                : 'border-gray-400'
                                            }`}>
                                            {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100">{option}</span>
                                    </div>
                                    {showResult && (
                                        <>
                                            {isCorrectOption && (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            )}
                                            {showAsIncorrect && (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Text answer for short/long */}
            {(question.type === 'short' || question.type === 'long') && (
                <div>
                    <textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isAnswered}
                        rows={question.type === 'long' ? 8 : 4}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        {textAnswer.length} characters
                    </p>
                </div>
            )}

            {/* Submit button */}
            {!isAnswered && (
                <Button
                    onClick={handleSubmit}
                    disabled={
                        (question.type === 'mcq' && !selectedAnswer) ||
                        (question.type !== 'mcq' && !textAnswer.trim())
                    }
                    className="w-full"
                >
                    Submit Answer
                </Button>
            )}

            {/* Result and Explanation */}
            {showResult && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Result Badge */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${isCorrect
                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                        }`}>
                        {isCorrect ? (
                            <>
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-900 dark:text-green-100">Correct!</p>
                                    <p className="text-sm text-green-700 dark:text-green-300">Great job!</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-6 h-6 text-red-600" />
                                <div>
                                    <p className="font-semibold text-red-900 dark:text-red-100">Incorrect</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Review the correct answer below
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Correct Answer for text questions */}
                    {question.type !== 'mcq' && !isCorrect && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <p className="font-semibold text-blue-900 dark:text-blue-100">Correct Answer:</p>
                            </div>
                            <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap ml-7">
                                {question.correctAnswer}
                            </p>
                        </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Explanation:</p>
                            <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionView;
