import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Separator } from '@/shared/ui/separator';
import { FileSignature, Copy, Printer, CheckCircle2 } from 'lucide-react';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

const DEFAULT = {
  effectiveDate: '',
  vendorName: '',
  vendorTitle: '',
  vendorAddress: '',
  ndaDurationYears: '3',
  nonCompeteMonths: '12',
  nonCompeteState: 'Washington',
  cloudbaudSignerName: '',
  cloudbaudSignerTitle: '',
  cloudbaudSignDate: '',
  vendorSignDate: '',
};

function field(value, fallback = '_______________') {
  return value && value.trim() ? value : fallback;
}

function formatDate(iso) {
  if (!iso) return '_______________';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ value, onChange, label }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [mode, setMode] = useState('draw');
  const [typedName, setTypedName] = useState('');

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }, [onChange]);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  }, [onChange]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    if (mode !== 'draw') return;
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current || mode !== 'draw') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    snapshot();
  };

  useEffect(() => {
    if (mode !== 'type') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typedName.trim()) {
      ctx.font = "italic 34px Georgia, serif";
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText(typedName, 10, 56);
      snapshot();
    } else {
      onChange(null);
    }
  }, [typedName, mode, snapshot, onChange]);

  const switchMode = (next) => {
    setMode(next);
    clearCanvas();
    if (next === 'draw') setTypedName('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-1 text-xs">
          {['draw', 'type'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-2 py-0.5 rounded capitalize transition-colors ${
                mode === m ? 'bg-brand-blue text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { clearCanvas(); setTypedName(''); }}
            className="px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {mode === 'type' && (
        <Input
          placeholder="Type name to generate signature"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          className="italic"
        />
      )}

      <canvas
        ref={canvasRef}
        width={640}
        height={120}
        className="w-full h-20 border border-border rounded-md bg-background cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {value ? (
        <p className="text-xs text-emerald-500 flex items-center gap-1">
          <CheckCircle2 className="size-3" /> Signature captured
        </p>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          {mode === 'draw' ? 'Draw your signature in the box above' : 'Type your name above'}
        </p>
      )}
    </div>
  );
}

