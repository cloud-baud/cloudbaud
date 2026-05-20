import React from 'react';
import CloudBaudLogo from '@/components/common/CloudBaudLogo';
import { Layers } from 'lucide-react';

const CloudBaudDocumentTemplate = ({
  title,
  category = 'Resource',
  documentType,
  description,
  actions,
  children
}) => {
  const documentTypes = ['Documentation', 'Whitepaper', 'Blog', 'Case Study', 'API Reference'];

  return (
    <div className="min-h-[calc(100vh-220px)] bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <CloudBaudLogo className="h-10 w-auto" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CloudBaud Standard Template</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">{title}</h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full mb-4">
            <Layers className="w-3.5 h-3.5" />
            {category}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {documentTypes.map((type) => {
              const isActive = documentType === type;
              return (
                <span
                  key={type}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                    isActive
                      ? 'bg-brand-blue/15 text-brand-blue border-brand-blue/40'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </span>
              );
            })}
          </div>

          {description && (
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">{description}</p>
          )}

          {actions ? <div className="mb-8">{actions}</div> : null}

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CloudBaudDocumentTemplate;
