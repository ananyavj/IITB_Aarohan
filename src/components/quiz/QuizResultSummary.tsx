import { Trophy, Target, Clock, TrendingUp, RotateCcw, Home } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface QuizResultSummaryProps {
    score: number;
    totalQuestions: number;
    elapsedTime: number;
    answers: Array<{ questionId: number; correct: boolean; timeTaken: number }>;
    onTryAgain: () => void;
    onBackToHome: () => void;
}

const QuizResultSummary = ({
    score,
    totalQuestions,
    elapsedTime,
    answers,
    onTryAgain,
    onBackToHome,
}: QuizResultSummaryProps) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const averageTimePerQuestion = Math.round(elapsedTime / totalQuestions);

    // Determine performance level
    let performanceLevel: { text: string; color: string; icon: JSX.Element } = {
        text: 'Needs Improvement',
        color: 'text-red-600',
        icon: <Target className="w-12 h-12" />,
    };

    if (percentage >= 80) {
        performanceLevel = {
            text: 'Excellent!',
            color: 'text-green-600',
            icon: <Trophy className="w-12 h-12" />,
        };
    } else if (percentage >= 60) {
        performanceLevel = {
            text: 'Good Job!',
            color: 'text-blue-600',
            icon: <TrendingUp className="w-12 h-12" />,
        };
    } else if (percentage >= 40) {
        performanceLevel = {
            text: 'Fair',
            color: 'text-yellow-600',
            icon: <Target className="w-12 h-12" />,
        };
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Main Score Card */}
            <Card className="text-center p-8">
                <div className={`${performanceLevel.color} mb-4 flex justify-center`}>
                    {performanceLevel.icon}
                </div>
                <h2 className="text-3xl font-bold mb-2">{performanceLevel.text}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You've completed the quiz!
                </p>

                {/* Score Display */}
                <div className="inline-block p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl mb-6">
                    <div className="text-6xl font-bold text-primary-700 dark:text-primary-300 mb-2">
                        {score}/{totalQuestions}
                    </div>
                    <div className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                        {percentage}%
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {score}/{totalQuestions}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</p>
                </Card>

                <Card className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {formatTime(elapsedTime)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                </Card>

                <Card className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {averageTimePerQuestion}s
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Question</p>
                </Card>
            </div>

            {/* Performance Tips */}
            <Card className="p-6">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Performance Insights:</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {percentage >= 80 && (
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Excellent performance! You have a strong understanding of this chapter.</span>
                        </li>
                    )}
                    {percentage >= 60 && percentage < 80 && (
                        <>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">→</span>
                                <span>Good work! Review the questions you got wrong to improve further.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">→</span>
                                <span>Practice more questions to solidify your understanding.</span>
                            </li>
                        </>
                    )}
                    {percentage < 60 && (
                        <>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">!</span>
                                <span>Review the chapter content before trying again.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">!</span>
                                <span>Focus on the concepts you found challenging.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-600">!</span>
                                <span>Consider making notes while studying to reinforce learning.</span>
                            </li>
                        </>
                    )}
                </ul>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button onClick={onTryAgain} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
                <Button onClick={onBackToHome} className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Practice
                </Button>
            </div>
        </div>
    );
};

export default QuizResultSummary;
