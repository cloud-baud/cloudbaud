import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import CloudBaudDocumentTemplate from '@/components/common/CloudBaudDocumentTemplate';

const DEFAULT_SECTIONS = [
  'Executive Summary',
  'Architecture Diagram',
  'Implementation Notes',
  'Security and Compliance Notes',
  'Release and Change Log'
];

const ResourcePlaceholderPage = ({
  title,
  category = 'Resource',
  documentType,
  description,
  sections = DEFAULT_SECTIONS
}) => {
  return (
    <CloudBaudDocumentTemplate
      title={title}
      category={category}
      documentType={documentType || 'Documentation'}
      description={description || 'This page is being prepared with CloudBaud standardized content blocks and branded document structure.'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {sections.map((section) => (
          <div key={section} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-brand-blue" />
              {section}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 mb-8">
        <h2 className="text-base font-bold mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-blue" />
          Standardization Note
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Documentation, whitepapers, case studies, API references, and blog resources follow this shared CloudBaud structure so readers get a consistent format across all knowledge assets.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="bg-brand-blue hover:bg-brand-blue/80 text-black font-semibold">
          <Link to="/contact">
            Request Full Version
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-300 dark:border-slate-700">
          <Link to="/blog">Go to Blog</Link>
        </Button>
      </div>
    </CloudBaudDocumentTemplate>
  );
};

export default ResourcePlaceholderPage;

