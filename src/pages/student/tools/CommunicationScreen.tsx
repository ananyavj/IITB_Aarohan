import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

// Placeholder for Communication/Writing Feedback
// Using similar pattern to FactCheck but tailored for writing
const CommunicationScreen = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        // Simulate API call using same mock delay
        await new Promise(r => setTimeout(r, 1500));
        setFeedback(`**Feedback on your writing:**\n\n- **Clarity**: Good flow of ideas.\n- **Grammar**: No major errors found.\n- **Tone**: Appropriate for academic context.\n\n*Suggestion*: Consider breaking paragraph 2 into smaller sentences for better readability.`);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 dark:text-gray-300">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Communication Coach</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                <Card className="p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Paste your essay or response here:
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        placeholder="Type something..."
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleAnalyze} disabled={!text.trim() || loading}>
                            {loading ? 'Analyzing...' : 'Get Feedback'}
                        </Button>
                    </div>
                </Card>

                {feedback && (
                    <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-lg mb-4 text-blue-900 dark:text-blue-100">AI Feedback</h3>
                        <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300 text-sm">
                            <pre className="whitespace-pre-wrap font-sans">{feedback}</pre>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CommunicationScreen;
