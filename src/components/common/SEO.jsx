import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    canonical,
    ogImage = '/og-image.png',
    ogType = 'website',
    structuredData
}) => {
    const siteUrl = 'https://cloudbaud.com';
    const fullTitle = title ? `${title} | CloudBaud` : 'CloudBaud - Engineering Intelligent Systems';
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullOgImage} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="CloudBaud" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullOgImage} />

            {/* Additional Meta */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="CloudBaud" />
            <meta name="geo.region" content="US-WA" />
            <meta name="geo.placename" content="Seattle" />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
