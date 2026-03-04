import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';

const SEO = ({
    title,
    description,
    canonical,
    ogImage = '/og-image.png',
    ogType = 'website',
    structuredData
}) => {
    const { user } = useAuth();
    const siteName = user?.user_metadata?.site_name || 'CloudBaud';
    const siteUrl = 'https://cloudbaud.com';
    
    // Check if the title already includes the siteName or CloudBaud to avoid double-appending
    const baseTitle = title ? (title.includes(siteName) || title.includes('CloudBaud') ? title : `${title} | ${siteName}`) : `${siteName} - Engineering Intelligent Systems`;
    // We replace occurrences of CloudBaud with the siteName if it exists
    const fullTitle = baseTitle.replace('CloudBaud', siteName);
    
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
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullOgImage} />

            {/* Additional Meta */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content={siteName} />
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
