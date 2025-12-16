import { db } from '@/db/db';
import type { Question, QuizSession, QuizAnswer, SkillEvent } from '@/db/db';
import { logSyncEvent } from './syncRepository';

export const getQuestionsByChapter = async (
    chapterId: number,
    difficulty?: 'easy' | 'medium' | 'hard',
    limit?: number
): Promise<Question[]> => {
    let query = db.questions.where('chapterId').equals(chapterId);

    if (difficulty) {
        const all = await query.toArray();
        const filtered = all.filter(q => q.difficulty === difficulty);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    const questions = await query.toArray();
    return limit ? questions.slice(0, limit) : questions;
};

export const getRandomQuestions = async (
    chapterId: number,
    count: number,
    difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> => {
    const questions = await getQuestionsByChapter(chapterId, difficulty);

    // Shuffle and take first 'count' questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const createQuizSession = async (
    userId: number,
    chapterId: number
): Promise<number> => {
    const sessionId = await db.quizSessions.add({
        userId,
        chapterId,
        createdAt: new Date()
    });
    return sessionId;
};

export const completeQuizSession = async (
    sessionId: number,
    score: number
): Promise<void> => {
    await db.quizSessions.update(sessionId, {
        score,
        completedAt: new Date()
    });
    await logSyncEvent('quiz_session', sessionId, 'update');
};


export const logQuizAnswer = async (
    sessionId: number,
    questionId: number,
    answer: string,
    correct: boolean
): Promise<number> => {
    const answerId = await db.quizAnswers.add({
        sessionId,
        questionId,
        answer,
        correct
    });
    return answerId;
};

export const logSkillEvent = async (
    userId: number,
    questionId: number,
    correct: boolean,
    timeTaken: number
): Promise<number> => {
    const eventId = await db.skillEvents.add({
        userId,
        questionId,
        correct,
        timeTaken,
        timestamp: new Date()
    });
    // Optional: Sync skill events if you want very granular tracking
    // But typically we sync the Session completion. 
    // Let's sync this too for "real-time" analytics feel
    await logSyncEvent('skill_event', eventId as number, 'create');
    return eventId;
};

export const getQuizHistory = async (
    userId: number,
    limit: number = 10
): Promise<QuizSession[]> => {
    return await db.quizSessions
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt')
        .then(sessions => sessions.slice(0, limit));
};

export const calculateChapterPerformance = async (
    userId: number,
    chapterId: number
): Promise<{ totalQuizzes: number; averageScore: number; bestScore: number }> => {
    const sessions = await db.quizSessions
        .where(['userId', 'chapterId'])
        .equals([userId, chapterId])
        .toArray();

    const completedSessions = sessions.filter(s => s.score !== undefined);

    if (completedSessions.length === 0) {
        return { totalQuizzes: 0, averageScore: 0, bestScore: 0 };
    }

    const scores = completedSessions.map(s => s.score!);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);

    return {
        totalQuizzes: completedSessions.length,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore
    };
};

export const getSkillProficiency = async (
    userId: number,
    skillTag: string
): Promise<number> => {
    // Get all skill events for this user
    const allEvents = await db.skillEvents
        .where('userId')
        .equals(userId)
        .toArray();

    // Get questions with this skill tag
    const questionsWithSkill = await db.questions
        .filter(q => (q.skillTags || []).includes(skillTag))
        .toArray();

    const questionIds = new Set(questionsWithSkill.map(q => q.id!));

    // Filter events for these questions
    const skillEvents = allEvents.filter(e => questionIds.has(e.questionId));

    if (skillEvents.length === 0) return 0;

    // Calculate proficiency as % correct
    const correct = skillEvents.filter(e => e.correct).length;
    return Math.round((correct / skillEvents.length) * 100);
};

export const getWeakSkills = async (
    userId: number
): Promise<Array<{ skill: string; proficiency: number }>> => {
    // Get all unique skill tags
    const allQuestions = await db.questions.toArray();
    const skillTags = new Set<string>();

    allQuestions.forEach(q => {
        q.skillTags?.forEach(tag => skillTags.add(tag));
    });

    // Calculate proficiency for each skill
    const skillProficiencies = await Promise.all(
        Array.from(skillTags).map(async skill => ({
            skill,
            proficiency: await getSkillProficiency(userId, skill)
        }))
    );

    // Return skills with proficiency < 60%, sorted by proficiency
    return skillProficiencies
        .filter(sp => sp.proficiency > 0 && sp.proficiency < 60)
        .sort((a, b) => a.proficiency - b.proficiency);
};
