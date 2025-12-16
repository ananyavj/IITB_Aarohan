import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

// Extend Navigator interface for non-standard properties
declare global {
    interface Navigator {
        deviceMemory?: number;
        connection?: {
            saveData: boolean;
            effectiveType: string;
        };
    }
}

export const useDeviceProfile = () => {
    const { setDeviceProfile } = useAppStore();

    useEffect(() => {
        const detectProfile = () => {
            // 1. Check for Data Saver or Slow Connection
            if (navigator.connection?.saveData || navigator.connection?.effectiveType === '2g') {
                return 'lite';
            }

            // 2. RAM Heuristic
            // deviceMemory returns roughly 0.25, 0.5, 1, 2, 4, 8 (GB)
            const ram = navigator.deviceMemory || 4; // Default to 4 if unknown

            // 3. CPU Heuristic
            const cores = navigator.hardwareConcurrency || 4; // Default to 4 if unknown

            if (ram < 4 || cores < 4) {
                return 'lite';
            }

            if (ram >= 8 && cores >= 8) {
                return 'pro';
            }

            return 'standard';
        };

        const profile = detectProfile();
        console.log(`[DeviceProfile] Detected: ${profile} (RAM: ${navigator.deviceMemory}GB, Cores: ${navigator.hardwareConcurrency})`);
        setDeviceProfile(profile);

    }, [setDeviceProfile]);
};
