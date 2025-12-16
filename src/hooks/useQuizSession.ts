import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/db/db';
import {
    getRandomQuestions,
    createQuizSession,
    completeQuizSession,
    logQuizAnswer,
    logSkillEvent,
} from '@/repositories/quizRepository';

export interface QuizConfig {
    chapterId: number;
    questionCount?: number;
    startDifficulty?: 'easy' | 'medium' | 'hard';
    userId?: number;
}

export interface QuizState {
    sessionId: number | null;
    questions: Question[];
    currentIndex: number;
    answers: Array<{ questionId: number; answer: string; correct: boolean; timeTaken: number }>;
    score: number;
    streak: number; // Consecutive correct answers
    currentDifficulty: 'easy' | 'medium' | 'hard';
    status: 'idle' | 'loading' | 'active' | 'completed' | 'error';
    startTime: number; // Timestamp when quiz started
    questionStartTime: number; // Timestamp when current question started
    error?: string;
}

export const useQuizSession = (config: QuizConfig) => {
    const {
        chapterId,
        questionCount = 10,
        startDifficulty = 'medium',
        userId = 1,
    } = config;

    const [state, setState] = useState<QuizState>({
        sessionId: null,
        questions: [],
        currentIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        currentDifficulty: startDifficulty,
        status: 'idle',
        startTime: 0,
        questionStartTime: 0,
    });

    // Start quiz session
    const startQuiz = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'loading', error: undefined }));

        try {
            // Create session
            const sessionId = await createQuizSession(userId, chapterId);

            // Get initial questions (mix of difficulties)
            const easyQuestions = await getRandomQuestions(chapterId, Math.floor(questionCount * 0.3), 'easy');
            const mediumQuestions = await getRandomQuestions(chapterId, Math.floor(questionCount * 0.4), 'medium');
            const hardQuestions = await getRandomQuestions(chapterId, Math.ceil(questionCount * 0.3), 'hard');

            const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
                .sort(() => Math.random() - 0.5)
                .slice(0, questionCount);

            if (allQuestions.length === 0) {
                throw new Error('Quizzes for this chapter are coming soon! Please try another chapter.');
            }

            const now = Date.now();
            setState({
                sessionId,
                questions: allQuestions,
                currentIndex: 0,
                answers: [],
                score: 0,
                streak: 0,
                currentDifficulty: startDifficulty,
                status: 'active',
                startTime: now,
                questionStartTime: now,
            });
        } catch (error) {
            console.error('Error starting quiz:', error);
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to start quiz'
            }));
        }
    }, [chapterId, questionCount, startDifficulty, userId]);

    // Submit answer for current question
    const submitAnswer = useCallback(async (userAnswer: string) => {
        if (state.status !== 'active' || !state.sessionId) return;

        const currentQuestion = state.questions[state.currentIndex];
        if (!currentQuestion) return;

        // Check if answer is correct
        const correct = userAnswer === currentQuestion.correctAnswer;
        const timeTaken = Math.round((Date.now() - state.questionStartTime) / 1000);

        // Log answer to database
        await logQuizAnswer(state.sessionId, currentQuestion.id!, userAnswer, correct);

        // Log skill event
        await logSkillEvent(userId, currentQuestion.id!, correct, timeTaken);

        // Update state
        const newScore = state.score + (correct ? 1 : 0);
        const newStreak = correct ? state.streak + 1 : 0;
        const newAnswers = [
            ...state.answers,
            { questionId: currentQuestion.id!, answer: userAnswer, correct, timeTaken }
        ];

        // Adaptive difficulty adjustment
        let newDifficulty = state.currentDifficulty;

        // Increase difficulty after 3 correct in a row
        if (newStreak >= 3 && state.currentDifficulty === 'easy') {
            newDifficulty = 'medium';
        } else if (newStreak >= 3 && state.currentDifficulty === 'medium') {
            newDifficulty = 'hard';
        }

        // Decrease difficulty after 2 recent incorrect
        const recentAnswers = newAnswers.slice(-2);
        const recentIncorrect = recentAnswers.filter(a => !a.correct).length;
        if (recentIncorrect >= 2 && state.currentDifficulty === 'hard') {
            newDifficulty = 'medium';
        } else if (recentIncorrect >= 2 && state.currentDifficulty === 'medium') {
            newDifficulty = 'easy';
        }

        setState(prev => ({
            ...prev,
            score: newScore,
            streak: newStreak,
            answers: newAnswers,
            currentDifficulty: newDifficulty,
        }));

        return { correct, timeTaken };
    }, [state, userId]);

    // Move to next question
    const nextQuestion = useCallback(() => {
        const nextIndex = state.currentIndex + 1;

        if (nextIndex >= state.questions.length) {
            // Quiz completed
            if (state.sessionId) {
                completeQuizSession(state.sessionId, state.score);
            }
            setState(prev => ({ ...prev, status: 'completed' }));
        } else {
            setState(prev => ({
                ...prev,
                currentIndex: nextIndex,
                questionStartTime: Date.now(),
            }));
        }
    }, [state.currentIndex, state.questions.length, state.sessionId, state.score]);

    // Get current question
    const currentQuestion = state.questions[state.currentIndex];

    // Get quiz progress
    const progress = {
        current: state.currentIndex + 1,
        total: state.questions.length,
        percentage: Math.round(((state.currentIndex + 1) / state.questions.length) * 100),
    };

    // Get elapsed time in seconds
    const elapsedTime = state.startTime > 0 ? Math.floor((Date.now() - state.startTime) / 1000) : 0;

    // Get user's answer for current question (if answered)
    const currentAnswer = state.answers.find(a => a.questionId === currentQuestion?.id);

    return {
        // State
        status: state.status,
        currentQuestion,
        currentAnswer,
        progress,
        score: state.score,
        streak: state.streak,
        currentDifficulty: state.currentDifficulty,
        elapsedTime,
        elapsedTime,
        answers: state.answers,
        error: state.error,

        // Actions
        startQuiz,
        submitAnswer,
        nextQuestion,
    };
};
