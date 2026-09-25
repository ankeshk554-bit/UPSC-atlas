const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const targetContent = `                        <div id="ai-brief-summary-section" className="p-5 border border-accent/20 bg-accent/5 rounded-2xl relative overflow-hidden my-4 print:my-2">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-accent/10 rounded-xl text-accent shrink-0 mt-0.5">
                                <Brain className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                                  summary - AI powered
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-black tracking-widest uppercase border border-accent/20">
                                    ({selectedItemWords} Words)
                                  </span>
                                </h3>
                                <p className="text-[11px] text-muted font-semibold mt-0.5">
                                  Structured, high-yield bulleted points summarizing core policy insights.
                                </p>
                              </div>
                            </div>

                            {!aiBriefSummaries[selectedItem.id] && !isGeneratingBriefSummary && (
                              <button
                                onClick={handleGenerateBriefSummary}
                                className="px-3.5 py-1.5 bg-accent hover:opacity-90 text-sidebar font-extrabold rounded-lg text-[11px] uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer shadow hover:scale-102 active:scale-98 shrink-0"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Summarize
                              </button>
                            )}
                          </div>

                          {isGeneratingBriefSummary && (
                            <div className="mt-4 flex items-center gap-3 text-[11px] text-muted font-bold bg-app/50 border border-panel-border/30 p-3.5 rounded-xl animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin text-accent" />
                              Drafting key syllabus outcomes and high-yield insights with ultra-fast AI...
                            </div>
                          )}

                          {briefSummaryError && (
                            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {briefSummaryError}
                              </div>
                              <button onClick={handleGenerateBriefSummary} className="px-2 py-1 bg-rose-500/20 rounded-md hover:bg-rose-500/30 transition-colors uppercase font-bold shrink-0">
                                Retry
                              </button>
                            </div>
                          )}

                          {aiBriefSummaries[selectedItem.id] && (
                            <div className="mt-4 bg-app/60 border border-panel-border/30 p-4 rounded-xl relative">
                              <div className="prose prose-sm max-w-none text-main dark:text-main text-[11px] font-medium leading-relaxed leading-para">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {aiBriefSummaries[selectedItem.id]}
                                </Markdown>
                              </div>
                              <div className="mt-4 pt-3 border-t border-panel-border/30 flex items-center justify-between text-[9px] text-muted font-black uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500" /> summary - AI powered loaded successfully
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(aiBriefSummaries[selectedItem.id]);
                                    alert("AI summary copied to clipboard!");
                                  }}
                                  className="text-accent hover:underline flex items-center gap-1 cursor-pointer font-bold"
                                >
                                  Copy Summary
                                </button>
                              </div>
                            </div>
                          )}
                        </div>`;

const replacementContent = `                        <div id="ai-brief-summary-section" className="px-4 py-3 border border-panel-border bg-panel/40 rounded-xl relative overflow-hidden my-4 opacity-80 hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                              <div className="flex items-center gap-2">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-main flex items-center gap-2">
                                  AI Summary
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-input text-muted border border-panel-border/60">
                                    {selectedItemWords} words
                                  </span>
                                </h3>
                              </div>
                            </div>

                            {!aiBriefSummaries[selectedItem.id] && !isGeneratingBriefSummary && (
                              <button
                                onClick={handleGenerateBriefSummary}
                                className="px-2.5 py-1 text-accent font-bold rounded text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors hover:bg-accent/10"
                              >
                                Generate
                              </button>
                            )}
                          </div>

                          {isGeneratingBriefSummary && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted bg-input/50 p-2 rounded-lg animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin text-accent" />
                              Drafting key syllabus outcomes...
                            </div>
                          )}

                          {briefSummaryError && (
                            <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] rounded-lg flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {briefSummaryError}
                              </div>
                              <button onClick={handleGenerateBriefSummary} className="px-2 py-1 bg-rose-500/20 rounded hover:bg-rose-500/30 transition-colors uppercase font-bold shrink-0">
                                Retry
                              </button>
                            </div>
                          )}

                          {aiBriefSummaries[selectedItem.id] && (
                            <div className="mt-3 bg-input/40 border border-panel-border/30 p-3 rounded-lg relative">
                              <div className="prose prose-sm max-w-none text-main dark:text-main text-[11px] leading-relaxed">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                  {aiBriefSummaries[selectedItem.id]}
                                </Markdown>
                              </div>
                              <div className="mt-3 pt-2 border-t border-panel-border/30 flex items-center justify-between text-[9px] text-muted font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500" /> AI generated
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(aiBriefSummaries[selectedItem.id]);
                                    alert("AI summary copied to clipboard!");
                                  }}
                                  className="hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-2.5 h-2.5" /> Copy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>`;

const newContent = content.replace(targetContent, replacementContent);
fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched AI summary box.');
