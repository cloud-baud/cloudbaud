import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select';

const AssessmentEngine = ({ config, assessmentType, ...props }) => {
    // ... (existing state) ...
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm();

    // Config fallback
    if (!config) return <div className="p-4 text-red-500">Assessment configuration missing.</div>;

    const [industries, setIndustries] = useState([]);

    useEffect(() => {
        const fetchIndustries = async () => {
            const { data } = await supabase
                .from('industries')
                .select('name')
                .eq('is_active', true)
                .order('name');
            
            if (data) {
                setIndustries(data.map(i => i.name));
            }
        };
        fetchIndustries();
    }, []);

    const { steps, title, description } = config;

    // Add Contact step dynamically if not present (standardizing the final step)
    const effectiveSteps = [...steps];
    const hasContactStep = steps.some(s => s.id === 'contact');

    if (!hasContactStep) {
        effectiveSteps.push({
            id: 'contact',
            title: 'Execution & Contact',
            icon: 'Send',
            fields: [
                { id: 'timeline', label: 'Target Timeline', type: 'radio-group', options: ['Immediate (0-3 months)', 'Short Term (3-6 months)', 'Long Term (6+ months)', 'Exploratory'] },
                { id: 'industry', label: 'Industry', type: 'select', options: industries, required: true, placeholder: 'Select your industry...' },
                { id: 'budget', label: 'Estimated Budget Scope', type: 'radio-group', options: ['<$50k', '$50k - $200k', '$200k - $500k', '$500k+'] },
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
                { id: 'email', label: 'Work Email', type: 'email', placeholder: 'john@company.com', required: true },
                { id: 'company', label: 'Organization', type: 'text', placeholder: 'Acme Corp', required: true },
                { id: 'role', label: 'Job Title', type: 'text', placeholder: 'CTO / Director of Engineering' }
            ]
        });
    }

    const totalSteps = effectiveSteps.length;
    const currentStepConfig = effectiveSteps[step - 1];
    const progress = (step / totalSteps) * 100;

    // Dynamic Icon
    const StepIcon = LucideIcons[currentStepConfig.icon] || LucideIcons.HelpCircle;

    const onSubmit = async (data) => {
        if (step < totalSteps) {
            setStep(step + 1);
            // Scroll to top of card
            const element = document.getElementById('assessment-card-top');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Save to Supabase
            const { error } = await supabase
                .from('assessments')
                .insert([
                    {
                        user_email: data.email,
                        user_name: data.name,
                        type: assessmentType || config.id || 'general',
                        status: 'pending',
                        data: data,
                        organization: data.company || 'Unknown' // capture company if field exists, else default
                    }
                ]);

            if (error) throw error;

            // 2. Trigger Email Notification (Mock or Real)
            await fetch('http://localhost:5000/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'NEW_ASSESSMENT',
                    payload: {
                        name: data.name,
                        email: data.email,
                        assessmentType: assessmentType || config.title,
                        data: data
                    }
                })
            }).catch(e => console.warn('Email notify failed (local dev):', e));

            // 3. Mark success
            setIsSuccess(true);

            // 4. Scroll to success view
            const element = document.getElementById('assessment-card-top');
            if (element) element.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your assessment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-slate-900/80 border-slate-800 animate-in fade-in duration-700" id="assessment-card-top">
                <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LucideIcons.CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Assessment Received</h2>
                    <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                        Thank you for initiating the {title}. Our solution architects will review your inputs and contact you shortly with a preliminary roadmap.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            className="border-slate-700 hover:bg-slate-800"
                            onClick={() => window.location.reload()}
                        >
                            Return to Page
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-slate-900/80 border-slate-800 shadow-2xl animate-in fade-in duration-500" id="assessment-card-top">
            <CardHeader className="border-b border-slate-800 pb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-blue/10 rounded-lg">
                            <StepIcon className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-white">
                                {title}
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-brand-blue">Step {step}</span>
                        <span className="text-slate-500">/{totalSteps}</span>
                        {/* Version Indicator (Hidden if not from DB) */}
                        {props.dbVersion && (
                            <div className="text-[10px] text-slate-600 font-mono mt-1">
                                v{props.dbVersion}
                            </div>
                        )}
                    </div>
                </div>
                <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-brand-blue to-brand-aqua" />
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="pt-8 min-h-[400px]">
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-2">{currentStepConfig.title}</h3>
                        {currentStepConfig.description && <p className="text-slate-400">{currentStepConfig.description}</p>}
                    </div>

                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
                        {currentStepConfig.fields.map((field) => {
                            const commonClasses = "bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-brand-blue focus:ring-brand-blue/20";

                            return (
                                <div key={field.id} className="space-y-3">
                                    <Label className="text-base font-medium text-slate-300">
                                        {field.label} {field.required && <span className="text-brand-aqua">*</span>}
                                    </Label>

                                    {field.type === 'text' && (
                                        <Input
                                            {...register(field.id, { required: field.required })}
                                            placeholder={field.placeholder}
                                            className={commonClasses}
                                        />
                                    )}

                                    {field.type === 'email' && (
                                        <Input
                                            {...register(field.id, { required: field.required })}
                                            type="email"
                                            placeholder={field.placeholder}
                                            className={commonClasses}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <Textarea
                                            {...register(field.id, { required: field.required })}
                                            placeholder={field.placeholder}
                                            className={`${commonClasses} min-h-[120px]`}
                                        />
                                    )}

                                    {field.type === 'select' && (
                                        <Controller
                                            name={field.id}
                                            control={control}
                                            rules={{ required: field.required }}
                                            render={({ field: { onChange, value } }) => (
                                                <Select onValueChange={onChange} defaultValue={value}>
                                                    <SelectTrigger className={commonClasses}>
                                                        <SelectValue placeholder={field.placeholder || "Select an option"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                                        {field.options && field.options.map((opt) => (
                                                            <SelectItem key={opt} value={opt} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    )}

                                    {field.type === 'radio-group' && (
                                        <Controller
                                            name={field.id}
                                            control={control}
                                            rules={{ required: field.required }}
                                            defaultValue={field.defaultValue}
                                            render={({ field: { onChange, value } }) => (
                                                <RadioGroup
                                                    onValueChange={onChange}
                                                    defaultValue={value}
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                >
                                                    {field.options.map((opt) => (
                                                        <div key={opt} className={`flex items-center space-x-3 rounded-xl border p-4 transition-all cursor-pointer ${value === opt ? 'border-brand-blue bg-brand-blue/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}`}>
                                                            <RadioGroupItem value={opt} id={`${field.id}-${opt}`} className="border-slate-500 text-brand-blue" />
                                                            <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer text-slate-300 font-medium w-full">{opt}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                    )}

                                    {field.type === 'checkbox-group' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {field.options.map((opt) => (
                                                <div key={opt} className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-slate-800 p-4 bg-slate-950/50">
                                                    <Controller
                                                        name={field.id}
                                                        control={control}
                                                        // Checkbox logic: array management
                                                        render={({ field: { onChange, value } }) => {
                                                            const isChecked = Array.isArray(value) && value.includes(opt);
                                                            return (
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = Array.isArray(value) ? value : [];
                                                                        if (checked) {
                                                                            onChange([...current, opt]);
                                                                        } else {
                                                                            onChange(current.filter(v => v !== opt));
                                                                        }
                                                                    }}
                                                                    className="border-slate-500 data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                                                                />
                                                            );
                                                        }}
                                                    />
                                                    <Label className="font-normal text-slate-300">{opt}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors[field.id] && <span className="text-red-400 text-sm">This field is required</span>}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-slate-800 pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            if (step > 1) {
                                setStep(step - 1);
                                const element = document.getElementById('assessment-card-top');
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        disabled={step === 1}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <LucideIcons.ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-black font-bold px-8 shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center"><LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</span>
                        ) : step === totalSteps ? (
                            <span className="flex items-center">Generate Roadmap <LucideIcons.Rocket className="ml-2 h-4 w-4" /></span>
                        ) : (
                            <span className="flex items-center">Next Step <LucideIcons.ChevronRight className="ml-2 h-4 w-4" /></span>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default AssessmentEngine;
