// Centralized pdfmake loader with ESM/CJS interop normalization and caching
let pdfMakePromise: Promise<any> | null = null;

export async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      // pdfmake export shape can vary depending on bundler interop
      const pdfMake = (pdfMakeMod as any).default ?? (pdfMakeMod as any);
      const fontsMod = await import("pdfmake/build/vfs_fonts");
      const fontsRoot = (fontsMod as any).default ?? (fontsMod as any);
      const vfs = fontsRoot?.pdfMake?.vfs;
      if (vfs) {
        (pdfMake as any).vfs = vfs;
      }
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

export type PdfMake = Awaited<ReturnType<typeof getPdfMake>>;
