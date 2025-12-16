import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
    name: string;
    class: string;
    language: string;
    role: 'student' | 'teacher' | null;
}

interface AppState {
    // User profile
    userProfile: UserProfile;
    setUserProfile: (profile: Partial<UserProfile>) => void;

    // Onboarding
    onboardingComplete: boolean;
    setOnboardingComplete: (complete: boolean) => void;

    // Student tab navigation
    activeTab: string;
    setActiveTab: (tab: string) => void;

    // Device Profile
    deviceProfile: 'lite' | 'standard' | 'pro';
    setDeviceProfile: (profile: 'lite' | 'standard' | 'pro') => void;

    // Actions
    resetStore: () => void;
}

const initialProfile: UserProfile = {
    name: '',
    class: '',
    language: '',
    role: null,
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            userProfile: initialProfile,
            onboardingComplete: false,
            activeTab: 'home',
            deviceProfile: 'standard', // Default

            // Setters
            setDeviceProfile: (profile) => set({ deviceProfile: profile }),

            setUserProfile: (profile) => {
                console.log('[useAppStore] setUserProfile called with:', profile);
                set((state) => {
                    const newProfile = { ...state.userProfile, ...profile };
                    console.log('[useAppStore] New profile will be:', newProfile);
                    return { userProfile: newProfile };
                });
            },

            setOnboardingComplete: (complete) =>
                set({ onboardingComplete: complete }),

            setActiveTab: (tab) =>
                set({ activeTab: tab }),

            // Reset entire store
            resetStore: () =>
                set({
                    userProfile: initialProfile,
                    onboardingComplete: false,
                    activeTab: 'home',
                    deviceProfile: 'standard',
                }),
        }),
        {
            name: 'edu-pwa-storage', // localStorage key
        }
    )
);
