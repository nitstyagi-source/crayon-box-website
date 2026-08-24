"use client";

export interface PrintIsolatedOptions {
  pageSize?: "A4 landscape" | "A4 portrait" | "A5 landscape" | "A5 portrait" | "auto";
  orientation?: "landscape" | "portrait";
  maxWidth?: string;
  margin?: string;
  isWideReport?: boolean;
  fontSize?: string;
}

/**
 * Cleanly prints an isolated DOM element without printing the parent webpage,
 * sidebars, navigation banners, or modal container overlays.
 * Supports auto-detection for wide multi-column statements (e.g. Day Book, Registers)
 * and compact single/double vouchers (e.g. Fee Receipts, Payment Vouchers).
 */
export function printIsolatedElement(
  elementOrId: HTMLElement | string | null, 
  documentTitle = "Document",
  options?: PrintIsolatedOptions
) {
  if (typeof window === "undefined") return;

  let element: HTMLElement | null = null;
  if (typeof elementOrId === "string") {
    element = document.getElementById(elementOrId);
  } else {
    element = elementOrId;
  }

  if (!element) {
    console.error("Print Error: Element not found to print");
    window.print();
    return;
  }

  // Remove any previous print iframes
  const oldIframe = document.getElementById("clean-print-iframe");
  if (oldIframe) {
    oldIframe.remove();
  }

  const printIframe = document.createElement("iframe");
  printIframe.id = "clean-print-iframe";
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";
  printIframe.style.visibility = "hidden";
  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Determine whether this is a wide report (Day Book, Defaulters, Statement)
  const isWide = options?.isWideReport ?? (
    options?.pageSize?.includes("landscape") ||
    documentTitle.toLowerCase().includes("report") ||
    documentTitle.toLowerCase().includes("day_book") ||
    documentTitle.toLowerCase().includes("statement") ||
    documentTitle.toLowerCase().includes("defaulter") ||
    documentTitle.toLowerCase().includes("register")
  );

  const pageSize = options?.pageSize || (isWide ? "A4 landscape" : "A5 portrait");
  const margin = options?.margin || (isWide ? "4mm" : "5mm");
  const maxWidth = options?.maxWidth || (isWide ? "100%" : "100%");
  const baseFontSize = options?.fontSize || (isWide ? "7pt" : "9pt");

  // Grab all active stylesheets from parent document (Tailwind CSS, fonts, globals)
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map(s => s.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${documentTitle}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${styles}
        <style>
          @page {
            size: ${pageSize};
            margin: ${margin};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
            height: auto !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          .isolated-print-wrapper {
            width: 100% !important;
            max-width: ${maxWidth} !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          ${isWide ? `
            /* Wide Report Auto-fit & Scaling Rules */
            div, table, thead, tbody, tr, th, td {
              overflow: visible !important;
            }
            .overflow-x-auto, .overflow-hidden {
              overflow: visible !important;
              max-width: 100% !important;
            }
            table {
              width: 100% !important;
              max-width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto !important;
              page-break-inside: auto !important;
              font-size: ${baseFontSize} !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            th, td {
              padding: 2px 3px !important;
              font-size: ${baseFontSize} !important;
              line-height: 1.15 !important;
              border: 0.5pt solid #78716c !important;
            }
            th {
              background-color: #e7e5e4 !important;
              color: #0c0a09 !important;
              font-weight: 800 !important;
            }
          ` : ''}
          button, .no-print, [data-hide-print="true"] {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="isolated-print-wrapper">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Trigger print after styles load
  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    } finally {
      setTimeout(() => {
        printIframe.remove();
      }, 2000);
    }
  }, 300);
}
