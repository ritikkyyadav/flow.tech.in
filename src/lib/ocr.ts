// Lightweight OCR utility with browser TextDetector fallback and optional dynamic Tesseract import.
// No hard dependency on tesseract.js to keep builds working if it's not installed.
// If neither backend is available, returns empty text and lets the caller handle gracefully.

export type OCRFields = {
  amount?: number | null;
  type?: 'income' | 'expense';
  category?: string;
  description?: string;
  date?: string; // yyyy-mm-dd
  merchant?: string;
};

export type OCRResult = {
  text: string;
  fields: OCRFields;
  engine: 'text-detector' | 'tesseract' | 'none';
};

/**
 * Recognize text from a receipt image data URL.
 * Tries TextDetector API first (if available), then dynamic-imports tesseract.js.
 */
export async function recognizeReceipt(imageDataUrl: string): Promise<OCRResult> {
  // Try TextDetector (if supported by the browser)
  try {
    const hasTextDetector = typeof window !== 'undefined' && (window as any).TextDetector;
    if (hasTextDetector) {
      const text = await detectWithTextDetector(imageDataUrl);
      const fields = parseReceiptText(text);
      return { text, fields, engine: 'text-detector' };
    }
  } catch (e) {
    // ignore and try tesseract
  }

  // Try Tesseract.js if present (dynamic import, no types required)
  try {
    // Dynamic module name to avoid TS resolution at compile time
    const pkg: any = 'tesseract.js';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: any = await import(/* @vite-ignore */ pkg);
    const { createWorker } = mod;
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(imageDataUrl);
    await worker.terminate();
    const text = data?.text ?? '';
    const fields = parseReceiptText(text);
    return { text, fields, engine: 'tesseract' };
  } catch (e) {
    // Neither backend available; return empty result gracefully
    return { text: '', fields: {}, engine: 'none' };
  }
}

async function detectWithTextDetector(imageDataUrl: string): Promise<string> {
  // Create an Image element and wait for load
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const load = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });
  img.src = imageDataUrl;
  await load;

  // @ts-ignore - TextDetector is experimental, not in TS lib by default
  const detector = new (window as any).TextDetector();
  // Some implementations accept an image bitmap
  let bitmap: ImageBitmap | HTMLImageElement = img;
  try {
    bitmap = await createImageBitmap(img);
  } catch {
    // fallback to img element
  }
  const results = await detector.detect(bitmap);
  // Concatenate detected strings line by line
  const text = (results || [])
    .map((r: any) => r.rawValue || r.text || '')
    .filter(Boolean)
    .join('\n');
  return text;
}

// Heuristic parser to pull common fields from OCR text
export function parseReceiptText(text: string): OCRFields {
  const fields: OCRFields = {};
  if (!text || !text.trim()) return fields;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Merchant: first non-numeric, reasonably short line
  const merchant = lines.find((l) => /[a-zA-Z]/.test(l) && l.length <= 50 && !/total|invoice|amount|qty|price/i.test(l));
  if (merchant) fields.merchant = merchant;

  // Date patterns: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, dd Mon yyyy, Mon dd, yyyy
  const dateMatch = text.match(/(\b\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}\b)|(\b\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}\b)|(\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}\b)|(\b[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}\b)/);
  if (dateMatch) {
    const raw = dateMatch[0];
    const iso = normalizeDateToISO(raw);
    if (iso) fields.date = iso;
  }

  // Amounts: look for currency markers: ₹, INR, Rs
  const amountRegex = /(₹|INR|Rs\.?|MRP)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
  const plainAmountRegex = /\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})?)\b/g;

  const amounts: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = amountRegex.exec(text)) !== null) {
    const num = parseFloat((m[2] || '').replace(/,/g, ''));
    if (!isNaN(num)) amounts.push(num);
  }
  // If nothing found with currency markers, fall back to any numbers and pick a likely total (max)
  if (amounts.length === 0) {
    while ((m = plainAmountRegex.exec(text)) !== null) {
      const num = parseFloat((m[1] || '').replace(/,/g, ''));
      if (!isNaN(num)) amounts.push(num);
    }
  }
  if (amounts.length) {
    // Heuristic: total is often the maximum amount on the receipt
    const amount = Math.max(...amounts);
    fields.amount = amount;
  } else {
    fields.amount = null;
  }

  // Type/category: receipts are usually expenses
  fields.type = 'expense';
  // Set category hint from keywords
  const lower = text.toLowerCase();
  if (/food|dining|restaurant|cafe|uber eats|zomato|swiggy|meal/.test(lower)) fields.category = 'Food & Dining';
  else if (/fuel|petrol|diesel|gas|pump/.test(lower)) fields.category = 'Transportation';
  else if (/uber|ola|ride|cab|metro|bus|train/.test(lower)) fields.category = 'Transportation';
  else if (/medicine|pharmacy|chemist|hospital|clinic/.test(lower)) fields.category = 'Healthcare';
  else if (/grocery|supermarket|mart|store/.test(lower)) fields.category = 'Shopping';
  else if (/electricity|water bill|internet|broadband|mobile bill|dth|utility/.test(lower)) fields.category = 'Bills & Utilities';

  // Description
  const amountLabelIdx = lines.findIndex((l) => /total|amount due|grand total/i.test(l));
  const descParts: string[] = [];
  if (fields.merchant) descParts.push(fields.merchant);
  if (amountLabelIdx >= 0 && lines[amountLabelIdx]) descParts.push(lines[amountLabelIdx]);
  fields.description = descParts.join(' - ') || 'Scanned receipt';

  return fields;
}

function normalizeDateToISO(raw: string): string | undefined {
  // Try yyyy-mm-dd first
  let m = raw.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (m) return toISO(m[1], m[2], m[3]);

  // dd-mm-yyyy or dd/mm/yyyy
  m = raw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return toISO(year, m[2], m[1]);
  }

  // dd Mon yyyy
  m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const month = monthFromName(m[2]);
    if (month) return toISO(year, String(month), m[1]);
  }

  // Mon dd, yyyy
  m = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const month = monthFromName(m[1]);
    if (month) return toISO(m[3], String(month), m[2]);
  }
  return undefined;
}

function monthFromName(name: string): number | undefined {
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const idx = months.indexOf(name.slice(0,3).toLowerCase());
  return idx >= 0 ? idx + 1 : undefined;
}

function toISO(year: string, month: string, day: string): string {
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
