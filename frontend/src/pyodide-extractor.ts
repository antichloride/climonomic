import pythonExtractorCode from '../../scripts/extraction_webfassung.py?raw';

let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

/**
 * Lazily loads and initializes Pyodide in the browser with the shared Python extraction script.
 */
export async function getPyodide(onProgress?: (msg: string) => void): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = (async () => {
    if (onProgress) onProgress('Lade Pyodide Python-Laufzeitumgebung...');
    
    // Check if loadPyodide is already on window
    if (typeof (window as any).loadPyodide === 'undefined') {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Konnte Pyodide CDN nicht erreichen. Bitte überprüfen Sie Ihre Internetverbindung.'));
        document.head.appendChild(script);
      });
    }

    if (onProgress) onProgress('Initialisiere Python WebAssembly...');
    const pyodide = await (window as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    if (onProgress) onProgress('Registriere Python-Extraktionsskript...');
    await pyodide.runPythonAsync(pythonExtractorCode);

    pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

/**
 * Extracts the input state directly from an Excel file (.xlsx) using the shared Python extractor.
 */
export async function extractFromExcelFile(
  file: File | ArrayBuffer,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; inputsJson?: string; error?: string }> {
  try {
    const pyodide = await getPyodide(onProgress);

    if (onProgress) onProgress('Lese Excel-Arbeitsmappe...');
    const buffer = file instanceof File ? await file.arrayBuffer() : file;
    const uint8 = new Uint8Array(buffer);

    if (onProgress) onProgress('Extrahiere Daten mit Python (scripts/extraction_webfassung.py)...');

    // Write file into Pyodide virtual memory filesystem
    pyodide.FS.writeFile('uploaded.xlsx', uint8);

    const jsonResult: string = await pyodide.runPythonAsync(`
      with open('uploaded.xlsx', 'rb') as f:
          data = f.read()
      extract_inputs_json_from_bytes(data)
    `);

    // Clean up temporary file
    try {
      pyodide.FS.unlink('uploaded.xlsx');
    } catch {}

    if (onProgress) onProgress('✓ Extraktion erfolgreich abgeschlossen!');
    return { success: true, inputsJson: jsonResult };
  } catch (err: any) {
    console.error('Excel extraction error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}
