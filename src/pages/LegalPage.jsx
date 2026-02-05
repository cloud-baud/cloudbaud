import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, Globe } from 'lucide-react';
import SEO from '../components/common/SEO';

const LegalPage = () => {
    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Legal - CloudBaud"
                description="Legal notices, disclaimers, and intellectual property information for CloudBaud."
                canonical="/legal"
            />

            {/* Header Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-6">
                        <Scale className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Legal Notices
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Important information regarding your use of CloudBaud services and intellectual property.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
                    <div className="space-y-12">

                        {/* Intellectual Property */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-500" />
                                Intellectual Property
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of CloudBaud or its content suppliers and protected by international copyright laws.
                            </p>
                        </div>

                        {/* Trademarks */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">
                                Trademarks
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                CloudBaud, the CloudBaud logo, and other marks indicated on our site are trademarks of CloudBaud, LLC. CloudBaud's trademarks may not be used in connection with any product or service that is not CloudBaud's, in any manner that is likely to cause confusion among customers, or in any manner that disparages or discredits CloudBaud.
                            </p>
                        </div>

                        {/* Governing Law */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Globe className="w-6 h-6 text-green-500" />
                                Governing Law
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                These terms shall be governed by and defined following the laws of the United States. CloudBaud, LLC and yourself irrevocably consent that the courts of the United States shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                            </p>
                        </div>

                        {/* Disclaimer */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">
                                Disclaimer of Warranties
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                THE SITE AND SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default LegalPage;
