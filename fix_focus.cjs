const fs = require('fs');
let code = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const regex = /\{\/\* Bookmark Toggle \*\/\}/;

const replacement = `{/* Focus Mode Toggle */}
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={\`hidden lg:flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all \${
                    isFocusMode
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "bg-app border-panel-border text-muted hover:text-main"
                  }\`}
                  title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                  {isFocusMode ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                  Focus
                </button>
                
                {/* Bookmark Toggle */}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/RssReaderView.tsx', code);
console.log('Added Focus Mode toggle');
