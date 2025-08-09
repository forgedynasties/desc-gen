'use client';

import { useState } from 'react';

export default function HomePage() {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState(''); // added
  const [info, setInfo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Added: resilient clipboard helper
  async function copyToClipboard(text: string) {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* ignore to fallback */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  function buildDummyHtml(t: string, raw: string) {
    const lines = raw
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const featureLines = lines.filter(l => /^[*-]\s+/.test(l));
    const maybeBullets = featureLines.length >= 2 ? featureLines : [];

    const specs = lines
      .filter(l => !maybeBullets.includes(l))
      .map(l => {
        const [k, ...rest] = l.split(':');
        if (rest.length) {
          return `<li><strong>${k.trim()}:</strong> ${rest.join(':').trim()}</li>`;
        }
        return '';
      })
      .filter(Boolean);

    const bullets = maybeBullets.map(l =>
      `<li>${l.replace(/^[*-]\s+/, '')}</li>`
    );

    return `
<div class="product-description">
  <h2>${t}</h2>
  <p>${lines[0] && !/[:*-]/.test(lines[0]) ? lines[0] : `Discover the ${t} crafted for modern needs.`}</p>
  ${bullets.length ? `<ul class="features">
    ${bullets.join('\n    ')}
  </ul>` : ''}
  ${specs.length ? `<h3>Key Details</h3>
  <ul class="specs">
    ${specs.join('\n    ')}
  </ul>` : ''}
  <p class="cta">Upgrade your experience with the ${t} today.</p>
</div>`.trim();
  }

  async function generateDescription() {
    setLoading(true);
    setResult('');
    setCopied(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, raw_info: info, brand }),
      });
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();
      const html = (data.html || '').trim();
      setResult(html);
      const ok = await copyToClipboard(html);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch (e) {
      console.error(e);
      // fallback to dummy
      const html = buildDummyHtml(title, info);
      setResult(html);
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    if (await copyToClipboard(result)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-200/40 via-fuchsia-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <header className="relative mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
              ✨
            </span>
            Generate a Product Description
          </h2>
          <p className="mt-2 text-sm text-black">
            Enter a clear title and paste raw product details. We will craft a concise,
            persuasive, SEO‑friendly description.
          </p>
        </header>

        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Product Title</span>
              <span className="text-xs font-normal text-slate-400">
                {title.length}/120
              </span>
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg text-slate-800 border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
              placeholder="E.g. Wireless Noise-Cancelling Over-Ear Headphones"
            />
          </div>

          {/* Brand input (added) */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Brand</span>
              <span className="text-xs font-normal text-slate-400">
                {brand.length}/60
              </span>
            </label>
            <input
              type="text"
              value={brand}
              maxLength={60}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg text-slate-800 border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
              placeholder="E.g. Lumina Studio Designs"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Raw Information</span>
              <span className="text-xs font-normal text-slate-400">
                {info.length} chars
              </span>
            </label>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="w-full text-slate-800 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm h-32 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition resize-y"
              placeholder="Paste bullet points, specs, materials, dimensions, target audience, differentiators..."
            />
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={generateDescription}
              disabled={loading || !title || !info}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 h-11 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-indigo-500/30
                ${
                  loading || !title || !info
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                }`}
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? 'Generating...' : 'Generate Description'}
            </button>
            {result && (
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 h-11 text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition focus:outline-none focus:ring-4 focus:ring-slate-400/20"
              >
                {copied ? 'Copied HTML!' : 'Copy HTML'}
              </button>
            )}
          </div>

          {result && (
            <div className="space-y-5 mt-4">
              {/* Raw HTML code block */}
              <div className="group relative rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-black tracking-wide">
                    Raw HTML
                  </h3>
                </div>
                <pre className="text-xs leading-relaxed overflow-x-auto whitespace-pre scrollbar-thin text-black">
                  <code>{result}</code>
                </pre>
              </div>

              {/* Rendered Preview */}
              <div className="group relative rounded-xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700 tracking-wide">
                    HTML Preview
                  </h3>
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-800
                  [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold
                  [&_h2]:mt-0
                  [&_table]:w-full [&_table]:border [&_table]:border-slate-300 [&_table]:border-collapse
                  [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-slate-50 [&_th]:text-left
                  [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1
                  [&_ul]:list-disc [&_ul]:pl-5
                  [&_.cta]:font-medium [&_.cta]:text-indigo-600"
                  dangerouslySetInnerHTML={{ __html: result }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
