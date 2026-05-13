import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { FileText, Upload, Edit, Download, Users } from 'lucide-react';

/**
 * PitchDeckPage - Creative starter for the Pitch Deck section.
 * Features:
 * - Deck overview
 * - Slide list (mock)
 * - Actions: Add, Edit, Download, Share
 */
const mockSlides = [
  { id: 1, title: 'Company Vision', status: 'Draft', owner: 'J. Nath' },
  { id: 2, title: 'Market Opportunity', status: 'Published', owner: 'A. Smith' },
  { id: 3, title: 'Product Demo', status: 'Draft', owner: 'J. Nath' },
  { id: 4, title: 'Financials', status: 'Review', owner: 'C. Lee' },
];

export default function PitchDeckPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <FileText className="size-6 text-primary" /> Pitch Deck (Series A)
          </h1>
          <p className="text-muted-foreground">Collaborate, edit, and share your investor deck. All changes auto-save and are tracked by owner.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Upload className="size-4 mr-2" /> Upload Slide</Button>
          <Button variant="default"><Edit className="size-4 mr-2" /> New Slide</Button>
          <Button variant="ghost"><Download className="size-4 mr-2" /> Download PDF</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSlides.map(slide => (
          <Card key={slide.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="size-5 text-indigo-500" /> {slide.title}
              </CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs font-medium 
                ${slide.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' :
                  slide.status === 'Draft' ? 'bg-slate-500/10 text-slate-500' : 'bg-amber-500/10 text-amber-500'}`}>{slide.status}</span>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" /> {slide.owner}
              </div>
              <Button size="sm" variant="outline"><Edit className="size-4 mr-1" /> Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
