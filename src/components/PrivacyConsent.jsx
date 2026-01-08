import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyConsent = ({ checked, onChange }) => {
    return (
        <div className="mt-4 p-4 bg-slate-800/80 border border-slate-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
                <div className="flex h-5 items-center">
                    <input
                        id="privacy-consent"
                        name="privacy-consent"
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        required
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                </div>
                <div className="text-sm">
                    <label htmlFor="privacy-consent" className="font-medium text-slate-300">
                        I agree to the terms and privacy policy.
                    </label>
                    <p className="text-slate-400 mt-1 leading-relaxed text-xs">
                        By checking this box, I consent to receive SMS/MMS texts from CloudBaud regarding my account
                        and services at the phone number provided. Message frequency varies.
                        Message & data rates may apply. Reply STOP to opt-out.
                        View our <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyConsent;
