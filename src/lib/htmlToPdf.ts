let html2pdfPromise: Promise<any> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load script: ' + src)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    (script as any)._loaded = false;
    script.onload = () => { (script as any)._loaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.head.appendChild(script);
  });
}

async function getHtml2Pdf() {
  if (!html2pdfPromise) {
    html2pdfPromise = (async () => {
      const CDN = 'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
      await loadScript(CDN);
      const g = (window as any).html2pdf;
      if (!g) throw new Error('html2pdf.js not available on window');
      return g;
    })();
  }
  return html2pdfPromise;
}

type ExportOptions = {
  fileName?: string;
  margin?: number | [number, number, number, number];
};

const defaultOpts = (fileName?: string, margin?: ExportOptions['margin']) => ({
  filename: fileName || 'invoice.pdf',
  margin: margin ?? [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const },
});

export async function downloadElementPdf(element: HTMLElement, options: ExportOptions = {}) {
  const html2pdf = await getHtml2Pdf();
  const opts = defaultOpts(options.fileName, options.margin);
  await html2pdf().set(opts).from(element).save();
}

export async function openElementPdf(element: HTMLElement, options: ExportOptions = {}) {
  const html2pdf = await getHtml2Pdf();
  const opts = defaultOpts(options.fileName, options.margin);
  const worker = html2pdf().set(opts).from(element);
  await worker.toPdf();
  const pdf = await worker.get('pdf');
  const blob: Blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
