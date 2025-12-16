import { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ size = 'md', className = '', children, ...props }, ref) => {
        const sizes = {
            sm: 'p-1',
            md: 'p-2',
            lg: 'p-3',
        };

        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';
