import { db } from './db';
import type { Question } from './db';

const SEED_FLAG_KEY = 'database_seeded';

export const seedDatabase = async (): Promise<void> => {
    console.log('[Seed] Checking if database needs seeding...');

    try {
        // Check if database has actual data (not just a flag)
        const curriculumCount = await db.curriculums.count();
        const chaptersCount = await db.chapters.count();

        if (curriculumCount > 0 && chaptersCount > 0) {
            console.log('[Seed] Database already has data, skipping seed...');
            console.log(`[Seed] Found ${curriculumCount} curriculums and ${chaptersCount} chapters`);
            return;
        }

        // Database is empty or incomplete - proceed with seeding
        console.log('[Seed] Database is empty or incomplete. Starting fresh seed...');

        // Clear any partial data to ensure clean state
        await db.chapters.clear();
        await db.sections.clear();
        await db.books.clear();
        await db.subjects.clear();
        await db.classLevels.clear();
        await db.curriculums.clear();
        await db.questions.clear();
        await db.appMeta.clear();
        // Create curriculum
        const curriculumId = await db.curriculums.add({
            name: 'NCERT',
            description: 'National Council of Educational Research and Training'
        });

        // Create class levels (focusing on 9-12 for demo)
        const classLevels = [9, 10, 11, 12];
        const classLevelIds: Record<number, number> = {};

        for (const level of classLevels) {
            const id = await db.classLevels.add({
                level,
                curriculumId
            });
            classLevelIds[level] = id;
        }

        // Create subjects and books for each class
        const subjects = [
            { name: 'Mathematics', hasBooks: true },
            { name: 'Science', hasBooks: true },
            { name: 'English', hasBooks: true }
        ];

        const chapterIdMap: Record<string, number> = {};

        for (const classLevel of classLevels) {
            const classLevelId = classLevelIds[classLevel];

            for (const subject of subjects) {
                const subjectId = await db.subjects.add({
                    name: subject.name,
                    classLevelId
                });

                // Add books for the subject
                if (subject.hasBooks) {
                    const bookTitle = `${subject.name} - Class ${classLevel}`;
                    const bookId = await db.books.add({
                        title: bookTitle,
                        subjectId,
                        classLevelId
                    });

                    // ONLY add chapters and sections for Mathematics
                    // Science and English books exist but have no chapters (Coming Soon)
                    if (subject.name === 'Mathematics') {
                        const chapterTitles = getChapterTitles(subject.name);
                        for (let i = 0; i < chapterTitles.length; i++) {
                            const chapterId = await db.chapters.add({
                                title: chapterTitles[i],
                                bookId,
                                order: i + 1
                            });

                            // Store chapter ID for quiz question mapping
                            const key = `${subject.name}-${classLevel}-${chapterTitles[i]}`;
                            chapterIdMap[key] = chapterId;

                            // Add 5 sections to each chapter
                            for (let j = 1; j <= 5; j++) {
                                await db.sections.add({
                                    title: `${getSectionTitle(j - 1)}`,
                                    chapterId,
                                    order: j,
                                    content: getSectionContent(chapterTitles[i], j)
                                });
                            }
                        }
                    }
                    // Science and English: Book exists but no chapters = "Coming Soon"
                }
            }
        }

        // Seed Quiz Questions
        console.log('[Seed] Seeding quiz questions...');
        const questions = getQuizQuestions(chapterIdMap);
        for (const question of questions) {
            await db.questions.add(question);
        }

        // Seed default calendars
        console.log('[Seed] Seeding default calendars...');

        // Check if calendars already exist to prevent duplicates
        const existingStudentCalendar = await db.calendars
            .where('name').equals('My Study Plan')
            .and(cal => cal.userId === 1)
            .first();

        // Student personal calendar (userId: 1)
        if (!existingStudentCalendar) {
            await db.calendars.add({
                userId: 1,
                name: 'My Study Plan',
                defaultColor: '#3b82f6',
                isVisible: true,
                scope: 'personal',
                createdAt: new Date(),
            });
            console.log('[Seed] Created "My Study Plan" calendar');
        }

        // Demo class calendars (for Class 10, created by teacher userId: 2)
        // These will be visible to all Class 10 students
        const mathSubject = await db.subjects.where('name').equals('Mathematics').first();
        const scienceSubject = await db.subjects.where('name').equals('Science').first();

        if (mathSubject) {
            const existingMathCalendar = await db.calendars
                .where('name').equals('Class 10 - Mathematics')
                .first();

            if (!existingMathCalendar) {
                await db.calendars.add({
                    userId: 2, // Teacher
                    name: 'Class 10 - Mathematics',
                    defaultColor: '#8b5cf6',
                    isVisible: true,
                    scope: 'class',
                    classLevel: 10,
                    subjectId: mathSubject.id,
                    createdAt: new Date(),
                });
                console.log('[Seed] Created "Class 10 - Mathematics" calendar');
            }
        }

        if (scienceSubject) {
            const existingScienceCalendar = await db.calendars
                .where('name').equals('Class 10 - Science')
                .first();

            if (!existingScienceCalendar) {
                await db.calendars.add({
                    userId: 2, // Teacher
                    name: 'Class 10 - Science',
                    defaultColor: '#ec4899',
                    isVisible: true,
                    scope: 'class',
                    classLevel: 10,
                    subjectId: scienceSubject.id,
                    createdAt: new Date(),
                });
                console.log('[Seed] Created "Class 10 - Science" calendar');
            }
        }

        // Optionally seed a sample class event
        const mathCalendar = await db.calendars.where('name').equals('Class 10 - Mathematics').first();
        if (mathCalendar && mathSubject) {
            // Check if event already exists
            const existingEvent = await db.calendarEvents
                .where('calendarId').equals(mathCalendar.id!)
                .and(event => event.title === 'Mathematics Unit Test')
                .first();

            if (!existingEvent) {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekEnd = new Date(nextWeek);
                nextWeekEnd.setHours(nextWeek.getHours() + 1);

                await db.calendarEvents.add({
                    calendarId: mathCalendar.id!,
                    userId: 2, // Created by teacher
                    title: 'Mathematics Unit Test',
                    description: 'Chapters 1-3: Real Numbers, Polynomials, Linear Equations',
                    type: 'exam',
                    startTime: nextWeek,
                    endTime: nextWeekEnd,
                    isAllDay: false,
                    scope: 'class',
                    classLevel: 10,
                    targetSubjectId: mathSubject.id,
                    createdAt: new Date(),
                    syncStatus: 'pending',
                });
                console.log('[Seed] Created sample Mathematics Unit Test event');
            }
        }

        // Mark as seeded
        await db.appMeta.add({
            key: SEED_FLAG_KEY,
            value: 'true'
        });

        console.log('[Seed] Database seeded successfully!');
    } catch (error) {
        console.error('[Seed] Error seeding database:', error);
        throw error;
    }
};

