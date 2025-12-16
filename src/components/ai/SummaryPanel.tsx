import { useState } from 'react';
import { Bot, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { useLessonSummary, useAIFeedback } from '@/hooks/useAI';
import { Button, Card } from '@/components/ui';

interface SummaryPanelProps {
    lessonId: number;
    userId: number;
}

const SummaryPanel = ({ lessonId, userId }: SummaryPanelProps) => {
    const { data, loading, error, generate } = useLessonSummary(lessonId);
    const { submit: submitFeedback } = useAIFeedback();
    const [rated, setRated] = useState(false);

    if (!data && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4 text-primary-600">
                    <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Summary Available</h3>
                <p className="text-gray-500 mb-6 max-w-xs">
                    Get a quick overview of key concepts, formulas, and takeaways.
                </p>
                <Button onClick={() => generate(userId)}>
                    Generate Summary
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4" />
                <p className="text-gray-500 animate-pulse">Analyzing content...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <Card className="p-6 border-primary-100 dark:border-primary-900 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-4 text-primary-600">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold text-sm">AI Generated Summary</span>
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                    <pre className="whitespace-pre-wrap font-sans">{data?.content}</pre>
                </div>

                {!rated && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Was this helpful?</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { submitFeedback(data!.id!, 1); setRated(true); }}
                                className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-gray-400 hover:text-green-600 transition-colors"
                            >
                                <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { submitFeedback(data!.id!, 0); setRated(true); }}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <ThumbsDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SummaryPanel;
