export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  try {
    const title = filename.replace(/_/g, " ");

    // Clone element to sanitize and prepare printable version
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove any interactive UI elements that shouldn't be printed
    const noPrintElems = clone.querySelectorAll('.no-print, button, .absolute.z-50, [role="button"]');
    noPrintElems.forEach(el => el.remove());

    // Normalize and unclip all diagram transform wrappers so diagrams render fully and cleanly
    const transformElements = clone.querySelectorAll(
      '.react-transform-wrapper, .react-transform-component, .react-transform-element'
    );
    transformElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transform = 'none';
      htmlEl.style.webkitTransform = 'none';
      htmlEl.style.overflow = 'visible';
      htmlEl.style.maxHeight = 'none';
      htmlEl.style.height = 'auto';
      htmlEl.style.minHeight = '0';
      htmlEl.style.width = '100%';
    });

    // Unconstrain diagram containers and SVGs for razor-sharp, full-width vector print
    const mermaidContainers = clone.querySelectorAll('.mermaid, .mermaid-theme-override, .mermaid-content');
    mermaidContainers.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.overflow = 'visible';
      htmlEl.style.maxHeight = 'none';
      htmlEl.style.height = 'auto';
      htmlEl.style.width = '100%';
      htmlEl.style.display = 'block';
      htmlEl.style.pageBreakInside = 'avoid';
      htmlEl.style.breakInside = 'avoid';
    });

    const svgs = clone.querySelectorAll('.mermaid svg, svg');
    svgs.forEach(svg => {
      const svgEl = svg as SVGElement;
      svgEl.style.maxWidth = '100%';
      svgEl.style.width = '100%';
      svgEl.style.height = 'auto';
      svgEl.style.maxHeight = 'none';
      svgEl.style.overflow = 'visible';
      svgEl.style.display = 'block';
      svgEl.style.margin = '0 auto';
      svgEl.removeAttribute('height');
    });

    // Flatten <mark> annotations to clean readable text
    const marks = clone.querySelectorAll('mark');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
      }
    });

    // Create a standalone, styled HTML document for print
    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>

        <!-- Tailwind CSS & Google Fonts for beautiful typography -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">

        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 32px;
            line-height: 1.75;
          }
          h1, h2, h3, h4 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            page-break-inside: avoid;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 10px 14px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 700;
          }
          blockquote {
            border-left: 4px solid #10b981;
            padding-left: 16px;
            margin: 16px 0;
            color: #334155;
            font-style: italic;
            background-color: #f0fdf4;
            padding-top: 8px;
            padding-bottom: 8px;
            border-radius: 0 8px 8px 0;
          }
          pre, code {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-family: monospace;
            padding: 2px 6px;
            font-size: 13px;
          }
          svg, img {
            max-width: 100%;
            height: auto;
          }

          /* Diagram & Flowchart Print Optimizations */
          .mermaid, .diagram-container {
            margin: 28px 0 !important;
            padding: 20px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            background-color: #f8fafc !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
          }
          .mermaid svg {
            display: block !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .react-transform-wrapper, .react-transform-component, .react-transform-element {
            transform: none !important;
            overflow: visible !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
          }
          /* Node & Arrow styling for razor-sharp vector PDF rendering */
          .node rect, .node circle, .node polygon, .node path {
            rx: 6px !important;
            ry: 6px !important;
            stroke-width: 2px !important;
          }
          .node text, .node .nodeLabel {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
            font-weight: 700 !important;
            font-size: 11px !important;
            fill: #0f172a !important;
          }
          .node.bottleneck rect, .bottleneck rect { fill: #fee2e2 !important; stroke: #ef4444 !important; }
          .node.bottleneck text, .bottleneck text { fill: #991b1b !important; color: #991b1b !important; }
          .node.reform rect, .reform rect { fill: #dcfce7 !important; stroke: #22c55e !important; }
          .node.reform text, .reform text { fill: #166534 !important; color: #166534 !important; }
          .node.constitutional rect, .constitutional rect { fill: #e0f2fe !important; stroke: #0284c7 !important; }
          .node.constitutional text, .constitutional text { fill: #075985 !important; color: #075985 !important; }
          .node.committee rect, .committee rect { fill: #fef9c3 !important; stroke: #ca8a04 !important; }
          .node.committee text, .committee text { fill: #854d0e !important; color: #854d0e !important; }
          .node.core rect, .core rect { fill: #e0e7ff !important; stroke: #6366f1 !important; }
          .node.core text, .core text { fill: #3730a3 !important; color: #3730a3 !important; }
          .edgePath .path { stroke: #64748b !important; stroke-width: 2px !important; }
          .edgePath marker { fill: #64748b !important; }
          .cluster rect { fill: #f1f5f9 !important; stroke: #cbd5e1 !important; stroke-width: 1.5px !important; }

          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0 !important; margin: 0 !important; background: white !important; }
            .page-break { page-break-before: always; }
            .mermaid, .diagram-container, svg {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar mb-6 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-3">
            <span class="font-bold text-lg">📄 UPSC Notes Print & PDF Export</span>
            <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">Ready to Print</span>
          </div>
          <button onclick="window.print()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
            <div>
              <span class="text-xs font-bold tracking-widest text-emerald-600 uppercase">UPSC IAS Preparation Portal</span>
              <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${title}</h1>
            </div>
            <div class="text-right text-xs text-slate-500">
              <p>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="prose max-w-none text-slate-800">
            ${clone.innerHTML}
          </div>

          <div class="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>UPSC Civil Services Preparation Portal — Verified Study Notes</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `;

    // Try opening in new window first (bypasses iframe sandbox print restrictions)
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
    } else {
      // Fallback if popups are completely blocked: trigger inline iframe printing
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }, 600);
      }
    }
  } catch (error) {
    console.error("PDF/Print Export Error:", error);
  }
};
