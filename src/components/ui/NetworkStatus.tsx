import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSyncManager } from '@/hooks/useSyncManager';

export const NetworkStatus = () => {
    const { status, isOnline, pendingCount } = useSyncManager();
    const [isVisible, setIsVisible] = useState(true);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'warning' | 'error' | 'info'>('info');

    useEffect(() => {
        if (!isOnline) {
            setMessage('You are offline. Changes will sync when online.');
            setType('warning');
            setIsVisible(true);
        } else if (status === 'syncing') {
            setMessage('Syncing data...');
            setType('info');
            setIsVisible(true);
        } else if (status === 'error') {
            setMessage('Sync failed. Retrying...');
            setType('error');
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 3000);
            return () => clearTimeout(timer);
        } else {
            // Online and Idle
            setMessage('Online');
            setType('success');
            setIsVisible(true);
        }
    }, [isOnline, status, pendingCount]);

    const getIcon = () => {
        if (!isOnline) return <WifiOff className="w-4 h-4" />;
        if (type === 'success') return <Wifi className="w-4 h-4" />;
        if (status === 'syncing') return <RefreshCcw className="w-4 h-4 animate-spin" />;
        if (status === 'error') return <AlertTriangle className="w-4 h-4" />;
        return <CheckCircle className="w-4 h-4" />;
    };

    const getBgColor = () => {
        if (!isOnline) return 'bg-gray-800 text-white border-gray-700';
        if (type === 'success') return 'bg-green-600 text-white border-green-500';
        if (type === 'error') return 'bg-red-600 text-white border-red-500';
        return 'bg-blue-600 text-white border-blue-500'; // Syncing
    };

    // Always render, no null return
    return (
        <div
            className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1 rounded-full shadow-md border ${getBgColor()} text-xs font-medium transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}
        >
            {getIcon()}
            <span>{message}</span>
        </div>
    );
};