// Helper functions to generate dummy content
const getChapterTitles = (subject: string): string[] => {
    if (subject === 'Mathematics') {
        return [
            'Real Numbers',
            'Polynomials',
            'Coordinate Geometry',
            'Linear Equations',
            'Quadratic Equations'
        ];
    } else if (subject === 'Science') {
        return [
            'Chemical Reactions',
            'Acids and Bases',
            'Metals and Non-metals',
            'Periodic Classification',
            'Life Processes'
        ];
    } else {
        return [
            'Grammar Basics',
            'Comprehension Skills',
            'Writing Skills',
            'Literature Studies'
        ];
    }
};

const getSectionTitle = (index: number): string => {
    const titles = [
        'Introduction',
        'Key Concepts',
        'Examples and Applications',
        'Practice Problems',
        'Summary'
    ];
    return titles[index] || `Topic ${index + 1}`;
};

const getSectionContent = (chapterTitle: string, sectionNum: number): string => {
    const contents = [
        // Section 1: Introduction
        `This section provides a comprehensive introduction to "${chapterTitle}". Understanding this topic is fundamental to mastering the subject and will help you build a strong foundation for advanced concepts.

In this section, we will explore the key ideas, examine practical examples, and work through exercises that demonstrate real-world applications. Pay close attention to the concepts presented here, as they form the building blocks for future learning.

The material covered in this introduction will prepare you for the more detailed discussions in subsequent sections. Take your time to read through carefully and make notes of any questions you might have.`,

        // Section 2: Key Concepts
        `**Fundamental Concepts:**

1. **Primary Definition:** The core concept revolves around understanding the relationship between different elements and how they interact with each other. This relationship is governed by specific rules and principles that have been established through years of scientific research.

2. **Key Principles:** 
   - The first principle states that every action has an equal and opposite reaction
   - The second principle focuses on the conservation of energy and matter
   - The third principle deals with transformation and change over time

3. **Important Properties:**
   - Consistency: The phenomena we observe follow predictable patterns
   - Reproducibility: Results can be verified through repeated experiments
   - Universality: These concepts apply across different contexts and scenarios

**Understanding the Basics:**

Let's break down the fundamental ideas step by step. First, consider the basic elements involved in this topic. Each element has specific characteristics that determine how it behaves under different conditions.

When we examine these elements in detail, we can observe patterns that help us predict outcomes and understand complex relationships. This predictive power is what makes studying this topic so valuable.`,

        // Section 3: Examples
        `**Practical Examples:**

Example 1: Real-World Application
Imagine you encounter this concept in everyday life. For instance, when you observe natural phenomena or use technology, these principles are constantly at work. Let's walk through a specific scenario:

Step 1: Identify the situation and the elements involved
Step 2: Apply the relevant principles we've learned
Step 3: Predict the outcome based on our understanding
Step 4: Verify the result and learn from any discrepancies

Example 2: Problem-Solving Approach
Consider a typical problem you might face:
- Given: Initial conditions and known variables
- Find: The unknown quantity or relationship
- Solution: Apply the formulas and concepts systematically
- Verification: Check if the answer makes logical sense

Through these examples, you can see how theoretical knowledge translates into practical problem-solving skills. The key is to practice regularly and apply these concepts to different scenarios.`,

        // Section 4: Practice
        `**Practice Exercises:**

Now it's your turn to apply what you've learned. Here are some practice questions to test your understanding:

Question 1: Can you identify the key concepts in a given scenario?
Question 2: How would you apply these principles to solve a specific problem?
Question 3: What predictions can you make based on the information provided?

**Self-Assessment:**
- Review the key points covered in this section
- Try to explain the concepts in your own words
- Work through additional examples if needed
- Don't hesitate to revisit earlier sections if something is unclear

Remember, mastery comes through practice and repetition. Take your time to fully understand each concept before moving forward. The more you practice, the more confident you'll become in applying these principles.`,

        // Section 5: Summary
        `**Section Summary:**

In this chapter on "${chapterTitle}", we have covered the essential concepts and their applications. Let's recap the main points:

✓ We introduced the fundamental concepts and their significance
✓ We explored the key principles and how they apply in different contexts
✓ We examined practical examples to illustrate real-world applications
✓ We provided practice exercises to reinforce your understanding

**Key Takeaways:**
- Understanding these concepts is crucial for success in this subject
- The principles we studied have wide-ranging applications
- Practice and repetition are essential for mastery
- These foundations will support your learning in more advanced topics

**Next Steps:**
Continue to the next chapter to build upon these foundational concepts. Each chapter is designed to progressively deepen your understanding and prepare you for more complex material.

If you found any part challenging, consider reviewing the relevant portions again. There's no rush – take the time you need to fully grasp these important ideas. Remember, solid fundamentals lead to greater success in advanced topics!`
    ];

    return contents[sectionNum - 1] || contents[0];
};

