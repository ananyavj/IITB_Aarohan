import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    defaultValue: string;
    children: ReactNode;
    className?: string;
}

export const Tabs = ({ defaultValue, children, className = '' }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export const TabsList = ({ children, className = '' }: TabsListProps) => {
    return (
        <div className={`flex space-x-1 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export const TabsTrigger = ({ value, children, className = '' }: TabsTriggerProps) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 font-medium transition-colors ${isActive
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                } ${className}`}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const { activeTab } = context;

    if (activeTab !== value) return null;

    return <div className={`pt-4 ${className}`}>{children}</div>;
};
