import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui';
import { createUser } from '@/repositories/userRepository';

const ProfileSetupScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { username, password } = location.state || {};
    const { userProfile, setUserProfile, setOnboardingComplete } = useAppStore();

    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [language, setLanguage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            alert('Missing credentials. Please start from login.');
            navigate('/auth');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create user in database
            const userId = await createUser({
                username,
                password,
                role: userProfile.role,
                name,
                class: userProfile.role === 'student' ? selectedClass : undefined,
                language: language as 'en' | 'hi' | 'ta',
            });

            console.log('[ProfileSetup] User created with ID:', userId);

            // Save profile to store
            setUserProfile({
                name,
                class: selectedClass,
                language,
                role: userProfile.role,
            });

            setOnboardingComplete(true);

            // Navigate based on role
            if (userProfile.role === 'student') {
                navigate('/student/dashboard');
            } else {
                navigate('/teacher/dashboard');
            }
        } catch (error) {
            console.error('[ProfileSetup] Error creating user:', error);
            alert('Failed to create profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const classes = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <User className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Tell us a bit about yourself
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                placeholder="Enter your full name"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {userProfile.role === 'student' && (
                            <div>
                                <label htmlFor="class" className="block text-sm font-medium mb-2">
                                    Class
                                </label>
                                <select
                                    id="class"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select your class</option>
                                    {classes.map((cls) => (
                                        <option key={cls} value={cls}>
                                            Class {cls}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="language" className="block text-sm font-medium mb-2">
                                Preferred Language
                            </label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="" disabled>
                                    🌐 Choose Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
                                </option>
                                <option value="en">English</option>
                                <option value="hi">हिंदी (Hindi)</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Get Started'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetupScreen;