// Quiz questions seed data
const getQuizQuestions = (chapterIdMap: Record<string, number>): Omit<Question, 'id'>[] => {
    const mathRealNumbersKey = 'Mathematics-10-Real Numbers';
    const scienceChemKey = 'Science-10-Chemical Reactions';

    const questions: Omit<Question, 'id'>[] = [];

    // Mathematics - Real Numbers Questions
    if (chapterIdMap[mathRealNumbersKey]) {
        const chapterId = chapterIdMap[mathRealNumbersKey];

        questions.push(
            // Easy MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'easy',
                body: 'Which of the following is a rational number?',
                options: ['√2', 'π', '0.5', '√3'],
                correctAnswer: '2',
                explanation: '0.5 can be expressed as 1/2, making it a rational number.',
                skillTags: ['rational-numbers', 'basics']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'easy',
                body: 'What is the decimal expansion of a rational number?',
                options: ['Always terminating', 'Always non-terminating', 'Terminating or non-terminating repeating', 'Always non-terminating non-repeating'],
                correctAnswer: '2',
                explanation: 'Rational numbers have either terminating or non-terminating repeating decimal expansions.',
                skillTags: ['rational-numbers', 'decimals']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'easy',
                body: '0 is a:',
                options: ['Positive number', 'Negative number', 'Neither positive nor negative', 'Both positive and negative'],
                correctAnswer: '2',
                explanation: '0 is neither positive nor negative',
                skillTags: ['number-system', 'basics']
            },

            // Medium MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'medium',
                body: 'Express 0.333... as a fraction:',
                options: ['1/2', '1/3', '3/10', '3/9'],
                correctAnswer: '1',
                explanation: 'Let x = 0.333..., then 10x = 3.333..., so 10x - x = 3, giving x = 1/3',
                skillTags: ['rational-numbers', 'decimals', 'conversion']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'medium',
                body: 'The product of a non-zero rational and an irrational number is:',
                options: ['Always rational', 'Always irrational', 'Can be rational or irrational', 'Always zero'],
                correctAnswer: '1',
                explanation: 'The product of a non-zero rational and an irrational is always irrational.',
                skillTags: ['irrational-numbers', 'operations']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'medium',
                body: 'Which of the following is irrational?',
                options: ['√4', '√9', '√16', '√5'],
                correctAnswer: '3',
                explanation: '√5 cannot be expressed as p/q where p and q are integers, making it irrational.',
                skillTags: ['irrational-numbers', 'identification']
            },

            // Hard MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'hard',
                body: 'If √2 + √3 = √n where n is rational, then:',
                options: ['n = 5', 'n = 6', 'Such n does not exist', 'n = 2√6'],
                correctAnswer: '2',
                explanation: 'Sum of two irrational numbers need not be rational. (√2 + √3)² = 5 + 2√6, which is irrational.',
                skillTags: ['irrational-numbers', 'surds', 'advanced']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'hard',
                body: 'The decimal expansion of 17/8 will be:',
                options: ['Terminating', 'Non-terminating repeating', 'Non-terminating non-repeating', 'Cannot determine'],
                correctAnswer: '0',
                explanation: '8 = 2³, so denominator has only 2 as prime factor. Hence decimal expansion is terminating.',
                skillTags: ['rational-numbers', 'decimal-expansion', 'theorems']
            },

            // Short Answer Questions
            {
                chapterId,
                type: 'short',
                difficulty: 'easy',
                body: 'Is zero a rational number? Justify your answer.',
                correctAnswer: 'Yes, zero is a rational number because it can be expressed as 0/1, where 0 and 1 are integers and 1 ≠ 0.',
                explanation: 'A rational number is any number that can be expressed as p/q where p and q are integers and q ≠ 0.',
                skillTags: ['rational-numbers', 'definitions']
            },
            {
                chapterId,
                type: 'short',
                difficulty: 'medium',
                body: 'Express 2.363636... in the form p/q.',
                correctAnswer: 'Let x = 2.363636..., then 100x = 236.363636..., Subtracting: 99x = 234, so x = 234/99 = 26/11',
                explanation: 'Use the standard method of subtracting to eliminate repeating decimals.',
                skillTags: ['rational-numbers', 'conversion', 'problem-solving']
            },

            // Long Answer Questions
            {
                chapterId,
                type: 'long',
                difficulty: 'hard',
                body: 'Prove that √3 is an irrational number.',
                correctAnswer: 'Proof by contradiction: Assume √3 is rational, then √3 = p/q where p,q are coprime integers. Squaring: 3 = p²/q², so p² = 3q². This means 3 divides p². Therefore 3 divides p. Let p = 3m. Then 9m² = 3q², so 3m² = q². This means 3 divides q². Therefore 3 divides q. But this contradicts our assumption that p and q are coprime. Hence √3 is irrational.',
                explanation: 'Use proof by contradiction, similar to the proof that √2 is irrational.',
                skillTags: ['irrational-numbers', 'proofs', 'advanced']
            }
        );
    }

    // Science - Chemical Reactions Questions
    if (chapterIdMap[scienceChemKey]) {
        const chapterId = chapterIdMap[scienceChemKey];

        questions.push(
            // Easy MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'easy',
                body: 'What is a chemical reaction?',
                options: ['Physical change only', 'Formation of new substances', 'Change in state', 'All of the above'],
                correctAnswer: '1',
                explanation: 'A chemical reaction involves the formation of new substances with different properties.',
                skillTags: ['chemical-reactions', 'basics']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'easy',
                body: 'Which of the following is a sign of a chemical reaction?',
                options: ['Change in color', 'Evolution of gas', 'Formation of precipitate', 'All of the above'],
                correctAnswer: '3',
                explanation: 'All mentioned are signs that a chemical reaction has occurred.',
                skillTags: ['chemical-reactions', 'observations']
            },

            // Medium MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'medium',
                body: 'In a balanced chemical equation, the number of atoms of each element:',
                options: ['Increases', 'Decreases', 'Remains the same', 'May increase or decrease'],
                correctAnswer: '2',
                explanation: 'Law of conservation of mass states that atoms are neither created nor destroyed in a reaction.',
                skillTags: ['chemical-equations', 'balancing', 'laws']
            },
            {
                chapterId,
                type: 'mcq',
                difficulty: 'medium',
                body: 'Which type of reaction is: CaCO₃ → CaO + CO₂',
                options: ['Combination', 'Decomposition', 'Displacement', 'Double displacement'],
                correctAnswer: '1',
                explanation: 'This is a decomposition reaction where one compound breaks down into two or more simpler substances.',
                skillTags: ['reaction-types', 'decomposition']
            },

            // Hard MCQ Questions
            {
                chapterId,
                type: 'mcq',
                difficulty: 'hard',
                body: 'When Fe reacts with CuSO₄ solution, the reaction is:',
                options: ['Oxidation only', 'Reduction only', 'Redox reaction', 'No reaction'],
                correctAnswer: '2',
                explanation: 'Fe is oxidized to Fe²⁺ and Cu²⁺ is reduced to Cu. This is a redox reaction.',
                skillTags: ['redox-reactions', 'oxidation-reduction', 'advanced']
            },

            // Short Answer
            {
                chapterId,
                type: 'short',
                difficulty: 'easy',
                body: 'Define a balanced chemical equation.',
                correctAnswer: 'A balanced chemical equation has equal number of atoms of each element on both sides of the equation, following the law of conservation of mass.',
                explanation: 'Balancing ensures that mass is conserved in the reaction.',
                skillTags: ['chemical-equations', 'definitions']
            },
            {
                chapterId,
                type: 'short',
                difficulty: 'medium',
                body: 'What is a combination reaction? Give one example.',
                correctAnswer: 'A combination reaction is when two or more substances combine to form a single product. Example: 2Mg + O₂ → 2MgO',
                explanation: 'Combination reactions are also called synthesis reactions.',
                skillTags: ['reaction-types', 'combination', 'examples']
            }
        );
    }

    return questions;
};
