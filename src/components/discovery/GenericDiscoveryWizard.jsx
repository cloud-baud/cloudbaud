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

    // Section 5: Adoption
    workloads: z.array(z.string()).optional(),

    // Contact
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Name is required"),
});

const GenericDiscoveryWizard = ({
    serviceName = "Transformation Discovery",
    serviceId = "generic-service",
    description = "This intake helps us architect the right strategy for your business goals.",
    workloadOptions = ['Strategy', 'Implementation', 'Migration', 'Optimization', 'Support'],
    contextIcon = Rocket
}) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const totalSteps = 3; // Reduced for generic use

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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
                    type: serviceId,
                    status: 'pending',
                    data: data,
                    organization: data.industry
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 2. Notify via Email
            try {
                const dashboardLink = `https://cloudbaud.com/portal/assessment/${dbData.id}`;

                await fetch('http://localhost:5000/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: 'jish.nath@cloudbaud.com',
                        subject: `New Assessment: ${serviceName} - ${data.name}`,
                        body: `A new assessment for ${serviceName} has been submitted.\n\nUser: ${data.name} (${data.email})\nIndustry: ${data.industry}\n\nView details: ${dashboardLink}`
                    })
                });
            } catch (notifyError) {
                console.error("Failed to trigger email notification:", notifyError);
            }

            // 3. Persist state for dashboard
            localStorage.setItem(`${serviceId}_assessment_status`, JSON.stringify({
                status: 'Assessment Submitted',
                date: new Date().toISOString(),
                type: serviceName,
                stage: 'Architect Review',
                id: dbData.id
            }));

            // Also update the main 'fabric' one just in case dashboard only looks for that (optional hack for demo)
            // Ideally dashboard should look for an array of assessments, but for now let's keep it simple.

            setIsSuccess(true);
        } catch (error) {
            console.error("Submission error:", error);
            alert("There was an issue submitting your assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(Math.min(step + 1, totalSteps));
    const prevStep = () => setStep(Math.max(step - 1, 1));

    // Dynamic Icon
    const Icon = contextIcon;

    if (isSuccess) {
        return (
            <Card className="max-w-3xl mx-auto border-blue-500/20 bg-slate-900/50 backdrop-blur-sm mt-8">
                <CardContent className="pt-10 pb-10 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl text-white">Assessment Initiated</CardTitle>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Thank you for sharing your context. Our Principal Architect will review your {serviceName} profile and contact you within 24 hours.
                    </p>
                    <div className="flex gap-4 justify-center mt-6">
                        <Button onClick={() => window.location.href = '/portal'} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Track Status in Portal
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Start New Assessment
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl mt-8">
            <CardHeader className="border-b border-slate-800 pb-6">
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <Icon className="w-6 h-6 text-blue-500" />
                        {serviceName}
                    </CardTitle>
                    <span className="text-sm font-medium text-slate-400">Step {step} of {totalSteps}</span>
                </div>
                <CardDescription className="text-slate-400 text-base">
                    {description}
                </CardDescription>
                <Progress value={(step / totalSteps) * 100} className="h-2 mt-4 bg-slate-800" indicatorClassName="bg-blue-600" />
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="pt-8 pb-8 min-h-[300px]">

                    {/* STEP 1: Context */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                Organization Context
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Primary Industry</Label>
                                    <Input {...register("industry")} placeholder="e.g. Healthcare, Finance, Retail" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Key Outcomes</Label>
                                    <Input {...register("outcomes")} placeholder="e.g. Cost reduction, Scaling, Security" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-300">Areas of Interest</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {workloadOptions.map((item) => (
                                        <div key={item} className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-blue-500/50 transition-colors">
                                            <Checkbox
                                                id={`wl-${item}`}
                                                onCheckedChange={(checked) => {
                                                    const current = watch('workloads') || [];
                                                    if (checked) setValue('workloads', [...current, item]);
                                                    else setValue('workloads', current.filter(i => i !== item));
                                                }}
                                            />
                                            <label htmlFor={`wl-${item}`} className="text-sm text-slate-300 cursor-pointer w-full font-medium">{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Technical Environment */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                Environment & Challenges
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Biggest Pain Points</Label>
                                <Textarea {...register("painPoints")} placeholder="Tell us about your current challenges..." className="bg-slate-800 border-slate-700 text-white h-32" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-3">
                                    <Label className="text-slate-300">Cloud Provider</Label>
                                    <Input {...register("cloud")} placeholder="e.g. Azure, AWS" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-slate-300">Timeline</Label>
                                    <Input {...register("timeline")} placeholder="e.g. ASAP, Q3" className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Contact */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-blue-400" />
                                Contact Information
                            </h3>

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
                                    <strong>What happens next?</strong> Our Architects will review your profile and prepare a custom roadmap session.
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

export default GenericDiscoveryWizard;
