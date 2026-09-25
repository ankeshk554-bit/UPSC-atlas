const fs = require('fs');
let code = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

if (!code.includes('Highlighter,')) {
    code = code.replace(/Maximize,/, 'Maximize, Highlighter,');
}

const highlightPopup = `
      {/* TEXT SELECTION HIGHLIGHT POPUP */}
      {selectionRect && selectedText && (
        <div
          className="fixed z-[100] animate-fadeIn"
          style={{
            top: selectionRect.top - (isAddingNote ? 180 : 50),
            left: selectionRect.left + (selectionRect.width / 2) - (isAddingNote ? 150 : 60),
          }}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-app border border-panel-border shadow-2xl rounded-xl overflow-hidden flex flex-col" style={{ width: isAddingNote ? '300px' : 'auto' }}>
            {!isAddingNote ? (
              <div className="flex items-center p-1">
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => setIsAddingNote(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-accent/10 hover:text-accent rounded-lg text-muted text-[11px] font-bold uppercase tracking-wider transition-colors"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  Save Note
                </button>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                <div className="text-[10px] uppercase font-bold text-light tracking-widest mb-1 flex justify-between">
                  <span>Add Note to Highlight</span>
                  <button onClick={() => { setIsAddingNote(false); setSelectionRect(null); }} className="hover:text-main"><X className="w-3 h-3" /></button>
                </div>
                <div className="text-[11px] italic text-muted border-l-2 border-accent/30 pl-2 line-clamp-3 mb-2">
                  "{selectedText}"
                </div>
                <textarea
                  autoFocus
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes here..."
                  className="w-full h-20 text-[12px] bg-input border border-panel-border rounded-lg p-2 text-main focus:outline-none focus:border-accent resize-none placeholder:text-muted"
                />
                
                {/* Subject categorization */}
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-muted uppercase">Topic:</span>
                  <select 
                    value={selectedTagForSaving}
                    onChange={(e) => setSelectedTagForSaving(e.target.value)}
                    className="text-[11px] bg-app border border-panel-border rounded p-1 text-main flex-1"
                  >
                    <option value="Current Affairs (General)">Current Affairs (General)</option>
                    <option value="Polity & Governance">Polity & Governance</option>
                    <option value="Economy">Economy</option>
                    <option value="Science & Technology">Science & Tech</option>
                    <option value="Environment & Ecology">Environment & Ecology</option>
                    <option value="International Relations">International Relations</option>
                    <option value="History & Culture">History & Culture</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => { setIsAddingNote(false); setSelectionRect(null); }}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-panel-border text-muted hover:text-main hover:bg-black/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStickyNote}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-accent text-white hover:bg-accent/90 transition-all flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
`;

if (!code.includes('TEXT SELECTION HIGHLIGHT POPUP')) {
    code = code.replace(/<div className="h-\[calc\(100vh-48px\)\] overflow-hidden flex flex-col lg:flex-row bg-app relative print:h-auto print:overflow-visible">/, 
      '<div className="h-[calc(100vh-48px)] overflow-hidden flex flex-col lg:flex-row bg-app relative print:h-auto print:overflow-visible">\n' + highlightPopup);
}

fs.writeFileSync('src/components/RssReaderView.tsx', code);
console.log('Added highlight popup successfully');
