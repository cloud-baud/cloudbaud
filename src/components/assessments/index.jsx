import AssessmentWrapper from './AssessmentWrapper';

// Factory function for creating specialized assessment components
// Now uses the Wrapper to enable DB-backed dynamic questions
const createAssessment = (slug) => {
    return (props) => <AssessmentWrapper slug={slug} {...props} />;
};

// Export dedicated components for each capability
export const DataEngineeringAssessment = createAssessment('data-engineering');
export const AiEngineeringAssessment = createAssessment('ai-engineering');
export const CustomApplicationsAssessment = createAssessment('custom-applications');
export const CloudSolutionsAssessment = createAssessment('cloud-solutions');
export const MicrosoftPlatformAssessment = createAssessment('microsoft-platform');
export const DevOpsAssessment = createAssessment('devops-infrastructure');
export const MobileDevelopmentAssessment = createAssessment('mobile-development');
export const EnterpriseIntegrationAssessment = createAssessment('enterprise-integration');
export const SolutionsArchitectureAssessment = createAssessment('solutions-architecture');

// Helper to get component by capability slug dynamically
export const getAssessmentComponent = (slug) => {
    const map = {
        'data-engineering': DataEngineeringAssessment,
        'ai-engineering': AiEngineeringAssessment,
        'custom-applications': CustomApplicationsAssessment,
        'cloud-solutions': CloudSolutionsAssessment,
        'microsoft-platform': MicrosoftPlatformAssessment,
        'devops-infrastructure': DevOpsAssessment,
        'mobile-development': MobileDevelopmentAssessment,
        'enterprise-integration': EnterpriseIntegrationAssessment,
        'solutions-architecture': SolutionsArchitectureAssessment
    };
    return map[slug] || null;
};
