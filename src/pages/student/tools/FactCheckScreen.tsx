import { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFactCheck } from '@/hooks/useAI';
import { Button, Card } from '@/components/ui';

const FactCheckScreen = () => {
    const navigate = useNavigate();
    const { result, loading, check, clear } = useFactCheck();
    const [query, setQuery] = useState('');
    const userId = 1; // TODO: Get context

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            check(query, userId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 dark:text-gray-300">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fact Check AI</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                <Card className="p-6">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter a statement to verify..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            autoFocus
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        <div className="mt-4 flex justify-end">
                            <Button type="submit" disabled={!query.trim() || loading}>
                                {loading ? 'Verifying...' : 'Check Facts'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {loading && (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Cross-referencing with textbooks...</p>
                    </div>
                )}

                {result && (
                    <Card className="p-6 border-l-4 border-l-green-500 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Verification Complete</h3>
                                <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300">
                                    <pre className="whitespace-pre-wrap font-sans">{result.content}</pre>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Button variant="outline" size="sm" onClick={clear}>Clear</Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default FactCheckScreen;
