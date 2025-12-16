import { useAppStore } from '@/store/useAppStore';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({ className = '', variant = 'rectangular' }: SkeletonProps) => {
    const { deviceProfile } = useAppStore();
    const isLite = deviceProfile === 'lite';

    // Base styles
    const baseStyles = 'bg-gray-200 dark:bg-gray-700';

    // Animation (only for standard/pro)
    const animation = isLite ? '' : 'animate-pulse';

    // Variants
    const variants = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    return (
        <div
            className={`${baseStyles} ${animation} ${variants[variant]} ${className}`}
        />
    );
};
