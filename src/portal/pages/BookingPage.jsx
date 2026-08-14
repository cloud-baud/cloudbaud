import React, { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/workspace/services/calendarService';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { ChevronLeft, ChevronRight, Clock, User, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { format, addMonths, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, addDays, getDay, isAfter, isBefore, setHours, setMinutes, parseISO } from 'date-fns';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

const MEETING_DURATION = 15; // default duration
const WORKING_HOURS = { start: 9, end: 17 }; // 9 AM to 5 PM
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

const BookingPage = () => {
    console.log('BookingPage: Mounting...');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [bookingStep, setBookingStep] = useState(1); // 1: Date/Time, 2: Details, 3: Success
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // Booking Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        notes: '',
        duration: '15' // 15 or 30
    });

    const calculateSlots = useCallback(async (date) => {
        setLoadingSlots(true);
        setSelectedTimeSlot(null);

        try {
            // 1. Fetch Busy Times from Service
            const busyTimes = await BookingService.getBusyTimes(date);

            // 2. Generate Potential Slots
            const slots = [];
            let currentTime = setMinutes(setHours(new Date(date), WORKING_HOURS.start), 0);
            const endTime = setMinutes(setHours(new Date(date), WORKING_HOURS.end), 0);
            const duration = parseInt(formData.duration);

            while (isBefore(currentTime, endTime)) {
                const slotStart = currentTime;
                const slotEnd = setMinutes(new Date(currentTime), currentTime.getMinutes() + duration);

                // Check conflicts
                const isConflict = busyTimes?.some(event => {
                    const eventStart = parseISO(event.start_time);
                    const eventEnd = parseISO(event.end_time);
                    return (
                        (isAfter(slotStart, eventStart) && isBefore(slotStart, eventEnd)) || // Starts inside event
                        (isAfter(slotEnd, eventStart) && isBefore(slotEnd, eventEnd)) || // Ends inside event
                        (isSameDay(slotStart, eventStart) && slotStart.getTime() === eventStart.getTime()) // Exact match
                    );
                });

                // Check if in past
                const isPast = isBefore(slotStart, new Date());

                if (!isConflict && !isPast) {
                    slots.push(slotStart);
                }

                currentTime = setMinutes(new Date(currentTime), currentTime.getMinutes() + 15);
            }

            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error calculating slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    }, [formData.duration]);

    useEffect(() => {
        if (selectedDate) {
            calculateSlots(selectedDate);
        }
    }, [selectedDate, calculateSlots]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedDate || !selectedTimeSlot) return;

        try {
            const duration = parseInt(formData.duration);
            const startTime = selectedTimeSlot;
            const endTime = setMinutes(new Date(startTime), startTime.getMinutes() + duration);

            await BookingService.createBooking({
                name: formData.name,
                email: formData.email,
                notes: formData.notes,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            });

            setBookingStep(3); // Success
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Failed to book meeting. Please try again.');
        }
    };

    // Calendar Render Logic
    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isWorkingDay = WORKING_DAYS.includes(getDay(cloneDay));
                const isPast = isBefore(cloneDay, new Date()) && !isSameDay(cloneDay, new Date());
                const isDisabled = !isWorkingDay || isPast;

                days.push(
                    <div
                        className={`
                            h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
                            ${!isSameMonth(day, monthStart) ? "text-slate-600 opacity-50" : ""}
                            ${isSameDay(day, selectedDate) ? "bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/30 scale-110" : "hover:bg-slate-800"}
                            ${isDisabled ? "opacity-30 pointer-events-none" : ""}
                            ${isSameDay(day, new Date()) && !selectedDate ? "border border-brand-blue text-brand-blue" : ""}
                        `}
                        key={day}
                        onClick={() => !isDisabled && setSelectedDate(cloneDay)}
                    >
                        {format(day, dateFormat)}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="flex justify-between mb-2" key={day}>{days}</div>);
            days = [];
        }
        return rows;
    };

    if (bookingStep === 3) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
                <Card className="max-w-md w-full bg-slate-900 border-slate-800">
                    <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
                        <div className="size-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="size-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Meeting Confirmed!</h2>
                        <p className="text-slate-400 mb-6">
                            You are scheduled with Jishnu Nath for <span className="text-white font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span> at <span className="text-white font-medium">{format(selectedTimeSlot, 'h:mm a')}</span>.
                        </p>
                        <p className="text-sm text-slate-500 mb-8">
                            A calendar invitation has been sent to {formData.email}.
                        </p>
                        <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-700 hover:bg-slate-800 text-white">
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-200">
            <Card className="max-w-4xl w-full bg-slate-900 border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Left Panel: Profile & Info */}
                <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                            {/* Placeholder Avatar */}
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">JN</div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Jishnu Nath</p>
                            <h1 className="text-xl font-bold text-white">Initial Consultation</h1>
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-sm text-slate-400">
                        <div className="flex items-center gap-3">
                            <Clock className="size-4" />
                            <span>{formData.duration} min</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="size-4" />
                            <span>Web Conferencing Details handled upon confirmation.</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Book a quick 15 or 30 minute chat to discuss your project needs or just to say hello.
                        </p>
                    </div>
                </div>

                {/* Right Panel: Calendar & Slots */}
                <div className="md:w-2/3 p-6 md:p-8 bg-slate-950/30">
                    {bookingStep === 1 && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Select a Date & Time</h3>
                                <select 
                                    className="bg-slate-900 border border-slate-700 text-sm rounded px-2 py-1 outline-none focus:border-brand-blue"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                >
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                </select>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Calendar Grid */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h4 className="font-medium text-white">{format(currentMonth, 'MMMM yyyy')}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ChevronLeft className="size-4" /></button>
                                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ChevronRight className="size-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mb-2 px-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                    </div>
                                    <div className="px-1">
                                        {renderCalendar()}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                {selectedDate && (
                                    <div className="w-full md:w-48 animate-in slide-in-from-right-4 duration-300">
                                        <h4 className="font-medium text-white mb-4 text-center">
                                            {format(selectedDate, 'EEEE, MMM d')}
                                        </h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                            {loadingSlots ? (
                                                <div className="text-center text-sm text-slate-500 py-4">Checking...</div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="text-center text-sm text-slate-500 py-4">No slots available</div>
                                            ) : (
                                                availableSlots.map((slot, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedTimeSlot(slot);
                                                            setBookingStep(2);
                                                        }}
                                                        className="w-full py-2 px-4 rounded border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white text-sm font-medium transition-colors"
                                                    >
                                                        {format(slot, 'h:mm a')}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details Form */}
                    {bookingStep === 2 && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto">
                            <button 
                                onClick={() => setBookingStep(1)}
                                className="mb-6 flex items-center text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="size-4 mr-1" /> Back
                            </button>
                            
                            <h3 className="text-xl font-bold text-white mb-6">Enter Details</h3>
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        required 
                                        placeholder="John Doe"
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        required 
                                        placeholder="john@example.com"
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="bg-slate-900 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea 
                                        id="notes" 
                                        placeholder="Please share anything that will help prepare for our meeting."
                                        value={formData.notes} 
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                                    />
                                </div>
                                
                                <div className="pt-4">
                                    <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue/90 font-semibold h-11">
                                        Schedule Event
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default BookingPage;

