const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

const oldSelectHandler = `        setSelectionRect(rect);
        if (!isAddingNote) {
            setNoteContent("");
        }
      }
    } else {
       if (!isAddingNote) {
           setSelectionRect(null);
           setSelectedText("");
       }
    }
  };`;
  
const updatedSelectHandler = `        // Adjust popup position relative to the scroll container
        const scrollContainer = document.querySelector('.rss-reader-scroll-container');
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const relativeRect = {
            top: rect.top - containerRect.top + scrollContainer.scrollTop,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom - containerRect.top + scrollContainer.scrollTop,
            right: rect.right - containerRect.left
          };
          setSelectionRect(relativeRect as any);
        } else {
          setSelectionRect(rect);
        }
        
        if (!isAddingNote) {
            setNoteContent("");
        }
      }
    } else {
       if (!isAddingNote) {
           setSelectionRect(null);
           setSelectedText("");
       }
    }
  };`;

let newContent = content.replace(oldSelectHandler, updatedSelectHandler);

// We need to add the sticky note popover to the render
const scrollContainerStart = `className="flex-1 overflow-y-auto w-full relative transition-all duration-500 print:overflow-visible print:h-auto"`;
const scrollContainerUpdated = `className="flex-1 overflow-y-auto w-full relative transition-all duration-500 print:overflow-visible print:h-auto rss-reader-scroll-container"`;

newContent = newContent.replace(scrollContainerStart, scrollContainerUpdated);

const readerContainerEnd = `                        <div 
                          ref={articleContentRef}
                          className={\`\${fontClass()} space-y-6 max-w-3xl mx-auto w-full min-w-0 rss-reader-article\`}`;

const stickyNoteRender = `                        {/* Text Selection Floating Action Menu */}
                        {selectionRect && selectedText && (
                          <div 
                            className="absolute z-50 transform -translate-x-1/2 -translate-y-full bg-panel border border-panel-border shadow-xl rounded-xl p-2 flex flex-col gap-2 transition-all"
                            style={{ 
                              left: \`\${selectionRect.left + selectionRect.width / 2}px\`, 
                              top: \`\${selectionRect.top - 10}px\`,
                              minWidth: isAddingNote ? '280px' : 'auto'
                            }}
                          >
                            {!isAddingNote ? (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setIsAddingNote(true); }}
                                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg text-xs font-bold text-main transition-colors"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save to Notes
                                </button>
                                <div className="w-px h-4 bg-panel-border mx-1"></div>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigator.clipboard.writeText(selectedText);
                                    setSelectionRect(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/10 hover:text-accent rounded-lg text-xs font-bold text-main transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2 p-1" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Save Highlight
                                  </span>
                                  <button onClick={() => { setIsAddingNote(false); setSelectionRect(null); }} className="text-muted hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[11px] text-muted italic border-l-2 border-emerald-500/30 pl-2 max-h-20 overflow-y-auto line-clamp-3 my-1">
                                  "{selectedText}"
                                </div>
                                <textarea 
                                  value={noteContent}
                                  onChange={e => setNoteContent(e.target.value)}
                                  placeholder="Add your thoughts or insights... (optional)"
                                  className="w-full h-20 bg-input border border-panel-border rounded-lg p-2 text-xs text-main placeholder:text-muted focus:outline-none focus:border-emerald-500/50 resize-none"
                                  autoFocus
                                />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSaveStickyNote(); }}
                                  className="w-full py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Save to Data Bank
                                </button>
                              </div>
                            )}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-panel-border"></div>
                            <div className="absolute -bottom-[7px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-panel"></div>
                          </div>
                        )}
                        
                        <div 
                          ref={articleContentRef}
                          className={\`\${fontClass()} space-y-6 max-w-3xl mx-auto w-full min-w-0 rss-reader-article\`}`;

newContent = newContent.replace(readerContainerEnd, stickyNoteRender);

fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched highlight selection popover.');
