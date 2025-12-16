import Dexie, { type Table } from 'dexie';

// Type definitions
export interface Curriculum {
    id?: number;
    name: string;
    description: string;
}

export interface ClassLevel {
    id?: number;
    level: number;
    curriculumId: number;
}

export interface Subject {
    id?: number;
    name: string;
    classLevelId: number;
}

export interface Book {
    id?: number;
    title: string;
    subjectId: number;
    classLevelId: number;
}

export interface Chapter {
    id?: number;
    title: string;
    bookId: number;
    order: number;
}

export interface Section {
    id?: number;
    title: string;
    chapterId: number;
    order: number;
    content: string;
}

export interface ContentAsset {
    id?: number;
    type: 'image' | 'video' | 'audio';
    url: string;
    sectionId: number;
}

export interface Note {
    id?: number;
    content: string;
    sectionId: number;
    chapterId: number;
    userId: number;
    tags?: string[];
    syncStatus?: 'pending' | 'synced';
    createdAt: Date;
    updatedAt?: Date;
}

export interface Bookmark {
    id?: number;
    sectionId: number;
    userId: number;
    createdAt: Date;
}

export interface QuizSession {
    id?: number;
    chapterId: number;
    userId: number;
    score?: number;
    completedAt?: Date;
    createdAt: Date;
}

export interface QuizAnswer {
    id?: number;
    sessionId: number;
    questionId: number;
    answer: string;
    correct: boolean;
}

export interface StudyEvent {
    id?: number;
    userId: number;
    sectionId: number;
    duration: number;
    timestamp: Date;
}

export interface Calendar {
    id?: number;
    userId: number;
    name: string;
    defaultColor: string;
    isVisible: boolean;
    scope: 'personal' | 'class';
    classLevel?: number;
    subjectId?: number;
    createdAt: Date;
}

export interface CalendarEvent {
    id?: number;
    calendarId: number;
    title: string;
    description?: string;
    type: 'study' | 'exam' | 'assignment' | 'other';
    startTime: Date;
    endTime: Date;
    isAllDay: boolean;
    color?: string;
    chapterId?: number;
    subjectId?: number;
    userId: number;
    scope: 'personal' | 'class';
    classLevel?: number;
    targetSubjectId?: number;
    createdAt: Date;
    updatedAt?: Date;
    syncStatus?: 'pending' | 'synced';
}

export interface AIOutput {
    id?: number;
    requestId: number;
    content: string;
    createdAt: Date;
}

export interface AIRequest {
    id?: number;
    userId: number;
    prompt: string;
    context?: string;
    createdAt: Date;
}

export interface AIFeedback {
    id?: number;
    outputId: number;
    rating: number;
    comment?: string;
}

export interface Question {
    id?: number;
    chapterId: number;
    type: 'mcq' | 'short' | 'long';
    difficulty: 'easy' | 'medium' | 'hard';
    body: string;
    options?: string[]; // For MCQ
    correctAnswer: string; // Answer text or stringified option index
    explanation?: string;
    skillTags?: string[];
}

export interface SkillEvent {
    id?: number;
    userId: number;
    questionId: number;
    correct: boolean;
    timestamp: Date;
    timeTaken: number; // seconds
}

export interface SyncEvent {
    id?: number;
    entityType: string;
    entityId: number;
    action: 'create' | 'update' | 'delete';
    timestamp: Date;
    synced: boolean;
}

export interface UserProfile {
    id?: number;
    name: string;
    class: string;
    language: string;
    role: 'student' | 'teacher';
}

export interface UserSetting {
    id?: number;
    userId: number;
    key: string;
    value: string;
}

// User authentication
export interface User {
    id?: number;
    username: string; // Unique identifier for login
    password: string; // In production, this should be hashed!
    role: 'student' | 'teacher';
    name: string;
    class?: string; // For students
    language: 'en' | 'hi' | 'ta';
    createdAt: Date;
    lastLoginAt: Date;
}

export interface AppMeta {
    id?: number;
    key: string;
    value: string;
}

// Database class
export class EduPWADatabase extends Dexie {
    // Content tables
    curriculums!: Table<Curriculum>;
    classLevels!: Table<ClassLevel>;
    subjects!: Table<Subject>;
    books!: Table<Book>;
    chapters!: Table<Chapter>;
    sections!: Table<Section>;
    contentAssets!: Table<ContentAsset>;

    // User data tables
    notes!: Table<Note>;
    bookmarks!: Table<Bookmark>;

    // Quiz tables
    quizSessions!: Table<QuizSession>;
    quizAnswers!: Table<QuizAnswer>;
    questions!: Table<Question>;
    skillEvents!: Table<SkillEvent>;

    // Activity tables
    studyEvents!: Table<StudyEvent>;

    // Calendar tables
    calendars!: Table<Calendar>;
    calendarEvents!: Table<CalendarEvent>;

    // AI tables
    aiOutputs!: Table<AIOutput>;
    aiRequests!: Table<AIRequest>;
    aiFeedback!: Table<AIFeedback>;

    // System tables
    users!: Table<User>;
    syncEvents!: Table<SyncEvent>;
    userProfiles!: Table<UserProfile>;
    userSettings!: Table<UserSetting>;
    appMeta!: Table<AppMeta>;

    constructor() {
        super('EduPWADB');

        this.version(2).stores({
            // Content tables
            curriculums: '++id, name',
            classLevels: '++id, level, curriculumId',
            subjects: '++id, name, classLevelId',
            books: '++id, title, subjectId, classLevelId',
            chapters: '++id, title, bookId, order',
            sections: '++id, title, chapterId, order',
            contentAssets: '++id, type, sectionId',

            // User data tables
            notes: '++id, sectionId, chapterId, userId, createdAt, syncStatus, *tags, [chapterId+userId], [sectionId+userId]',
            bookmarks: '++id, sectionId, userId, createdAt, [sectionId+userId]',

            // Quiz tables
            quizSessions: '++id, chapterId, userId, [userId+chapterId], completedAt',
            quizAnswers: '++id, sessionId, questionId',
            questions: '++id, chapterId, difficulty, type, *skillTags',
            skillEvents: '++id, userId, questionId, correct, timestamp',

            // Activity tables
            studyEvents: '++id, userId, sectionId, timestamp',

            // Calendar tables
            calendars: '++id, userId, name, scope, classLevel, subjectId, isVisible, createdAt',
            calendarEvents: '++id, calendarId, userId, scope, classLevel, targetSubjectId, startTime, endTime, type, syncStatus',

            // AI tables
            aiOutputs: '++id, requestId, createdAt',
            aiRequests: '++id, userId, createdAt',
            aiFeedback: '++id, outputId',

            // System tables
            users: '++id, &username, role, lastLoginAt',
            syncEvents: '++id, entityType, entityId, synced, timestamp',
            userProfiles: '++id, name',
            userSettings: '++id, userId, key',
            appMeta: '++id, key'
        });
    }
}

// Create and export database instance
export const db = new EduPWADatabase();
