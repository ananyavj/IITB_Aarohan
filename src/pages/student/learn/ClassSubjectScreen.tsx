import { useNavigate } from 'react-router-dom';
import { BookOpen, Beaker, Type } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui';

const ClassSubjectScreen = () => {
    const navigate = useNavigate();
    const { userProfile } = useAppStore();

    const subjects = [
        {
            id: 'mathematics',
            name: 'Mathematics',
            icon: BookOpen,
            color: 'bg-blue-500',
            description: 'Numbers, Algebra, Geometry'
        },
        {
            id: 'science',
            name: 'Science',
            icon: Beaker,
            color: 'bg-green-500',
            description: 'Physics, Chemistry, Biology'
        },
        {
            id: 'english',
            name: 'English',
            icon: Type,
            color: 'bg-purple-500',
            description: 'Grammar, Literature, Writing'
        },
    ];

    const handleSubjectClick = (subjectName: string) => {
        navigate(`/student/learn/subject/${subjectName.toLowerCase()}`);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Learn</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Class {userProfile.class || '10'} - Choose a subject to start learning
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.map(({ id, name, icon: Icon, color, description }) => (
                    <Card
                        key={id}
                        className="cursor-pointer hover:shadow-xl transition-all group"
                        onClick={() => handleSubjectClick(name)}
                    >
                        <div className="p-6">
                            <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">{name}</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {description}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ClassSubjectScreen;
