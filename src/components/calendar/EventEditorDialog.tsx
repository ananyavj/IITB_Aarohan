import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { CalendarEvent, Calendar } from '@/db/db';
import { createEvent, updateEvent, deleteEvent, canUserEditEvent } from '@/repositories/calendarRepository';
import { useAppStore } from '@/store/useAppStore';

interface EventEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    event?: CalendarEvent; // If editing
    calendars: Calendar[];
    defaultCalendarId?: number;
    defaultDate?: Date;
    defaultChapterId?: number;
    defaultSubjectId?: number;
}

export const EventEditorDialog = ({
    isOpen,
    onClose,
    event,
    calendars,
    defaultCalendarId,
    defaultDate,
    defaultChapterId,
    defaultSubjectId,
}: EventEditorDialogProps) => {
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth
    const isTeacher = userProfile.role === 'teacher';
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [calendarId, setCalendarId] = useState<number>(defaultCalendarId || 0);
    const [type, setType] = useState<'study' | 'exam' | 'assignment' | 'other'>('study');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [scope, setScope] = useState<'personal' | 'class'>('personal');
    const [targetClassLevel, setTargetClassLevel] = useState<number>(classLevel || 10);
    const [targetSubjectId, setTargetSubjectId] = useState<number | undefined>(defaultSubjectId);

    const [canEdit, setCanEdit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form when  event changes
    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description || '');
            setCalendarId(event.calendarId);
            setType(event.type);

            const start = new Date(event.startTime);
            const end = new Date(event.endTime);

            setStartDate(start.toISOString().split('T')[0]);
            setStartTime(start.toTimeString().slice(0, 5));
            setEndDate(end.toISOString().split('T')[0]);
            setEndTime(end.toTimeString().slice(0, 5));
            setIsAllDay(event.isAllDay);
            setScope(event.scope);
            setTargetClassLevel(event.classLevel || classLevel || 10);
            setTargetSubjectId(event.targetSubjectId);

            // Check if user can edit
            canUserEditEvent(event.id!, userId).then(setCanEdit);
        } else {
            // Reset for new event
            setTitle('');
            setDescription('');
            setCalendarId(defaultCalendarId || (calendars.length > 0 ? calendars[0].id! : 0));
            setType('study');

            const defaultStart = defaultDate || new Date();
            const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // +1 hour

            setStartDate(defaultStart.toISOString().split('T')[0]);
            setStartTime('09:00');
            setEndDate(defaultEnd.toISOString().split('T')[0]);
            setEndTime('10:00');
            setIsAllDay(false);
            setScope('personal');
            setTargetClassLevel(classLevel || 10);
            setTargetSubjectId(defaultSubjectId);
            setCanEdit(true);
        }
    }, [event, defaultDate, defaultCalendarId, defaultSubjectId, calendars, userId, classLevel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        // Auto-assign to first calendar if not set
        const finalCalendarId = calendarId || (calendars.length > 0 ? calendars[0].id! : 1);

        setIsSubmitting(true);

        try {
            // Parse dates
            const startDateTime = isAllDay
                ? new Date(`${startDate}T00:00:00`)
                : new Date(`${startDate}T${startTime}:00`);

            const endDateTime = isAllDay
                ? new Date(`${endDate}T23:59:59`)
                : new Date(`${endDate}T${endTime}:00`);

            // Auto-assign color based on event type
            const typeColor =
                type === 'exam' ? '#ef4444' :
                    type === 'assignment' ? '#f97316' :
                        type === 'study' ? '#3b82f6' :
                            '#6b7280';

            const eventData = {
                calendarId: finalCalendarId,
                title,
                description,
                type,
                startTime: startDateTime,
                endTime: endDateTime,
                isAllDay,
                color: typeColor,
                chapterId: defaultChapterId,
                subjectId: defaultSubjectId,
                userId,
                scope,
                classLevel: scope === 'class' ? targetClassLevel : undefined,
                targetSubjectId: scope === 'class' ? targetSubjectId : undefined,
                createdAt: new Date(),
            };

            if (event) {
                // Update existing
                await updateEvent(event.id!, eventData);
            } else {
                // Create new
                await createEvent(eventData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!event || !confirm('Are you sure you want to delete this event?')) return;

        setIsSubmitting(true);
        try {
            await deleteEvent(event.id!);
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'New Event'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title *
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                        required
                        disabled={!canEdit}
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                        disabled={!canEdit}
                    />
                </div>

                {/* Type */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">
                        Type *
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                        required
                        disabled={!canEdit}
                    >
                        <option value="study">Study</option>
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Scope (Teachers only) */}
                {isTeacher && !event && (
                    <div>
                        <label htmlFor="scope" className="block text-sm font-medium mb-1">
                            Visibility
                        </label>
                        <select
                            id="scope"
                            value={scope}
                            onChange={(e) => setScope(e.target.value as 'personal' | 'class')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                        >
                            <option value="personal">Personal (Only I can see)</option>
                            <option value="class">Class (All students in class can see)</option>
                        </select>
                    </div>
                )}

                {/* Class targeting (if scope = class) */}
                {scope === 'class' && isTeacher && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-3">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            This event will be visible to all students in the selected class
                        </div>
                        <div>
                            <label htmlFor="targetClass" className="block text-sm font-medium mb-1">
                                Class Level *
                            </label>
                            <select
                                id="targetClass"
                                value={targetClassLevel}
                                onChange={(e) => setTargetClassLevel(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>Class {n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Dates & Times */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            id="allDay"
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) => setIsAllDay(e.target.checked)}
                            className="rounded"
                            disabled={!canEdit}
                        />
                        <label htmlFor="allDay" className="text-sm font-medium">
                            All day event
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                                Start Date *
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                required
                                disabled={!canEdit}
                            />
                            {!isAllDay && (
                                <input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 mt-2"
                                    required
                                    disabled={!canEdit}
                                />
                            )}
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                                End Date *
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700"
                                required
                                disabled={!canEdit}
                            />
                            {!isAllDay && (
                                <input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 mt-2"
                                    required
                                    disabled={!canEdit}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Read-only indicator for class events */}
                {event && event.scope === 'class' && !canEdit && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            This is a class event created by a teacher. You cannot edit it.
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {event && canEdit && (
                            <Button
                                type="button"
                                onClick={handleDelete}
                                variant="outline"
                                disabled={isSubmitting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        {canEdit && (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : event ? 'Save Changes' : 'Create Event'}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EventEditorDialog;
