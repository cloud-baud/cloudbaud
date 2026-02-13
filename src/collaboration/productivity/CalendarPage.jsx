import React, { useState, useEffect } from 'react';
import PageShell from '@/collaboration/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MapPin,
    Trash2,
    Check,
    X,
    MoreHorizontal,
    Edit // Import Edit
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isToday } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { CalendarService } from '@/services/calendarService'; // Use the new service
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const CATEGORY_COLORS = {
    'Business': 'bg-blue-500',
    'Personal': 'bg-green-500',
    'Meeting': 'bg-purple-500',
    'Deadline': 'bg-red-500',
    'Holiday': 'bg-yellow-500',
    'Other': 'bg-gray-500'
};

const CalendarPage = () => {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);

    // Form State
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        category: 'Business',
        description: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]); // Refetch when month changes

    const fetchEvents = async () => {
        setLoading(true);
        // Calculate range for DB query (start of first week to end of last week displayed)
        const startDate = startOfWeek(startOfMonth(currentMonth)); 
        const endDate = endOfWeek(endOfMonth(currentMonth));
        
        try {
            const data = await CalendarService.getEvents(startDate.toISOString(), endDate.toISOString());
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            alert('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        
        // Construct ISO timestamps
        const startIso = new Date(`${newEvent.date}T${newEvent.startTime}`).toISOString();
        const endIso = new Date(`${newEvent.date}T${newEvent.endTime}`).toISOString();

        const eventData = {
            title: newEvent.title,
            description: newEvent.description,
            start_time: startIso,
            end_time: endIso,
            category: newEvent.category,
            user_email: user?.email
        };

        try {
            await CalendarService.createEvent(eventData);
            setIsAddEventOpen(false);
            fetchEvents();
            // Reset form
            setNewEvent({
                title: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                startTime: '09:00',
                endTime: '10:00',
                category: 'Business',
                description: ''
            });
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Failed to add event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return;
        try {
             await CalendarService.deleteEvent(id);
             fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Calendar Grid Logic
    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-foreground">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => {
                        // In dev, origin might be localhost. In prod, it's the domain.
                        const link = window.location.origin + '/book';
                        navigator.clipboard.writeText(link);
                        alert(`Booking link copied:\n${link}`);
                    }}>
                        <Check className="size-4" />
                        Share Link
                    </Button>
                    <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-blue hover:bg-brand-blue/90 gap-2">
                                <Plus className="size-4" />
                                New Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
                            <DialogHeader>
                                <DialogTitle>Add New Event</DialogTitle>
                                <DialogDescription>Create a new event for your calendar.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddEvent} className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="e.g. Weekly Sync" 
                                        required 
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        className="bg-secondary/50 border-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input 
                                            id="date" 
                                            type="date" 
                                            required 
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                            className="bg-secondary/50 border-input"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select 
                                            id="category"
                                            className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                        >
                                            {Object.keys(CATEGORY_COLORS).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="start">Start Time</Label>
                                        <Input 
                                            id="start" 
                                            type="time" 
                                            required 
                                            value={newEvent.startTime}
                                            onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                                            className="bg-secondary/50 border-input"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end">End Time</Label>
                                        <Input 
                                            id="end" 
                                            type="time" 
                                            required 
                                            value={newEvent.endTime}
                                            onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                                            className="bg-secondary/50 border-input"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input 
                                        id="desc" 
                                        placeholder="Optional details" 
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                        className="bg-secondary/50 border-input"
                                    />
                                </div>
                                
                                <DialogFooter>
                                    <Button type="submit" className="bg-brand-blue">Create Event</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center font-medium text-muted-foreground py-2 border-b border-border/50 bg-secondary/20 uppercase text-xs tracking-wider" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                
                // Get events for this day
                const daysEvents = events.filter(event => 
                    isSameDay(parseISO(event.start_time), day)
                );

                days.push(
                    <div
                        className={cn(
                            "min-h-[120px] p-2 border border-border/50 relative group transition-colors hover:bg-secondary/10 flex flex-col gap-1",
                            !isSameMonth(day, monthStart) ? "bg-muted/30 text-muted-foreground" : "bg-card",
                            isSameDay(day, selectedDate) ? "bg-brand-blue/5" : "",
                            isToday(day) ? "ring-1 ring-brand-blue ring-inset" : ""
                        )}
                        key={day}
                        onClick={() => {
                            setSelectedDate(cloneDay);
                            setNewEvent(prev => ({...prev, date: format(cloneDay, 'yyyy-MM-dd')})); 
                        }}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                                "text-sm font-medium size-7 flex items-center justify-center rounded-full",
                                isToday(day) ? "bg-brand-blue text-white" : "text-foreground"
                            )}>
                                {formattedDate}
                            </span>
                            {/* Quick Add Button on Hover */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNewEvent(prev => ({...prev, date: format(cloneDay, 'yyyy-MM-dd')}));
                                    setIsAddEventOpen(true);
                                }}
                            >
                                <Plus className="size-3" />
                            </Button>
                        </div>
                        
                        {/* Events List */}
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                            {daysEvents.map(event => (
                                <DropdownMenu key={event.id}>
                                    <DropdownMenuTrigger asChild>
                                        <div 
                                            className={cn(
                                                "text-xs px-2 py-1 rounded truncate cursor-pointer text-white shadow-sm hover:brightness-110 transition-all active:scale-95 select-none",
                                                CATEGORY_COLORS[event.category] || 'bg-slate-500'
                                            )}
                                        >
                                            <span className="font-semibold mr-1">
                                                {format(parseISO(event.start_time), 'h:mm a')}
                                            </span>
                                            {event.title}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56 bg-card border-border text-foreground">
                                        <div className="p-2 border-b border-border/50 bg-secondary/20">
                                            <h4 className="font-semibold text-sm">{event.title}</h4>
                                            <p className="text-xs text-muted-foreground">{event.category}</p>
                                        </div>
                                        <div className="p-2 text-sm">
                                            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                                <Clock className="size-3" />
                                                <span>{format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}</span>
                                            </div>
                                            {event.description && <p className="text-muted-foreground mt-2 text-xs">{event.description}</p>}
                                        </div>
                                        <DropdownMenuItem 
                                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteEvent(event.id);
                                            }}
                                        >
                                            <Trash2 className="size-4 mr-2" />
                                            Delete Event
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border border-border rounded-lg overflow-hidden shadow-sm">{rows}</div>;
    };

    return (
        <PageShell title="Calendar" subtitle="Manage your schedule and upcoming events.">
            <div className="h-full flex flex-col">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>
        </PageShell>
    );
};

export default CalendarPage;
