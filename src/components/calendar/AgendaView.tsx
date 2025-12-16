import { format } from 'date-fns';
import { Clock, MapPin, User } from 'lucide-react';
import type { CalendarEvent } from '@/db/db';
import { Card } from '@/components/ui';

interface AgendaViewProps {
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

export const AgendaView = ({ events, onEventClick }: AgendaViewProps) => {
    // Group events by date
    const groupedEvents: Record<string, CalendarEvent[]> = {};

    events.forEach(event => {
        const dateKey = format(event.startTime, 'yyyy-MM-dd');
        if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(event);
    });

    // Sort dates
    const sortedDates = Object.keys(groupedEvents).sort();

    if (events.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 mb-2">
                    <Clock className="w-12 h-12 mx-auto mb-4" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    No upcoming events
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedDates.map(dateKey => {
                const dayEvents = groupedEvents[dateKey];
                const date = new Date(dateKey);
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

                return (
                    <div key={dateKey}>
                        {/* Date header */}
                        <div className={`
                            sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 
                            py-2 px-4 mb-3 rounded-lg
                            ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        `}>
                            <h3 className={`
                                font-semibold
                                ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}
                            `}>
                                {isToday ? 'Today' : format(date, 'EEEE, MMMM d, yyyy')}
                            </h3>
                        </div>

                        {/* Events for this date */}
                        <div className="space-y-2">
                            {dayEvents.map((event) => {
                                const eventColor = event.color || '#3b82f6';

                                return (
                                    <Card
                                        key={event.id}
                                        className={`
                                            p-4 cursor-pointer hover:shadow-md transition-shadow
                                            border-l-4
                                        `}
                                        style={{ borderLeftColor: eventColor }}
                                        onClick={() => onEventClick?.(event)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Color indicator dot */}
                                            <div
                                                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                                style={{ backgroundColor: eventColor }}
                                            />

                                            <div className="flex-1 min-w-0">
                                                {/* Event title */}
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {event.title}
                                                    </h4>

                                                    {/* Event type badge */}
                                                    <span className={`
                                                        px-2 py-1 text-xs font-medium rounded-full flex-shrink-0
                                                        ${event.type === 'exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                        ${event.type === 'assignment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                                        ${event.type === 'study' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                        ${event.type === 'other' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                    `}>
                                                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Event time */}
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <Clock className="w-4 h-4" />
                                                    {event.isAllDay ? (
                                                        <span>All day</span>
                                                    ) : (
                                                        <span>
                                                            {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Event description */}
                                                {event.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                )}

                                                {/* Class event indicator */}
                                                {event.scope === 'class' && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                                                        <User className="w-3 h-3" />
                                                        <span>Class {event.classLevel} event</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AgendaView;
