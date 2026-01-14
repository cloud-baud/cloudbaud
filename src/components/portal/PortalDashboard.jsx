import React from 'react';
import {
    FileText,
    CheckSquare,
    Share2,
    MessageCircle,
    MoreHorizontal,
    ThumbsUp,
    MessageSquare as CommentIcon,
    Smile
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"; // Assuming you have shadcn card or similar, creating inline if not

// Inline Card components if not available globally yet, to ensure self-contained demo
const SimpleCard = ({ children, className = "" }) => (
    <div className={`bg-card text-card-foreground rounded-xl border border-border shadow-sm ${className}`}>{children}</div>
);

const PortalDashboard = () => {
    return (
        <div className="max-w-5xl mx-auto p-8 pt-12">

            {/* Top Action Bar */}
            <div className="flex items-center justify-between mb-12">
                {/* Left spacer or title if needed */}
                <div></div>

                {/* Quick Actions */}
                <div className="flex gap-8">
                    <QuickAction icon={FileText} label="Document" sublabel="Write stuff" />
                    <QuickAction icon={CheckSquare} label="Task" sublabel="Track work" />
                    <QuickAction icon={Share2} label="Post" sublabel="Share ideas" />
                    <QuickAction icon={MessageCircle} label="Message" sublabel="Start a chat" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="space-y-8">
                <h1 className="text-2xl font-bold tracking-tight">For you</h1>

                <div className="grid grid-cols-1 gap-6">

                    {/* Feed Item 1: Update */}
                    <FeedItem
                        author="Mason Clay"
                        role="Engineering"
                        time="May 21st at 11:02am"
                        avatar="https://i.pravatar.cc/150?u=mason"
                    >
                        <div className="prose dark:prose-invert max-w-none mb-4">
                            <p className="text-base leading-relaxed">
                                <span className="font-semibold text-green-600">@ChatGPT</span> please write an executive summary of everything the engineering team worked in Q1 2026 and whether we met our estimates from <span className="text-blue-500 inline-flex items-center gap-1 cursor-pointer hover:underline"><FileText className="size-3" /> Roadmap Q1 2026</span>.
                            </p>
                            <p className="text-base leading-relaxed mt-2 text-muted-foreground">
                                cc <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded">@Cass</span> let's use this for our retro today
                            </p>
                        </div>

                        {/* Reactions */}
                        <div className="flex items-center gap-4 border-t border-border pt-4">
                            <div className="flex -space-x-1">
                                <Reaction emoji="😻" count={2} active />
                            </div>
                            <div className="flex-1"></div>
                            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                                <CommentIcon className="size-4" />
                                <span>3</span>
                            </div>
                        </div>
                    </FeedItem>

                    {/* Feed Item 2: Task Collection */}
                    <FeedItem
                        author="Rose Compás"
                        action="shared a task collection"
                        time="May 21st at 10:32am"
                        avatar="https://i.pravatar.cc/150?u=rose"
                    >
                        <SimpleCard className="mt-2 p-6 bg-card/60">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="size-2 rounded-full bg-red-500"></span>
                                <h3 className="font-semibold">Recruiting</h3>
                            </div>
                            <div className="space-y-1">
                                <TaskItem label="Interview Cara Bina" checked />
                                <TaskItem label="Add listing to CSM industry job board" />
                                <TaskItem label="LinkedIn candidate sourcing" />
                            </div>
                        </SimpleCard>
                    </FeedItem>

                    {/* Feed Item 3: Kudos */}
                    <FeedItem
                        author="Holly Evergreen"
                        role="Kudos"
                        time="May 21st at 9:48am"
                        avatar="https://i.pravatar.cc/150?u=holly"
                    >
                        <p className="text-base">
                            Kudos to <span className="font-semibold px-0.5"><img src="https://i.pravatar.cc/150?u=matt" className="inline size-5 rounded-full -mt-0.5 mr-1" />Matt R. Horn</span> for designing our offsite swag. It looks soooo good!!
                        </p>

                        {/* Reactions */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex -space-x-1">
                                <Reaction emoji="💐" count={2} />
                                <Reaction emoji="🎨" count={1} />
                                <Reaction emoji="🙌" count={3} />
                            </div>
                            <div className="flex-1"></div>
                            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                                <Smile className="size-4" />
                                <span>7</span>
                            </div>
                        </div>
                    </FeedItem>

                </div>
            </div>
        </div>
    );
};

// Components
const QuickAction = ({ icon: Icon, label, sublabel }) => (
    <button className="flex items-start gap-3 group text-left hover:bg-accent/40 p-2 rounded-lg transition-colors">
        <div className="p-2.5 bg-background border border-border rounded-lg shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
            <Icon className="size-6 text-foreground/80 group-hover:text-primary" />
        </div>
        <div>
            <div className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</div>
            <div className="text-xs text-muted-foreground">{sublabel}</div>
        </div>
    </button>
);

const FeedItem = ({ author, role, action, time, avatar, children }) => (
    <div className="pb-8 border-b border-border/50 last:border-0">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <Avatar className="size-9 rounded-full overflow-hidden border border-border">
                    <img src={avatar} alt={author} className="object-cover size-full" />
                </Avatar>
                <div>
                    <div className="text-sm font-medium text-foreground">
                        {author} {role && <span className="text-muted-foreground font-normal">in {role}</span>} {action && <span className="text-muted-foreground font-normal">{action}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted">
                <MoreHorizontal className="size-4" />
            </button>
        </div>
        <div className="pl-[48px]">
            {children}
        </div>
    </div>
);

const Reaction = ({ emoji, count, active }) => (
    <button className={`
        flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border transition-colors
        ${active ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}
    `}>
        <span>{emoji}</span>
        <span>{count}</span>
    </button>
);

const TaskItem = ({ label, checked }) => (
    <div className="flex items-center gap-3 py-2 px-1 hover:bg-muted/40 rounded -mx-1 group cursor-pointer">
        <div className={`
            size-5 rounded-full border flex items-center justify-center transition-colors
            ${checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-muted-foreground/40 group-hover:border-blue-500/50'}
        `}>
            {checked && <CheckSquare className="size-3.5 fill-current" />}
        </div>
        <span className={`${checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{label}</span>
    </div>
);

const Avatar = ({ children, className }) => (
    <div className={className}>{children}</div>
);

export default PortalDashboard;