function NdaPreview({ f, cloudbaudSig, vendorSig }) {
  return (
    <div className="font-serif text-[14px] leading-relaxed text-foreground space-y-4 p-2">
      {/* Title */}
      <h2 className="text-center text-base font-bold uppercase tracking-wide">
        Non-Disclosure and Non-Compete Agreement
      </h2>

      <p>
        This Agreement is made and entered into as of{' '}
        <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
          {formatDate(f.effectiveDate)}
        </span>
        , by and between:
      </p>

      <p>
        <strong>CloudBaud, LLC</strong>, a Washington limited liability company, with its
        principal office at 14255 Lake Hill Blvd, Bellevue 98007 Washington
        (&ldquo;Disclosing Party&rdquo;), and
      </p>

      <p>
        <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
          {field(f.vendorName)}
        </span>
        {f.vendorTitle && (
          <>
            , a{' '}
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {f.vendorTitle}
            </span>
          </>
        )}{' '}
        and residing at{' '}
        <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
          {field(f.vendorAddress)}
        </span>{' '}
        Washington (&ldquo;Receiving Party&rdquo;).
      </p>

      <Separator />

      <div>
        <p className="font-bold">1. Purpose</p>
        <p className="mt-1">
          The parties wish to exchange certain confidential information for business purposes.
          This Agreement governs the use and protection of such information.
        </p>
      </div>

      <div>
        <p className="font-bold">2. Definition of Confidential Information</p>
        <p className="mt-1">
          &ldquo;Confidential Information&rdquo; means any non-public information disclosed by CloudBaud,
          LLC, including but not limited to business plans, financial data, technical specifications,
          client lists, and proprietary processes.
        </p>
      </div>

      <div>
        <p className="font-bold">3. Obligations of Receiving Party</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Maintain confidentiality of all Confidential Information.</li>
          <li>Use Confidential Information solely for the agreed business purpose.</li>
          <li>Do not disclose to any third party without prior written consent.</li>
        </ul>
      </div>

      <div>
        <p className="font-bold">4. Term</p>
        <p className="mt-1">
          This Agreement shall remain in effect for{' '}
          <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
            {f.ndaDurationYears === '1' ? 'one (1) year' :
             f.ndaDurationYears === '2' ? 'two (2) years' :
             f.ndaDurationYears === '3' ? 'three (3) years' :
             f.ndaDurationYears === '5' ? 'five (5) years' : `${f.ndaDurationYears} years`}
          </span>{' '}
          from the Effective Date or until Confidential Information is no longer confidential;
          obligations relating to trade secrets shall survive indefinitely. Any restrictive
          covenants shall not extend beyond the maximum period stated in Section 7.
        </p>
      </div>

      <div>
        <p className="font-bold">5. Exclusions</p>
        <p className="mt-1">Confidential Information does not include information that:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Is publicly available through no fault of Receiving Party.</li>
          <li>Was lawfully obtained from a third party without restriction.</li>
          <li>Was independently developed without reference to Confidential Information.</li>
        </ul>
      </div>

      <div>
        <p className="font-bold">6. Return or Destruction</p>
        <p className="mt-1">
          Upon termination or request, the Receiving Party shall return or destroy all
          Confidential Information.
        </p>
      </div>

      <div>
        <p className="font-bold">7. Non-Compete Clause</p>
        <p className="mt-1">
          For a period of{' '}
          <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
            {f.nonCompeteMonths === '3'  ? 'three (3) months' :
             f.nonCompeteMonths === '6'  ? 'six (6) months' :
             f.nonCompeteMonths === '12' ? 'twelve (12) months' :
             f.nonCompeteMonths === '18' ? 'eighteen (18) months' :
             f.nonCompeteMonths === '24' ? 'twenty-four (24) months' :
             `${f.nonCompeteMonths} months`}
          </span>{' '}
          from the Effective Date, Receiving Party agrees not to engage, directly or indirectly,
          in any business that competes with CloudBaud, LLC within the State of{' '}
          <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
            {field(f.nonCompeteState)}
          </span>
          , subject to applicable law. This restriction shall not extend beyond{' '}
          <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
            {f.nonCompeteMonths} months
          </span>{' '}
          from the Effective Date regardless of the duration of this Agreement.
        </p>
      </div>

      <div>
        <p className="font-bold">8. Governing Law</p>
        <p className="mt-1">
          This Agreement shall be governed by and construed in accordance with the laws of the
          State of{' '}
          <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
            {field(f.nonCompeteState)}
          </span>
          .
        </p>
      </div>

      <div>
        <p className="font-bold">9. Entire Agreement</p>
        <p className="mt-1">
          This Agreement constitutes the entire understanding between the parties and supersedes
          all prior discussions.
        </p>
      </div>

      <Separator />

      <p className="font-bold">
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written
        above.
      </p>

      <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 sm:gap-8">
        {/* CloudBaud block */}
        <div className="space-y-2">
          <p className="font-bold">CloudBaud, LLC</p>
          <div className="border-b border-foreground/40 pb-1">
            {cloudbaudSig
              ? <img src={cloudbaudSig} alt="CloudBaud signature" className="h-10 object-contain" />
              : <span className="text-sm text-muted-foreground italic">Signature pending…</span>}
          </div>
          <div className="border-b border-foreground/40 pb-1 text-sm">
            By:{' '}
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {field(f.cloudbaudSignerName)}
            </span>
          </div>
          <div className="border-b border-foreground/40 pb-1 text-sm">
            Title:{' '}
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {field(f.cloudbaudSignerTitle)}
            </span>
          </div>
          <div className="border-b border-foreground/40 pb-1 text-sm">
            Date:{' '}
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {formatDate(f.cloudbaudSignDate)}
            </span>
          </div>
        </div>

        {/* Vendor block */}
        <div className="space-y-2">
          <p className="font-bold">
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {field(f.vendorName, 'Receiving Party')}
            </span>
          </p>
          <div className="border-b border-foreground/40 pb-1">
            {vendorSig
              ? <img src={vendorSig} alt="Vendor signature" className="h-10 object-contain" />
              : <span className="text-sm text-muted-foreground italic">Signature pending…</span>}
          </div>
          <div className="border-b border-foreground/40 pb-1 text-sm">
            Date:{' '}
            <span className="bg-brand-blue/20 text-brand-blue font-semibold px-1 rounded">
              {formatDate(f.vendorSignDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NdaForm() {
  const [form, setForm] = useState(DEFAULT);
  const [cloudbaudSig, setCloudbaudSig] = useState(null);
  const [vendorSig, setVendorSig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState('form');
  const previewRef = useRef(null);

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: typeof e === 'string' ? e : e.target.value }));

  const handleCopy = async () => {
    if (!previewRef.current) return;
    try {
      await navigator.clipboard.writeText(previewRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently ignore clipboard errors */
    }
  };

  const handlePrint = () => {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>NDA – CloudBaud</title>
      <style>
        body { font-family: Georgia, serif; font-size: 14px; line-height: 1.7;
               max-width: 700px; margin: 40px auto; color: #000; }
        h2 { text-align: center; text-transform: uppercase; font-size: 14px; }
        hr { margin: 20px 0; }
        ul { padding-left: 20px; }
        .field { font-weight: bold; border-bottom: 1px solid #999; padding: 0 4px; }
        img { max-height: 48px; display: block; }
        @media print { body { margin: 20mm; } }
      </style>
    </head><body>${content.replace(
      /class="[^"]*bg-brand-blue\/20[^"]*"/g,
      'class="field"'
    )}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-350 mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
            <FileSignature className="size-5 sm:size-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">NDA / Non-Compete Agreement</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Fill in the fields — the live preview updates instantly.
            </p>
          </div>
        </div>

        <div className="flex gap-2 sm:shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors border border-border"
          >
            {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Text'}</span>
            <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      {/* Mobile tab switcher — hidden on large screens */}
      <div className="flex lg:hidden gap-2 mb-4 rounded-lg border border-border p-1 bg-secondary/30">
        {['form', 'preview'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              mobileTab === tab
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'form' ? 'Fill Form' : 'Preview'}
          </button>
        ))}
      </div>

      {/* Content — stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Form panel ── */}
        <div className={`lg:w-95 lg:shrink-0 ${
          mobileTab === 'form' ? 'block' : 'hidden'
        } lg:block`}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agreement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Effective Date */}
              <div className="space-y-1.5">
                <Label>Effective Date</Label>
                <Input type="date" value={form.effectiveDate} onChange={set('effectiveDate')} />
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Receiving Party (Vendor)
              </p>

              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Kevin Vail" value={form.vendorName} onChange={set('vendorName')} />
              </div>

              <div className="space-y-1.5">
                <Label>Title / Role</Label>
                <Input placeholder="e.g. Business Manager" value={form.vendorTitle} onChange={set('vendorTitle')} />
              </div>

              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input placeholder="Street, City, ZIP" value={form.vendorAddress} onChange={set('vendorAddress')} />
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Agreement Terms
              </p>

              <div className="space-y-1.5">
                <Label>NDA Duration</Label>
                <Select value={form.ndaDurationYears} onValueChange={set('ndaDurationYears')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Non-Compete Period</Label>
                <Select value={form.nonCompeteMonths} onValueChange={set('nonCompeteMonths')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Non-Compete State</Label>
                <Select value={form.nonCompeteState} onValueChange={set('nonCompeteState')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                CloudBaud Signatory
              </p>

              <div className="space-y-1.5">
                <Label>Signer Name</Label>
                <Input placeholder="e.g. Jishnu Nath" value={form.cloudbaudSignerName} onChange={set('cloudbaudSignerName')} />
              </div>

              <div className="space-y-1.5">
                <Label>Signer Title</Label>
                <Input placeholder="e.g. Managing Director" value={form.cloudbaudSignerTitle} onChange={set('cloudbaudSignerTitle')} />
              </div>

              <div className="space-y-1.5">
                <Label>CloudBaud Sign Date</Label>
                <Input type="date" value={form.cloudbaudSignDate} onChange={set('cloudbaudSignDate')} />
              </div>

              <SignaturePad
                label="CloudBaud Signature"
                value={cloudbaudSig}
                onChange={setCloudbaudSig}
              />

              <Separator />
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Vendor Signature
              </p>

              <div className="space-y-1.5">
                <Label>Vendor Sign Date</Label>
                <Input type="date" value={form.vendorSignDate} onChange={set('vendorSignDate')} />
              </div>

              <SignaturePad
                label="Vendor Signature"
                value={vendorSig}
                onChange={setVendorSig}
              />

            </CardContent>
          </Card>
        </div>

        {/* ── Preview panel ── */}
        <div className={`flex-1 ${
          mobileTab === 'preview' ? 'block' : 'hidden'
        } lg:block`}>
          <Card>
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Live Preview &mdash; highlighted fields update as you type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <div ref={previewRef}>
                <NdaPreview f={form} cloudbaudSig={cloudbaudSig} vendorSig={vendorSig} />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
