import React, { useState } from 'react';
import { useContent } from '@/context/ContentContext';
import { Save, Bot, Activity } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/ui/card";

const ContentControl = () => {
    const { content, updateContent } = useContent();
    const [localAi, setLocalAi] = useState(content.aiShowcase);
    const [localTax, setLocalTax] = useState(content.taxActivities);

    const handleAiChange = (key, value) => {
        setLocalAi(prev => ({ ...prev, [key]: value }));
    };

    const handleTaxChange = (key, value) => {
        setLocalTax(prev => ({ ...prev, [key]: value }));
    };

    const saveChanges = () => {
        updateContent('aiShowcase', 'enabled', localAi.enabled);
        updateContent('aiShowcase', 'title', localAi.title);
        updateContent('aiShowcase', 'description', localAi.description);
        updateContent('aiShowcase', 'highlight', localAi.highlight);

        updateContent('taxActivities', 'showLog', localTax.showLog);

        alert('Content updated successfully! (Persisted to LocalStorage)');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="size-5 text-brand-blue" /> AI Showcase (Public Portal)
                    </CardTitle>
                    <CardDescription>
                        Manage the "Agentic AI" spotlight section on the homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable AI Pivot Spotlight</Label>
                            <p className="text-sm text-muted-foreground">Show the special "AI First" section on the landing page</p>
                        </div>
                        <Switch
                            checked={localAi.enabled}
                            onCheckedChange={(checked) => handleAiChange('enabled', checked)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Headline</Label>
                        <Input
                            value={localAi.title}
                            onChange={(e) => handleAiChange('title', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Highlight Tag</Label>
                        <Input
                            value={localAi.highlight}
                            onChange={(e) => handleAiChange('highlight', e.target.value)}
                            placeholder="e.g. New Capability"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            value={localAi.description}
                            onChange={(e) => handleAiChange('description', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="size-5 text-green-500" /> Tax Dashboard Features
                    </CardTitle>
                    <CardDescription>
                        Configure the Tax Dashboard modules and visibility.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show Activity Log</Label>
                            <p className="text-sm text-muted-foreground">Display the audit trail/activity log pane in the Tax Dashboard</p>
                        </div>
                        <Switch
                            checked={localTax.showLog}
                            onCheckedChange={(checked) => handleTaxChange('showLog', checked)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-end">
                    <Button onClick={saveChanges} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold">
                        <Save className="w-4 h-4 mr-2" />
                        Save All Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ContentControl;
