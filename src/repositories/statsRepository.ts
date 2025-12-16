import { db } from '@/db/db';
import { startOfWeek, endOfWeek, subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface StudentStats {
    totalStudyTime: number; // in minutes
    chaptersCompleted: number;
    completedQuizzes: number;
    averageQuizScore: number;
    currentStreak: number;
}

export interface SkillLevel {
    skill: string;
    level: number;
    progress: number;
    totalXP: number;
}

export interface WeeklyActivity {
    date: string;
    study minutes: number;
quizScore: number;
}

/**
 * Get overall student statistics
 */
export const getStudentStats = async (userId: number): Promise<StudentStats> => {
    // 1. Calculate total study time
    const studyEvents = await db.studyEvents
        .where('userId')
        .equals(userId)
        .toArray();

    const totalStudySeconds = studyEvents.reduce((acc, curr) => acc + curr.duration, 0);

    // 2. Calculate completed chapters (based on quiz completion or section views)
    // For simplicity, we count chapters where at least one quiz is completed
    const completedQuizSessions = await db.quizSessions
        .where('userId')
        .equals(userId)
        .filter(s => !!s.completedAt)
        .toArray();

    const uniqueChapters = new Set(completedQuizSessions.map(s => s.chapterId));

    // 3. Average quiz score
    let totalScore = 0;
    let maxTotalScore = 0;

    // We need to know the total questions for each quiz to calculate percentage
    // This is an approximation if we don't track "max score" in session
    // Assuming 10 questions per quiz for now or deriving from answers
    const quizStats = await Promise.all(completedQuizSessions.map(async (session) => {
        const answers = await db.quizAnswers.where('sessionId').equals(session.id!).toArray();
        return {
            score: session.score || 0,
            total: answers.length || 10 // Fallback
        };
    }));

    if (quizStats.length > 0) {
        const sumPercentage = quizStats.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);
        var averageScore = Math.round(sumPercentage / quizStats.length);
    } else {
        var averageScore = 0;
    }

    // 4. Calculate Streak (consecutive days with activity)
    // Combine study events and quiz sessions
    const activityDates = new Set<string>();

    studyEvents.forEach(e => activityDates.add(format(e.timestamp, 'yyyy-MM-dd')));
    completedQuizSessions.forEach(e => activityDates.add(format(e.completedAt!, 'yyyy-MM-dd')));

    const sortedDates = Array.from(activityDates).sort().reverse();
    let streak = 0;
    let checkDate = new Date();

    // Check today
    if (sortedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
        streak++;
        checkDate = subDays(checkDate, 1);
    } else {
        // If not today, check yesterday (streak might be effectively active but not updated today)
        checkDate = subDays(checkDate, 1);
        if (sortedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            // Streak broken
            streak = 0;
        }
    }

    // Continue checking backwards
    while (streak > 0 && sortedDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
        streak++;
        checkDate = subDays(checkDate, 1);
    }

    return {
        totalStudyTime: Math.round(totalStudySeconds / 60),
        chaptersCompleted: uniqueChapters.size,
        completedQuizzes: completedQuizSessions.length,
        averageQuizScore: averageScore,
        currentStreak: streak
    };
};

/**
 * Get skill levels based on quiz performance
 */
export const getSkillLevels = async (userId: number): Promise<SkillLevel[]> => {
    // Collect all skill events
    const skillEvents = await db.skillEvents.where('userId').equals(userId).toArray();

    // We don't have explicit skill 'tags' in the event, but we have questionId
    // We need to fetch questions to get tags
    // This might be expensive, so optimizing by fetching unique questions
    const uniqueQuestionIds = new Set(skillEvents.map(e => e.questionId));
    const questions = await db.questions.bulkGet(Array.from(uniqueQuestionIds));

    const questionMap = new Map();
    questions.forEach(q => {
        if (q) questionMap.set(q.id, q);
    });

    // Aggregate XP by tag
    const skillMap = new Map<string, number>();

    for (const event of skillEvents) {
        const question = questionMap.get(event.questionId);
        if (question && question.skillTags) {
            for (const tag of question.skillTags) {
                const currentXP = skillMap.get(tag) || 0;
                // +10 XP for correct, +1 for attempt
                const xpGain = event.correct ? 10 : 1;
                skillMap.set(tag, currentXP + xpGain);
            }
        } else {
            // Default skill if none
            const currentXP = skillMap.get('General') || 0;
            const xpGain = event.correct ? 10 : 1;
            skillMap.set('General', currentXP + xpGain);
        }
    }

    if (skillMap.size === 0) {
        // Return some defaults if empty
        return [
            { skill: 'Problem Solving', level: 1, progress: 0, totalXP: 0 },
            { skill: 'Critical Thinking', level: 1, progress: 0, totalXP: 0 },
            { skill: 'Conceptual', level: 1, progress: 0, totalXP: 0 },
        ];
    }

    return Array.from(skillMap.entries()).map(([skill, xp]) => {
        // Simple level formula: Level = floor(sqrt(xp / 10)) + 1
        // XP required for next level increases quadratically
        const level = Math.floor(Math.sqrt(xp / 10)) + 1;
        const currentLevelBaseXP = 10 * Math.pow(level - 1, 2);
        const nextLevelBaseXP = 10 * Math.pow(level, 2);
        const progress = Math.round(((xp - currentLevelBaseXP) / (nextLevelBaseXP - currentLevelBaseXP)) * 100);

        return {
            skill,
            level,
            progress,
            totalXP: xp
        };
    }).sort((a, b) => b.totalXP - a.totalXP);
};

/**
 * Get weekly activity for charts
 */
export const getWeeklyActivity = async (userId: number): Promise<{
    labels: string[],
    studyData: number[],
    quizData: number[]
}> => {
    const end = endOfDay(new Date());
    const start = subDays(startOfDay(new Date()), 6); // Last 7 days

    const dates: string[] = [];
    const studyData: number[] = [];
    const quizData: number[] = [];

    // Initialize map for last 7 days
    for (let i = 0; i <= 6; i++) {
        const d = subDays(end, 6 - i);
        dates.push(format(d, 'EEE')); // Mon, Tue, etc.
    }

    // TODO: Implement actual day-by-day aggregation
    // For now returning mock data until we verify the aggregation logic is performance safe
    // doing heavy date operations in loop might be slow if many events

    // Fetch events in range
    const studyEvents = await db.studyEvents
        .where('userId')
        .equals(userId)
        .filter(e => e.timestamp >= start && e.timestamp <= end)
        .toArray();

    const quizSessions = await db.quizSessions
        .where('userId')
        .equals(userId)
        .filter(s => s.completedAt! >= start && s.completedAt! <= end)
        .toArray();

    // Bucketize
    for (let i = 0; i <= 6; i++) {
        const d = subDays(new Date(), 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');

        // Sum study duration
        const dayStudy = studyEvents
            .filter(e => format(e.timestamp, 'yyyy-MM-dd') === dateStr)
            .reduce((acc, curr) => acc + curr.duration, 0);

        studyData.push(Math.round(dayStudy / 60)); // minutes

        // Avg quiz score that day
        const dayQuizzes = quizSessions
            .filter(s => format(s.completedAt!, 'yyyy-MM-dd') === dateStr);

        if (dayQuizzes.length > 0) {
            const avg = dayQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / dayQuizzes.length;
            // Normalize to 100 scale approximately (assuming max 10)
            quizData.push(avg * 10);
        } else {
            quizData.push(0);
        }
    }

    return {
        labels: dates,
        studyData,
        quizData
    };
};
