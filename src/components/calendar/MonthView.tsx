import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/db/db';
import { Skeleton } from '@/components/ui';

interface MonthViewProps {
    events: CalendarEvent[];
    onDayClick?: (date: Date) => void;
    isLoading?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_OF_YEAR = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthView = ({ events, onDayClick, isLoading = false }: MonthViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const today = new Date();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

    // Build calendar grid (6 weeks × 7 days = 42 cells)
    const calendarDays: (Date | null)[] = [];

    // Previous month days (grayed out)
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }

    // Fill remaining cells
    while (calendarDays.length < 42) {
        calendarDays.push(null);
    }

    // Get events for a specific day
    const getEventsForDay = (date: Date | null): CalendarEvent[] => {
        if (!date) return [];

        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            );
        });
    };

    // Navigation
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date | null): boolean => {
        if (!date) return false;
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header with navigation */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">
                        {MONTHS_OF_YEAR[month]} {year}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                </div>

                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                {calendarDays.map((date, index) => {
                    const dayEvents = getEventsForDay(date);
                    const hasEvents = dayEvents.length > 0;
                    const isTodayDate = isToday(date);
                    const isCurrentMonth = date !== null;

                    return (
                        <div
                            key={index}
                            onClick={() => !isLoading && date && onDayClick?.(date)}
                            className={`
                                bg-white dark:bg-gray-800 min-h-[80px] p-2 
                                ${isCurrentMonth ? (isLoading ? '' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750') : 'bg-gray-50 dark:bg-gray-900'}
                                ${isTodayDate ? 'ring-2 ring-primary-600 ring-inset' : ''}
                                transition-colors
                            `}
                        >
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="w-6 h-6 rounded-full" variant="circular" />
                                    <Skeleton className="w-full h-2 rounded" />
                                    <Skeleton className="w-1/2 h-2 rounded" />
                                </div>
                            ) : (
                                date && (
                                    <div className="flex flex-col h-full">
                                        {/* Day number */}
                                        <div className={`
                                            text-sm font-medium mb-1
                                            ${isTodayDate
                                                ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                                                : 'text-gray-900 dark:text-gray-100'}
                                        `}>
                                            {date.getDate()}
                                        </div>

                                        {/* Event dots (max 3 visible) */}
                                        {hasEvents && (
                                            <div className="flex gap-1 flex-wrap mt-auto">
                                                {dayEvents.slice(0, 3).map((event, i) => {
                                                    // Color by event type
                                                    const typeColor =
                                                        event.type === 'exam' ? '#ef4444' :
                                                            event.type === 'assignment' ? '#f97316' :
                                                                event.type === 'study' ? '#3b82f6' :
                                                                    '#6b7280';

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: typeColor }}
                                                            title={event.title}
                                                        />
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-gray-500">
                                                        +{dayEvents.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
