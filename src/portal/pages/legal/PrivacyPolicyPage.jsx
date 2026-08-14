import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Bell, MessageSquare, Mail } from 'lucide-react';
import SEO from '@/components/common/SEO';

const PrivacyPolicyPage = () => {
    const lastUpdated = "January 8, 2026"; // Using current date context

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Privacy Policy - CloudBaud"
                description="Our commitment to your privacy and data security. Learn how CloudBaud manages and protects your personal information."
                canonical="/privacy-policy"
            />

            {/* Header Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-6">
                        <Shield className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Your privacy is critically important to us. This policy details how CloudBaud collects, uses, and protects your data.
                    </p>
                    <div className="mt-4 text-sm text-slate-400">
                        Last Updated: {lastUpdated}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">

                    <div className="space-y-12">
                        {/* Introduction */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Lock className="w-6 h-6 text-blue-500" />
                                1. Introduction
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                CloudBaud ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>cloudbaud.com</strong> or use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                            </p>
                        </div>

                        {/* Information Collection */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
                                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
                                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                            </ul>
                        </div>

                        {/* SMS / Mobile Compliance Section (Twilio Requirement) */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-green-500" />
                                3. SMS & Mobile Communications
                            </h2>
                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>
                                    <strong>Consent:</strong> By providing your phone number to CloudBaud, you consent to receive text messages (SMS/MMS) from us regarding your account, updates, and requested services. Message frequency varies.
                                </p>
                                <p>
                                    <strong>Standard Rates:</strong> Message and data rates may apply depending on your mobile carrier plan.
                                </p>
                                <p>
                                    <strong>Opt-Out (STOP):</strong> You can withdraw your consent at any time. To stop receiving text messages from us, simply reply <strong>STOP</strong> to any message you receive. You will receive a final confirmation message, and then no further messages will be sent.
                                </p>
                                <p>
                                    <strong>Help Instructions:</strong> If you need assistance, reply <strong>HELP</strong> to any message for customer support contact information.
                                </p>
                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <h3 className="font-bold text-blue-500 mb-2">Privacy of Mobile
                                        Information</h3>
                                    <p className="text-sm">
                                        <strong>No Sharing with Third Parties:</strong> We respect your privacy. No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Usage of Information */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">4. How We Use Your Information</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
                                <li>Create and manage your account.</li>
                                <li>Process your transactions and service requests.</li>
                                <li>Email you regarding your account or order.</li>
                                <li>Send you targeted marketing, coupons, newsletters, and other information regarding promotions (only with your explicit consent).</li>
                                <li>Compile anonymous statistical data and analysis for use internally.</li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Mail className="w-6 h-6 text-purple-500" />
                                5. Contact Us
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                If you have questions or comments about this Privacy Policy, please contact us at:
                            </p>
                            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg font-mono text-sm text-slate-600 dark:text-slate-400">
                                <p>CloudBaud, LLC</p>
                                <p>Email: <a href="mailto:privacy@cloudbaud.com" className="text-blue-500 hover:underline">privacy@cloudbaud.com</a></p>
                                <p>Website: <Link to="/" className="text-blue-500 hover:underline">https://cloudbaud.com</Link></p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
