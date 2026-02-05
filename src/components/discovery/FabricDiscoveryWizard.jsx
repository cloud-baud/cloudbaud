import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ChevronRight,
    ChevronLeft,
    Send,
    CheckCircle2,
    Building2,
    Database,
    ShieldCheck,
    BarChart,
    Rocket,
    BrainCircuit,
    Wrench,
    Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Schema for the form
const formSchema = z.object({
    // Section 1: Organization
    industry: z.string().min(1, "Industry is required"),
    stakeholders: z.string().optional(),

    // Section 2: Data Landscape
    platforms: z.array(z.string()).optional(),
    dataGovernance: z.string().optional(),

    // Section 3: Cloud
    cloudProviders: z.array(z.string()).optional(),
    regions: z.string().optional(),

    // Section 4: Power BI
    pbiUsage: z.string().optional(),

    // Section 5: Adoption
    workloads: z.array(z.string()).optional(),

    // Section 8: Timeline
    timeline: z.string().optional(),
    budget: z.string().optional(),

    // Contact
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Name is required"),
});

const FabricDiscoveryWizard = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const totalSteps = 4;

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        // resolver: zodResolver(formSchema), // Optional: enable specific validation if needed
        defaultValues: {
            platforms: [],
            cloudProviders: [],
            workloads: []
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        console.log("Form Data:", data);

        try {
            // 1. Save to Supabase
            const { data: dbData, error: dbError } = await supabase
                .from('assessments')
                .insert({
                    user_email: data.email,
                    user_name: data.name,
                    industry: data.industry,
                    type: 'microsoft-fabric',
                    status: 'pending',
                    data: data,
                    organization: data.industry // Mapping industry to org for now if org field missing
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 2. Notify via Email (using Flask Backend Proxy)
            try {
                // Construct a direct dashboard link (mocking it for now as /portal/assessment/:id)
                const dashboardLink = `https://cloudbaud.com/portal/assessment/${dbData.id}`;

                await fetch('http://localhost:5000/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: 'jish.nath@cloudbaud.com',
                        subject: `New Fabric Assessment: ${data.name}`,
                        body: `A new Microsoft Fabric assessment has been submitted.\n\nUser: ${data.name} (${data.email})\nIndustry: ${data.industry}\n\nView details: ${dashboardLink}`
                    })
                });
            } catch (notifyError) {
                console.error("Failed to trigger email notification:", notifyError);
                // Non-blocking error
            }

            // 3. Persist "Discovery Initiated" state for the dashboard (Local Logic)
            localStorage.setItem('fabric_discovery_status', JSON.stringify({
                status: 'Assessment Submitted',
                date: new Date().toISOString(),
                type: 'Microsoft Fabric',
                stage: 'Architect Review',
                id: dbData.id
            }));

            setIsSuccess(true);
        } catch (error) {
            console.error("Submission error:", error);
            // Fallback: still show success to user if local storage worked? 
            // Or show error. For better UX, we might fallback to just local storage if DB fails.
            // But user requirement says "we DO need to save it to supabase".
            // So we should probably alert simple error or handle gracefully.
            alert("There was an issue submitting your assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(Math.min(step + 1, totalSteps));
    const prevStep = () => setStep(Math.max(step - 1, 1));

    if (isSuccess) {
        return (
            <Card className="max-w-3xl mx-auto border-blue-500/20 bg-slate-900/50 backdrop-blur-sm">
                <CardContent className="pt-10 pb-10 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl text-white">Discovery Initiated</CardTitle>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Thank you for sharing your context. Our Principal Architect will review your Fabric readiness profile and contact you within 24 hours with a preliminary roadmap.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                        start New Assessment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-slate-800 pb-6">
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <Rocket className="w-6 h-6 text-blue-500" />
                        Fabric Transformation Discovery
                    </CardTitle>
                    <span className="text-sm font-medium text-slate-400">Step {step} of {totalSteps}</span>
                </div>
                <CardDescription className="text-slate-400 text-base">
                    This intake helps us architect the right Microsoft Fabric adoption strategy for your data landscape.
                </CardDescription>
                <Progress value={(step / totalSteps) * 100} className="h-2 mt-4 bg-slate-800" indicatorClassName="bg-blue-600" />
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="pt-8 pb-8 min-h-[400px]">

                    {/* STEP 1: Context & Landscape */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                Organization & Data Landscape
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Primary Industry</Label>
                                    <Input {...register("industry")} placeholder="e.g. Healthcare, Finance, Retail" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Key Outcomes</Label>
                                    <Input {...register("outcomes")} placeholder="e.g. Cost reduction, AI enablement" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-300">Current Platforms (Select all that apply)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Power BI', 'Azure Synapse', 'Databricks', 'Snowflake', 'SQL Server', 'Other'].map((item) => (
                                        <div key={item} className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-blue-500/50 transition-colors">
                                            <Checkbox
                                                id={`platform-${item}`}
                                                onCheckedChange={(checked) => {
                                                    const current = watch('platforms') || [];
                                                    if (checked) setValue('platforms', [...current, item]);
                                                    else setValue('platforms', current.filter(i => i !== item));
                                                }}
                                            />
                                            <label htmlFor={`platform-${item}`} className="text-sm text-slate-300 cursor-pointer w-full font-medium">{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Biggest Pain Points</Label>
                                <Textarea {...register("painPoints")} placeholder="e.g. Siloed data, slow reporting refresh, duplicate logic..." className="bg-slate-800 border-slate-700 text-white h-24" />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Cloud & Governance */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                Security, Cloud & Compliance
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-slate-300">Cloud Ecosystem</Label>
                                    <div className="flex flex-col space-y-2">
                                        {['Azure', 'AWS', 'GCP', 'On-Premise'].map((cloud) => (
                                            <div key={cloud} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cloud-${cloud}`}
                                                    onCheckedChange={(checked) => {
                                                        const current = watch('cloudProviders') || [];
                                                        if (checked) setValue('cloudProviders', [...current, cloud]);
                                                        else setValue('cloudProviders', current.filter(i => i !== cloud));
                                                    }}
                                                />
                                                <label htmlFor={`cloud-${cloud}`} className="text-slate-300">{cloud}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-slate-300">Compliance Requirements</Label>
                                    <Input {...register("compliance")} placeholder="e.g. HIPAA, GDPR, SOC2" className="bg-slate-800 border-slate-700 text-white" />
                                    <p className="text-xs text-slate-500">Do you require multi-region disaster recovery?</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label className="text-slate-300">Data Governance Maturity</Label>
                                <RadioGroup onValueChange={(val) => setValue('governance', val)} className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-md">
                                        <RadioGroupItem value="low" id="gov-low" className="border-slate-500 text-blue-500" />
                                        <Label htmlFor="gov-low" className="text-slate-400 font-normal">Ad-hoc / None (We fix things when they break)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-md">
                                        <RadioGroupItem value="medium" id="gov-medium" className="border-slate-500 text-blue-500" />
                                        <Label htmlFor="gov-medium" className="text-slate-400 font-normal">Defined Policies (We have some manuals/processes)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-md">
                                        <RadioGroupItem value="high" id="gov-high" className="border-slate-500 text-blue-500" />
                                        <Label htmlFor="gov-high" className="text-slate-400 font-normal">Automated & Audited (Purview, active catalogs)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Adoption & Capabilities */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <BrainCircuit className="w-5 h-5 text-blue-400" />
                                Fabric Capabilities & AI
                            </h3>

                            <div className="space-y-3">
                                <Label className="text-slate-300 mb-2 block">Which Fabric workloads interest you most?</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        'Data Engineering (Spark/Notebooks)',
                                        'Data Warehouse (SQL)',
                                        'Real-Time Intelligence (KQL)',
                                        'Data Factory (Pipelines)',
                                        'Power BI (Direct Lake)',
                                        'Data Science / AI'
                                    ].map((workload) => (
                                        <div key={workload} className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                            <Checkbox
                                                id={`wl-${workload}`}
                                                onCheckedChange={(checked) => {
                                                    const current = watch('workloads') || [];
                                                    if (checked) setValue('workloads', [...current, workload]);
                                                    else setValue('workloads', current.filter(i => i !== workload));
                                                }}
                                            />
                                            <label htmlFor={`wl-${workload}`} className="text-sm text-slate-300">{workload}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Label className="text-slate-300">AI & Automation Goals</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Checkbox id="ai-copilot" onCheckedChange={(c) => setValue('ai_copilot', c)} />
                                            <label htmlFor="ai-copilot" className="font-medium text-slate-200">Copilot Adoption</label>
                                        </div>
                                        <p className="text-xs text-slate-500 ml-6">Enable business users to query data using natural language.</p>
                                    </div>
                                    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Checkbox id="ai-ml" onCheckedChange={(c) => setValue('ai_ml', c)} />
                                            <label htmlFor="ai-ml" className="font-medium text-slate-200">Custom ML Integration</label>
                                        </div>
                                        <p className="text-xs text-slate-500 ml-6">Integrate your own predictive models into the pipeline.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Timeline & Contact */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-blue-400" />
                                Execution & Contact
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Target Timeline</Label>
                                    <Input {...register("timeline")} placeholder="e.g. Start in Q3, POC next month" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Implementation Approach</Label>
                                    <RadioGroup onValueChange={(val) => setValue('approach', val)} defaultValue="poc" className="flex flex-row gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="poc" id="app-poc" className="border-slate-500 text-blue-500" />
                                            <Label htmlFor="app-poc" className="text-slate-300">Targeted POC</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="full" id="app-full" className="border-slate-500 text-blue-500" />
                                            <Label htmlFor="app-full" className="text-slate-300">Full Migration</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <hr className="border-slate-800 my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Your Name *</Label>
                                    <Input {...register("name")} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Work Email *</Label>
                                    <Input {...register("email")} type="email" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 mt-6">
                                <p className="text-sm text-blue-300">
                                    <strong>What happens next?</strong> Our Fabric Architects will review your profile and prepare a custom "Art of the Possible" session slide deck for your team.
                                </p>
                            </div>
                        </div>
                    )}

                </CardContent>

                <CardFooter className="border-t border-slate-800 pt-6 flex justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {step < totalSteps ? (
                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">Processing...</span>
                            ) : (
                                <span className="flex items-center gap-2">Submit Request <Send className="w-4 h-4" /></span>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
};

export default FabricDiscoveryWizard;
