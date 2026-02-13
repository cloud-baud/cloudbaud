import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCcw, Mail, FileText } from 'lucide-react';
import SEO from '@/components/common/SEO';

const SalesPage = () => {
    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Sales and Refunds - CloudBaud"
                description="Information regarding CloudBaud's sales terms, refund policies, and billing procedures."
                canonical="/sales"
            />

            {/* Header Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-6">
                        <CreditCard className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Sales and Refunds
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Transparent policies for a trusted partnership.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
                    <div className="space-y-12">

                        {/* Refund Policy */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <RefreshCcw className="w-6 h-6 text-blue-500" />
                                Refund Policy
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                At CloudBaud, we strive to ensure our clients are completely satisfied with our consulting services and software solutions.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300 mt-4">
                                <li><strong>Consulting Services:</strong> Refunds for consulting hours are handled on a case-by-case basis as detailed in your Master Services Agreement (MSA). Generally, services already rendered are non-refundable.</li>
                                <li><strong>Subscription Software:</strong> You may cancel your subscription at any time. Refunds are generally not provided for partial months unless required by law.</li>
                                <li><strong>Fixed-Price Projects:</strong> Milestone payments are typically non-refundable once the milestone deliverable has been accepted by the client.</li>
                            </ul>
                        </div>

                        {/* Payment Terms */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-green-500" />
                                Payment Terms
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Standard payment terms are Net 30 days from the date of invoice, unless otherwise specified in your contract. Late payments may be subject to interest charges.
                            </p>
                        </div>

                        {/* Contact */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Mail className="w-6 h-6 text-purple-500" />
                                Billing Inquiries
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                If you have any questions about an invoice, payment status, or refund request, please contact our billing department:
                            </p>
                            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg font-mono text-sm text-slate-600 dark:text-slate-400">
                                <p>CloudBaud Billing Dept.</p>
                                <p>Email: <a href="mailto:billing@cloudbaud.com" className="text-blue-500 hover:underline">billing@cloudbaud.com</a></p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default SalesPage;
