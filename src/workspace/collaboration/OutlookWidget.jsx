import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/shared/lib/authConfig";
import { Client } from "@microsoft/microsoft-graph-client";
import {
    Mail,
    Calendar as CalendarIcon,
    RefreshCw,
    LogIn,
    CheckCircle2,
    Clock,
    User,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { format } from 'date-fns';

const OutlookWidget = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState({ emails: [], events: [], user: null });
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (accounts.length > 0) {
            setIsAuthenticated(true);
            fetchData();
        }
    }, [accounts]);

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch(e => {
            console.error(e);
        });
    };

    const handleLogout = () => {
        instance.logoutPopup().catch(e => {
            console.error(e);
        });
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const request = {
                ...loginRequest,
                account: accounts[0],
            };

            // Get the token silently
            const response = await instance.acquireTokenSilent(request);

            // Initialize Graph Client
            const graphClient = Client.init({
                authProvider: (done) => {
                    done(null, response.accessToken);
                }
            });

            // Parallel fetch
            const [user, emails, events] = await Promise.all([
                graphClient.api('/me').get(),
                graphClient.api('/me/messages').top(5).select('subject,from,receivedDateTime,isRead').get(),
                graphClient.api('/me/calendar/events')
                    .select('subject,start,end,location,organizer')
                    .top(5)
                    .orderby('start/dateTime')
                    .get()
            ]);

            setGraphData({
                user: user,
                emails: emails.value,
                events: events.value
            });

        } catch (error) {
            console.error("Graph API Error:", error);
            // Fallback for interaction required (e.g. expired token)
            if (error instanceof Error && error.message.includes("interaction_required")) {
                instance.acquireTokenPopup(request).then(() => fetchData());
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Card className="border-dashed border-2 border-slate-700/50 bg-slate-900/20 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="p-4 rounded-full bg-slate-800 mb-4">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Connect Your Workflow</h3>
                    <p className="max-w-xs mb-6 text-sm">Sign in with Microsoft 365 to view your emails and meetings directly in your cockpit.</p>
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-[#0078D4]/20"
                    >
                        <LogIn className="w-4 h-4" />
                        Connect Outlook
                    </button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Email Module */}
            <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md overflow-hidden hover:border-indigo-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-slate-800/50 bg-slate-900/30">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-400">
                        <Mail className="w-4 h-4" />
                        Priority Inbox
                    </CardTitle>
                    <button onClick={fetchData} disabled={isLoading} className="text-slate-500 hover:text-indigo-400 transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && graphData.emails.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">Syncing...</div>
                    ) : graphData.emails.length > 0 ? (
                        <div className="divide-y divide-slate-800/50">
                            {graphData.emails.map((email) => (
                                <div key={email.id} className="p-4 hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${email.isRead ? 'bg-transparent' : 'bg-indigo-500'}`} />
                                            <span className="text-xs font-semibold text-slate-300 truncate">{email.from?.emailAddress?.name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                                            {format(new Date(email.receivedDateTime), 'h:mm a')}
                                        </span>
                                    </div>
                                    <div className="pl-3.5">
                                        <h4 className="text-sm text-slate-200 truncate group-hover:text-indigo-300 transition-colors">{email.subject}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">{email.bodyPreview}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">No recent messages</div>
                    )}
                </CardContent>
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30">
                    <button className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 w-full justify-center">
                        View all messages <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </Card>

            {/* Calendar Module */}
            <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md overflow-hidden hover:border-rose-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-slate-800/50 bg-slate-900/30">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-rose-400">
                        <CalendarIcon className="w-4 h-4" />
                        Today's Agenda
                    </CardTitle>
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && graphData.events.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">Syncing...</div>
                    ) : graphData.events.length > 0 ? (
                        <div className="divide-y divide-slate-800/50">
                            {graphData.events.map((event) => {
                                const start = new Date(event.start.dateTime);
                                const end = new Date(event.end.dateTime);
                                const isHappeningNow = new Date() >= start && new Date() <= end;

                                return (
                                    <div key={event.id} className={`p-4 hover:bg-slate-800/30 transition-colors flex gap-4 ${isHappeningNow ? 'bg-rose-500/5' : ''}`}>
                                        <div className="flex flex-col items-center justify-center min-w-[3rem] text-center border-r border-slate-800/50 pr-4">
                                            <span className="text-xs font-bold text-slate-400">{format(start, 'EEE')}</span>
                                            <span className={`text-lg font-bold ${isHappeningNow ? 'text-rose-400' : 'text-slate-200'}`}>
                                                {format(start, 'd')}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 py-0.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                                                </span>
                                                {isHappeningNow && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium">NOW</span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-medium text-slate-200 truncate">{event.subject}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                                                {event.location.displayName && <span>📍 {event.location.displayName}</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                            <p>No more meetings today</p>
                        </div>
                    )}
                </CardContent>
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30">
                    <button className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 w-full justify-center">
                        Open Calendar <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default OutlookWidget;
