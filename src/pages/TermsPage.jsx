import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import SEO from '../components/common/SEO';

const TermsPage = () => {
    const lastUpdated = "January 8, 2026"; // Using current date context

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Terms and Conditions - CloudBaud"
                description="Review the Terms and Conditions for using CloudBaud services, including our SMS/Mobile communication policies."
                canonical="/terms-and-conditions"
            />

            {/* Header Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-6">
                        <FileText className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Terms and Conditions
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Please read these terms carefully before using our services.
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
                        {/* 1. Acceptance */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-blue-500" />
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                By accessing and using the website <strong>cloudbaud.com</strong> ("Site") and services provided by CloudBaud, LLC ("we," "us," or "our"), you agree to be legally bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Site.
                            </p>
                        </div>

                        {/* 2. SMS/Mobile Terms */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-green-500" />
                                2. SMS/Mobile Messaging Terms
                            </h2>
                            <div className="space-y-4 text-slate-600 dark:text-slate-300">
                                <p>
                                    <strong>Campaign Description:</strong> We may send you text messages (SMS/MMS) regarding project updates, appointment reminders, security verification codes (2FA), and customer service responses.
                                </p>
                                <p>
                                    <strong>Opt-In:</strong> You can opt in to receive messages by selecting the consent checkbox on our contact or registration forms.
                                </p>
                                <p>
                                    <strong>Opt-Out:</strong> You can cancel the SMS service at any time. Just text <strong>STOP</strong> to the short code or number provided. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, just sign up as you did the first time and we will start sending SMS messages to you again.
                                </p>
                                <p>
                                    <strong>Help:</strong> If you are experiencing issues with the messaging program you can reply with the keyword <strong>HELP</strong> for more assistance, or you can get help directly at privacy@cloudbaud.com or 425.749.2101.
                                </p>
                                <p>
                                    <strong>Carriers:</strong> Carriers are not liable for delayed or undelivered messages.
                                </p>
                                <p>
                                    <strong>Rates:</strong> As always, message and data rates may apply for any messages sent to you from us and to us from you. Message frequency varies. If you have any questions about your text plan or data plan, it is best to contact your wireless provider.
                                </p>
                                <p>
                                    <strong>Privacy:</strong> For all questions about the services provided by this short code, you can send an email to privacy@cloudbaud.com. You can review our <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link> here.
                                </p>
                            </div>
                        </div>

                        {/* 3. Intellectual Property */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">3. Intellectual Property</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                The Site and its original content, features, and functionality are owned by CloudBaud, LLC and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                            </p>
                        </div>

                        {/* 4. Limitation of Liability */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                4. Limitation of Liability
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                In no event shall CloudBaud, LLC, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
                            </p>
                        </div>

                        {/* 5. Governing Law */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">5. Governing Law</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                These Terms shall be governed and construed in accordance with the laws of California, United States, without regard to its conflict of law provisions.
                            </p>
                        </div>

                        {/* 6. Contact Us */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Mail className="w-6 h-6 text-purple-500" />
                                6. Contact Us
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                If you have any questions about these Terms, please contact us:
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

export default TermsPage;
