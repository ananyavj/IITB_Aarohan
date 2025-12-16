import { useState } from 'react';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { useMonthEvents, useCalendars } from '@/hooks/useCalendar';
import MonthView from '@/components/calendar/MonthView';
import AgendaView from '@/components/calendar/AgendaView';
import CalendarSidebar from '@/components/calendar/CalendarSidebar';
import EventEditorDialog from '@/components/calendar/EventEditorDialog';
import { Button } from '@/components/ui';
import type { CalendarEvent } from '@/db/db';

type ViewMode = 'month' | 'agenda';

const TeacherCalendarScreen = () => {
    const now = new Date();
    const [currentMonth] = useState(now.getMonth());
    const [currentYear] = useState(now.getFullYear());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

    // Data
    const monthEvents = useMonthEvents(currentMonth, currentYear);
    const calendars = useCalendars();

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setEditingEvent(undefined);
        setIsEventDialogOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setEditingEvent(event);
        setSelectedDate(null);
        setIsEventDialogOpen(true);
    };

    const handleCreateEvent = () => {
        setEditingEvent(undefined);
        setSelectedDate(null);
        setIsEventDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsEventDialogOpen(false);
        setEditingEvent(undefined);
        setSelectedDate(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-primary-600" />
                            Teacher Calendar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create class events for your students to see
                        </p>
                    </div>

                    <Button
                        onClick={handleCreateEvent}
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Event
                    </Button>
                </div>

                {/* View toggle and Legend */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`
                                px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                                ${viewMode === 'month'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                            `}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('agenda')}
                            className={`
                                px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                                ${viewMode === 'agenda'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                            `}
                        >
                            <List className="w-4 h-4" />
                            Agenda
                        </button>
                    </div>

                    {/* Event Type Legend */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Legend:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Exam</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Assignment</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Study</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Other</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content - Full width calendar */}
            <div>
                {viewMode === 'month' ? (
                    <MonthView
                        events={monthEvents || []}
                        onDayClick={handleDayClick}
                    />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <AgendaView
                            events={monthEvents || []}
                            onEventClick={handleEventClick}
                        />
                    </div>
                )}
            </div>

            {/* Event editor dialog */}
            <EventEditorDialog
                isOpen={isEventDialogOpen}
                onClose={handleCloseDialog}
                event={editingEvent}
                calendars={calendars || []}
                defaultDate={selectedDate || undefined}
            />
        </div>
    );
};

export default TeacherCalendarScreen;
