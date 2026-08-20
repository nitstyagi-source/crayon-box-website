"use client";

/**
 * Cleanly prints an isolated DOM element on A5 paper without printing the parent webpage,
 * sidebars, navigation banners, or modal container overlays.
 */
export function printIsolatedElement(elementOrId: HTMLElement | string | null, documentTitle = "Fee Receipt") {
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
            size: A5 portrait;
            margin: 5mm;
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
            max-width: 138mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            background: #ffffff !important;
          }
          button, .no-print {
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
  }, 250);
}
