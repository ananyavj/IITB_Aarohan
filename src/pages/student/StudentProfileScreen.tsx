import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { useSyncManager } from '@/hooks/useSyncManager';
import { formatDistanceToNow } from 'date-fns';

const StudentProfileScreen = () => {
    const navigate = useNavigate();
    const { userProfile, resetStore } = useAppStore();
    const { status, isOnline, lastSyncTime, pendingCount, triggerSync } = useSyncManager();

    const handleLogout = () => {
        resetStore();
        navigate('/splash');
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Name
                        </label>
                        <p className="text-lg">{userProfile.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Class
                        </label>
                        <p className="text-lg">Class {userProfile.class}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Language
                        </label>
                        <p className="text-lg">{userProfile.language}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Role
                        </label>
                        <p className="text-lg capitalize">{userProfile.role}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Sync Status</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Connection</span>
                        <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Last Synced</span>
                        <span className="font-medium">
                            {lastSyncTime
                                ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
                                : 'Never'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Pending Items</span>
                        <span className={`font-medium ${pendingCount > 0 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {pendingCount}
                        </span>
                    </div>
                    <Button
                        onClick={() => triggerSync()}
                        disabled={!isOnline || status === 'syncing'}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                    >
                        {status === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </CardContent>
            </Card>

            <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                size="lg"
            >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
            </Button>
        </div >
    );
};

export default StudentProfileScreen;
