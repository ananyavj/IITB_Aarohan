import { useState, useCallback } from 'react';
import { fetchLessonSummary, fetchMindMap, submitFactCheck, submitFeedback } from '@/repositories/aiRepository';
import type { AIOutput } from '@/db/db';

export const useLessonSummary = (lessonId: number | undefined) => {
    const [data, setData] = useState<AIOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (userId: number) => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const result = await fetchLessonSummary(lessonId, userId);
            setData(result);
        } catch (err) {
            setError('Failed to generate summary');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    return { data, loading, error, generate };
};

export const useMindMap = (chapterId: number | undefined) => {
    const [data, setData] = useState<any | null>(null); // Parsed JSON
    const [loading, setLoading] = useState(false);

    const generate = useCallback(async (userId: number) => {
        if (!chapterId) return;
        setLoading(true);
        try {
            const result = await fetchMindMap(chapterId, userId);
            setData(JSON.parse(result.content));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [chapterId]);

    return { data, loading, generate };
};

export const useFactCheck = () => {
    const [result, setResult] = useState<AIOutput | null>(null);
    const [loading, setLoading] = useState(false);

    const check = useCallback(async (query: string, userId: number) => {
        setLoading(true);
        try {
            const output = await submitFactCheck(query, userId);
            setResult(output);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = () => setResult(null);

    return { result, loading, check, clear };
};

export const useAIFeedback = () => {
    const submit = useCallback(async (outputId: number, rating: number) => {
        await submitFeedback(outputId, rating);
    }, []);
    return { submit };
};
