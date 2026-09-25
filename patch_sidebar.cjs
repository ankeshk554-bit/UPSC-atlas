const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

// Add TOC Sidebar rendering
const tocJSX = `                        <div className="flex items-center gap-1.5">`;

const updatedTocJSX = `                        <div className="flex items-center gap-1.5">`;

const readerContainerStart = `                      <div 
                        ref={articleContentRef}
                        className={\`\${fontClass()} space-y-6 max-w-3xl mx-auto w-full min-w-0 rss-reader-article\`}`;
                        
const updatedReaderContainerStart = `                      <div className="flex justify-center w-full relative">
                        
                        {/* Interactive Table of Contents Sidebar */}
                        {tableOfContents.length > 0 && (
                          <div className="hidden xl:block absolute left-0 w-64 h-auto max-h-[70vh] overflow-y-auto sticky top-24 -ml-72 pr-4 pl-2 py-4 border-r border-panel-border/30 z-10 transition-opacity opacity-60 hover:opacity-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 px-2">Table of Contents</h4>
                            <div className="space-y-1.5 border-l-2 border-panel-border/50 ml-2">
                              {tableOfContents.map((heading) => (
                                <button
                                  key={heading.id}
                                  onClick={() => {
                                    const el = document.getElementById(heading.id);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }}
                                  className={\`block w-full text-left py-1 px-3 text-[12px] font-medium transition-colors hover:text-accent hover:bg-accent/5 rounded-r-lg truncate
                                    \${heading.level === 1 ? 'text-main font-bold mt-2' : ''}
                                    \${heading.level === 2 ? 'text-main/90' : ''}
                                    \${heading.level === 3 ? 'text-muted pl-6' : ''}
                                    \${heading.level === 4 ? 'text-muted/80 pl-8 text-[11px]' : ''}
                                  \`}
                                  title={heading.title}
                                >
                                  {heading.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div 
                          ref={articleContentRef}
                          className={\`\${fontClass()} space-y-6 max-w-3xl mx-auto w-full min-w-0 rss-reader-article\`}`;

let newContent = content.replace(readerContainerStart, updatedReaderContainerStart);

// close the wrapper div
const readerContainerEnd = `                        {/* Sticky Action Bar */}`;
const updatedReaderContainerEnd = `                        </div>
                      </div>
                      
                      {/* Sticky Action Bar */}`;
                      
newContent = newContent.replace(readerContainerEnd, updatedReaderContainerEnd);

fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched sidebar TOC.');
