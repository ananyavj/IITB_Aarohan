import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { getUserByUsername, getLastLoggedInUser } from '@/repositories/userRepository';
import { useAppStore } from '@/store/useAppStore';
import type { User } from '@/db/db';

const AuthScreen = () => {
    const navigate = useNavigate();
    const { setUserProfile } = useAppStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [existingUser, setExistingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for last logged in user on mount
    useEffect(() => {
        const checkLastUser = async () => {
            const lastUser = await getLastLoggedInUser();
            if (lastUser) {
                setUsername(lastUser.username);
                setPassword(lastUser.password);
                setExistingUser(lastUser);
            }
        };
        checkLastUser();
    }, []);

    // Check if user exists when username changes
    useEffect(() => {
        const checkUser = async () => {
            if (username.length > 2) {
                const user = await getUserByUsername(username);
                setExistingUser(user || null);
                if (user) {
                    setPassword(user.password); // Auto-fill password for returning users
                }
            } else {
                setExistingUser(null);
            }
        };

        const debounce = setTimeout(checkUser, 300);
        return () => clearTimeout(debounce);
    }, [username]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (existingUser) {
                // Returning user - update last login and navigate to dashboard
                const { updateLastLogin } = await import('@/repositories/userRepository');
                await updateLastLogin(existingUser.id!);

                // Set user profile in store
                setUserProfile({
                    name: existingUser.name,
                    class: existingUser.class || '',
                    language: existingUser.language,
                    role: existingUser.role,
                });

                // Navigate based on role
                if (existingUser.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                // New user - go to profile setup
                navigate('/profile-setup', {
                    state: { username, password }
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        {existingUser ? (
                            <LogIn className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                        ) : (
                            <UserPlus className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                        )}

                        <h1 className="text-2xl font-bold mb-2">
                            {existingUser ? `Welcome Back, ${existingUser.name}!` : 'Sign In'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {existingUser
                                ? 'Click below to continue'
                                : 'Enter username to get started'}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                placeholder="Enter username"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                placeholder="Enter password"
                                required
                                disabled={isLoading || !!existingUser}
                            />
                            {existingUser && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Credentials auto-filled
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : existingUser ? 'Continue' : 'Sign Up'}
                        </Button>
                    </form>

                    {!existingUser && username.length > 2 && (
                        <p className="text-sm text-green-600 dark:text-green-400 text-center mt-4">
                            New user! You'll set up your profile next.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
