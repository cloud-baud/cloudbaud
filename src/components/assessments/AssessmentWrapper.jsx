import React, { useEffect, useState } from 'react';
import AssessmentEngine from './AssessmentEngine';
import { assessmentConfigs } from './definitions';
import { supabase } from '@/shared/lib/supabase';
import { Loader2 } from 'lucide-react';

const AssessmentWrapper = ({ slug, ...props }) => {
    // Initialize with local definition as fallback (or immediate render)
    const [config, setConfig] = useState(assessmentConfigs[slug]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchTemplate = async () => {
            try {
                // Check if we have a DB override
                const { data, error } = await supabase
                    .from('assessment_templates')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .order('version', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (isMounted && data && data.content) {
                    // Successfully found a remote template
                    setConfig({
                        ...assessmentConfigs[slug], // Keep static fallbacks (icons map keys, etc)
                        id: data.slug,
                        title: data.title,
                        description: data.description,
                        steps: data.content.steps, // The dynamic questions including payload
                        version: data.version
                    });
                }
            } catch (err) {
                console.warn(`[AssessmentWrapper] Failed to fetch template for ${slug}, using local fallback.`, err);
            } finally {
                if (isMounted) setIsHydrated(true);
            }
        };

        fetchTemplate();

        return () => { isMounted = false; };
    }, [slug]);

    if (!config) {
        return <div className="p-8 text-center text-red-500">Assessment capabilities not found for "{slug}".</div>;
    }

    return (
        <div className="relative">
            {!isHydrated && (
                <div className="absolute top-2 right-2 z-50">
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin" /> Syncing...</span>
                </div>
            )}
            <AssessmentEngine config={config} assessmentType={slug} dbVersion={config.version} {...props} />
        </div>
    );
};

export default AssessmentWrapper;
