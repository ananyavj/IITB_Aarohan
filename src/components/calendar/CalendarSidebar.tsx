import { Eye, EyeOff, Plus } from 'lucide-react';
import type { Calendar } from '@/db/db';
import { toggleCalendarVisibility } from '@/repositories/calendarRepository';

interface CalendarSidebarProps {
    calendars: Calendar[];
    onCreateCalendar?: () => void;
}

export const CalendarSidebar = ({ calendars, onCreateCalendar }: CalendarSidebarProps) => {
    const handleToggleVisibility = async (calendarId: number) => {
        await toggleCalendarVisibility(calendarId);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Calendars</h2>
                {onCreateCalendar && (
                    <button
                        onClick={onCreateCalendar}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Add calendar"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {calendars.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No calendars yet
                    </p>
                ) : (
                    calendars.map((calendar) => (
                        <div
                            key={calendar.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                            {/* Visibility toggle button */}
                            <button
                                onClick={() => handleToggleVisibility(calendar.id!)}
                                className="flex-shrink- p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title={calendar.isVisible ? 'Hide calendar' : 'Show calendar'}
                            >
                                {calendar.isVisible ? (
                                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                                )}
                            </button>

                            {/* Color indicator */}
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: calendar.defaultColor }}
                            />

                            {/* Calendar name */}
                            <span className={`
                                text-sm flex-1 min-w-0 truncate
                                ${calendar.isVisible
                                    ? 'text-gray-900 dark:text-gray-100'
                                    : 'text-gray-400 dark:text-gray-600'}
                            `}>
                                {calendar.name}
                            </span>

                            {/* Class calendar indicator */}
                            {calendar.scope === 'class' && (
                                <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                                    Class
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CalendarSidebar;
