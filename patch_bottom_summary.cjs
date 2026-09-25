const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const targetContent = `                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans bg-input rounded-2xl border border-panel-border mt-10 mx-4">
                      <Sparkles className="w-8 h-8 text-accent mb-2" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-main">
                          Need UPSC Syllabus Context?
                        </h4>
                        <p className="text-[12px] text-muted max-w-[300px] leading-relaxed mx-auto">
                          Summarize this article instantly into high-yield GS Linkages, Mains Model Question & answer guidance, and Prelims facts!
                        </p>
                      </div>
                      <button
                        onClick={handleAiSummarize}
                        disabled={isSummarizing}
                        className="w-full flex-shrink-0 flex items-center justify-center gap-2 bg-accent text-black px-5 py-3 rounded-xl font-bold hover:bg-accent/80 transition-all text-sm uppercase tracking-wider mt-4"
                      >
                        {isSummarizing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Synthesizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Generate summary - AI powered
                          </>
                        )}
                      </button>
                    </div>
                  )}`;

const replacementContent = `                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-panel/40 border border-panel-border rounded-xl mt-12 mx-auto max-w-2xl shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-main">
                            UPSC Syllabus Context
                          </h4>
                          <p className="text-[11px] text-muted leading-tight mt-0.5 max-w-[280px]">
                            Generate GS linkages, Mains guidance, and Prelims facts using AI.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleAiSummarize}
                        disabled={isSummarizing}
                        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-black rounded-lg font-bold transition-all text-[11px] uppercase tracking-wider disabled:opacity-50"
                      >
                        {isSummarizing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </button>
                    </div>
                  )}`;

const newContent = content.replace(targetContent, replacementContent);
fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched bottom AI summary box.');
