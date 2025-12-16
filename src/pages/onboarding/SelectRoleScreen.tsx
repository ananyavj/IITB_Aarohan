import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui';

const SelectRoleScreen = () => {
    const navigate = useNavigate();
    const setUserProfile = useAppStore((state) => state.setUserProfile);

    const handleRoleSelect = (role: 'student' | 'teacher') => {
        setUserProfile({ role });
        navigate('/auth');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-12">
                    Please select your role to continue
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => handleRoleSelect('student')}
                        className="w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500 group"
                    >
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary-600 group-hover:scale-110 transition-transform" />
                        <h2 className="text-2xl font-bold mb-2">I'm a Student</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Access lessons, practice, and track your progress
                        </p>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('teacher')}
                        className="w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500 group"
                    >
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary-600 group-hover:scale-110 transition-transform" />
                        <h2 className="text-2xl font-bold mb-2">I'm a Teacher</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage classes, content, and student analytics
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectRoleScreen;
