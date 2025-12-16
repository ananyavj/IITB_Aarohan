import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { useQuizSession } from '@/hooks/useQuizSession';
import QuestionView from '@/components/quiz/QuestionView';
import QuizResultSummary from '@/components/quiz/QuizResultSummary';
import { Button, Card } from '@/components/ui';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';

const QuizSessionScreen = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const [showResult, setShowResult] = useState(false);

    const chapter = useLiveQuery(async () => {
        if (!chapterId) return null;
        return await db.chapters.get(parseInt(chapterId));
    }, [chapterId]);

    const {
        status,
        currentQuestion,
        currentAnswer,
        progress,
        score,
        streak,
        currentDifficulty,
        elapsedTime,
        answers,
        startQuiz,
        submitAnswer,
        nextQuestion,
    } = useQuizSession({
        chapterId: parseInt(chapterId!),
        questionCount: 10,
    });

    // Start quiz on mount
    useEffect(() => {
        if (status === 'idle') {
            startQuiz();
        }
    }, [status, startQuiz]);

    const handleSubmitAnswer = async (answer: string) => {
        const result = await submitAnswer(answer);
        if (result) {
            setShowResult(true);
        }
    };

    const handleNext = () => {
        setShowResult(false);
        nextQuestion();
    };

    const handleTryAgain = () => {
        startQuiz();
    };

    const handleBackToHome = () => {
        navigate('/student/practice');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quiz Not Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {(useQuizSession as any).error || 'Quizzes for this chapter are coming soon!'}
                    </p>
                    <button
                        onClick={handleBackToHome}
                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                        Back to Practice
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToHome}
                        className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Practice
                    </button>

                    <QuizResultSummary
                        score={score}
                        totalQuestions={progress.total}
                        elapsedTime={elapsedTime}
                        answers={answers}
                        onTryAgain={handleTryAgain}
                        onBackToHome={handleBackToHome}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-primary-600 hover:text-primary-700"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">Exit Quiz</span>
                        </button>

                        <div className="flex items-center gap-4">
                            {/* Timer */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>

                            {/* Score */}
                            <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-lg">
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                    Score: {score}/{progress.total}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Question {progress.current} of {progress.total}
                            </span>
                            <div className="flex items-center gap-2">
                                {streak > 0 && (
                                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs font-semibold">{streak} streak</span>
                                    </div>
                                )}
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${currentDifficulty === 'easy'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : currentDifficulty === 'medium'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                    {currentDifficulty}
                                </span>
                            </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-4xl mx-auto p-6">
                <Card className="p-6">
                    {currentQuestion && (
                        <>
                            <QuestionView
                                question={currentQuestion}
                                onAnswer={handleSubmitAnswer}
                                showResult={showResult}
                                userAnswer={currentAnswer?.answer}
                                isAnswered={!!currentAnswer}
                            />

                            {showResult && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Button onClick={handleNext} className="w-full">
                                        {progress.current < progress.total ? 'Next Question' : 'See Results'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* Chapter Info */}
                {chapter && (
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {chapter.title}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizSessionScreen;
