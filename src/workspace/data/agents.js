export const agents = [
    {
        id: 'copywriter',
        name: 'Copywriter Agent',
        slug: 'copywriter',
        tagline: 'AI-powered content creation with stunning infographics',
        description: 'Transform your content marketing with an AI agent that creates compelling copy, generates data-driven infographics, and maintains your brand voice across all channels.',
        icon: 'PenTool',
        features: [
            'SEO-optimized content generation',
            'Automated infographic creation with data visualization',
            'Multi-format output (blog posts, social media, emails)',
            'Brand voice consistency across all content',
            'Real-time content analytics and optimization',
            'Integration with major CMS platforms'
        ],
        useCases: [
            {
                title: 'Content Marketing',
                description: 'Generate blog posts, whitepapers, and case studies at scale'
            },
            {
                title: 'Social Media',
                description: 'Create engaging posts with custom infographics for each platform'
            },
            {
                title: 'Email Campaigns',
                description: 'Craft personalized email content with visual data stories'
            },
            {
                title: 'Product Documentation',
                description: 'Produce clear, visual documentation and user guides'
            }
        ],
        metrics: {
            primary: { value: '10x', label: 'Faster Content Creation' },
            secondary: [
                { value: '85%', label: 'Higher Engagement' },
                { value: '60%', label: 'Cost Reduction' },
                { value: '95%', label: 'Brand Consistency' }
            ]
        },
        integrations: ['WordPress', 'HubSpot', 'Medium', 'Ghost', 'Webflow', 'Social Media APIs'],
        pricing: {
            starter: { price: '$299', period: 'per month', features: ['Up to 50 articles/month', '100 infographics', 'Basic CMS integration', 'Email support'] },
            professional: { price: '$799', period: 'per month', features: ['Up to 200 articles/month', 'Unlimited infographics', 'Advanced integrations', 'Priority support', 'Custom brand voice'] },
            enterprise: { price: 'Custom', period: 'contact us', features: ['Unlimited content', 'Dedicated account manager', 'Custom AI training', '24/7 support', 'API access'] }
        },
        caseStudy: {
            client: 'TechInsights Blog',
            challenge: 'Struggling to produce enough high-quality content to compete in their market',
            solution: 'Deployed Copywriter Agent to generate SEO-optimized articles with data visualizations',
            results: ['10x increase in content output', '150% boost in organic traffic', '40% reduction in content costs']
        }
    },
    {
        id: 'crm',
        name: 'CRM Agent',
        slug: 'crm',
        tagline: 'Intelligent customer engagement, 24/7',
        description: 'Revolutionize customer relationships with an AI agent that responds to inquiries, manages communications, and integrates seamlessly with your existing CRM systems.',
        icon: 'Users',
        features: [
            '24/7 automated response to customer inquiries',
            'Personalized communication based on customer history',
            'Sentiment analysis and escalation routing',
            'Multi-channel support (email, chat, social media)',
            'CRM data enrichment and updating',
            'Automated follow-up sequences'
        ],
        useCases: [
            {
                title: 'Customer Support',
                description: 'Handle common inquiries and route complex issues to human agents'
            },
            {
                title: 'Lead Nurturing',
                description: 'Engage prospects with timely, relevant follow-up communications'
            },
            {
                title: 'Account Management',
                description: 'Keep customers informed with proactive updates and check-ins'
            },
            {
                title: 'Feedback Collection',
                description: 'Automatically gather and analyze customer feedback'
            }
        ],
        metrics: {
            primary: { value: '95%', label: 'Customer Satisfaction' },
            secondary: [
                { value: '80%', label: 'Faster Response Time' },
                { value: '50%', label: 'Support Cost Reduction' },
                { value: '24/7', label: 'Availability' }
            ]
        },
        integrations: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive', 'Microsoft Dynamics', 'Custom APIs'],
        pricing: {
            starter: { price: '$199', period: 'per month', features: ['Up to 500 interactions/month', 'Email integration', 'Basic CRM sync', 'Standard response templates'] },
            professional: { price: '$599', period: 'per month', features: ['Up to 2,000 interactions/month', 'Multi-channel support', 'Advanced personalization', 'Sentiment analysis', 'Priority support'] },
            enterprise: { price: 'Custom', period: 'contact us', features: ['Unlimited interactions', 'Custom AI training', 'Dedicated success manager', 'Advanced analytics', 'SLA guarantees'] }
        },
        caseStudy: {
            client: 'CloudServe SaaS',
            challenge: 'Overwhelmed support team struggling with response times and customer satisfaction',
            solution: 'Implemented CRM Agent to handle tier-1 support and automate follow-ups',
            results: ['95% CSAT score', '80% faster initial response', '60% reduction in support tickets to human agents']
        }
    },
    {
        id: 'sales',
        name: 'Sales Agent',
        slug: 'sales',
        tagline: 'Qualify leads and accelerate your pipeline',
        description: 'Supercharge your sales process with an AI agent that qualifies leads, schedules meetings, and keeps your pipeline moving 24/7.',
        icon: 'TrendingUp',
        features: [
            'Intelligent lead scoring and qualification',
            'Automated outreach and follow-up sequences',
            'Meeting scheduling with calendar integration',
            'Prospect research and data enrichment',
            'Email and message personalization at scale',
            'Real-time pipeline analytics and insights'
        ],
        useCases: [
            {
                title: 'Lead Qualification',
                description: 'Score and prioritize leads based on fit and intent'
            },
            {
                title: 'Outbound Sales',
                description: 'Personalized outreach campaigns at scale'
            },
            {
                title: 'Meeting Scheduling',
                description: 'Automated booking and calendar management'
            },
            {
                title: 'Pipeline Management',
                description: 'Keep deals moving with timely follow-ups and nudges'
            }
        ],
        metrics: {
            primary: { value: '3x', label: 'More Qualified Leads' },
            secondary: [
                { value: '45%', label: 'Faster Sales Cycle' },
                { value: '70%', label: 'Meeting Show Rate' },
                { value: '2.5x', label: 'Pipeline Velocity' }
            ]
        },
        integrations: ['Salesforce', 'HubSpot', 'Pipedrive', 'Calendly', 'Google Calendar', 'LinkedIn', 'Email providers'],
        pricing: {
            starter: { price: '$399', period: 'per month', features: ['Up to 1,000 leads/month', 'Basic lead scoring', 'Email outreach', 'Calendar integration'] },
            professional: { price: '$999', period: 'per month', features: ['Up to 5,000 leads/month', 'Advanced scoring algorithms', 'Multi-channel outreach', 'A/B testing', 'Priority support'] },
            enterprise: { price: 'Custom', period: 'contact us', features: ['Unlimited leads', 'Custom AI training', 'Dedicated CSM', 'Advanced analytics', 'API access'] }
        },
        caseStudy: {
            client: 'B2B Solutions Inc',
            challenge: 'Sales team spending too much time on unqualified leads',
            solution: 'Deployed Sales Agent to qualify inbound leads and automate outreach',
            results: ['3x increase in qualified leads', '45% shorter sales cycle', '200% ROI in first quarter']
        }
    }
];

export const agentBenefits = [
    'Deploy in days, not months',
    'Integrates with existing tools',
    'Scales with your business',
    'Continuous learning and improvement',
    'White-glove implementation support',
    'Dedicated success management'
];
