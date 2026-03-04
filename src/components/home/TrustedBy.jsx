import React from 'react';

const TrustedBy = ({ title = "Trusted by Industry Leaders" }) => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        {title}
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Serving Fortune 500 companies, government agencies, and innovative enterprises
                    </p>
                </div>

                {/* Client Logos Image */}
                <div className="flex justify-center mb-12">
                    <img
                        src="/client-logos.png"
                        alt="Client logos including Microsoft, Chevron, T-Mobile, U.S. Army, IRS, Comcast, Iridium, JLL, Ashley, State of Oklahoma, Alaska, Kentucky, and Costco"
                        className="w-full max-w-5xl opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                            13+
                        </div>
                        <div className="text-sm text-gray-400">Major Clients</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                            5
                        </div>
                        <div className="text-sm text-gray-400">Government Agencies</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                            8
                        </div>
                        <div className="text-sm text-gray-400">Industries Served</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
