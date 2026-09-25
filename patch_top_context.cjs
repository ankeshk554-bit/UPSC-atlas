const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const targetContent = `                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-panel-border pb-4">
                        <div>
                          <h3 className="text-[14px] font-black uppercase text-accent tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                            AI UPSC Syllabus Context
                          </h3>
                          <p className="text-[11px] text-muted mt-0.5">
                            Custom structured analysis for Indian Civil Services
                          </p>
                        </div>`;
                        
const replacementContent = `                    <div className="space-y-4 bg-panel/30 border border-panel-border rounded-xl p-6 relative">
                      <div className="flex items-center justify-between border-b border-panel-border pb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-accent tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Syllabus Context
                          </h3>
                          <p className="text-[10px] font-medium text-muted mt-1 uppercase tracking-widest">
                            Structured Analysis & Highlights
                          </p>
                        </div>`;
                        
const newContent = content.replace(targetContent, replacementContent);
fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched top AI summary box.');
