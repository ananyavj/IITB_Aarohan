import { Users, BookOpen, BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { LogOut } from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { userProfile, resetStore } = useAppStore();

    const handleLogout = () => {
        resetStore();
        navigate('/splash');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome, {userProfile.name || 'Teacher'}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your classes and track student progress
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* My Classes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <Users className="w-6 h-6 mr-2 text-primary-600" />
                            <h2 className="text-xl font-semibold">My Classes</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['Class 10 - Mathematics', 'Class 9 - Physics', 'Class 11 - Chemistry'].map((className, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold">{className}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {25 + index * 5} students
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <Calendar className="w-6 h-6 mr-2 text-primary-600" />
                            <h2 className="text-xl font-semibold">Calendar</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create class events for your students. Events you create will be visible to all students in the selected class.
                        </p>
                        <Button
                            onClick={() => navigate('/teacher/calendar')}
                            variant="primary"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Open Calendar
                        </Button>
                    </CardContent>
                </Card>

                {/* Content Library */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <BookOpen className="w-6 h-6 mr-2 text-primary-600" />
                            <h2 className="text-xl font-semibold">Content Library</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Content management coming soon
                            </p>
                            <Button variant="outline">Create Content</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center">
                            <BarChart3 className="w-6 h-6 mr-2 text-primary-600" />
                            <h2 className="text-xl font-semibold">Analytics</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Student analytics and insights coming soon
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;
