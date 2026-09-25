const fs = require('fs');
const content = fs.readFileSync('src/components/RssReaderView.tsx', 'utf-8');

// 1. Add progress bar state and TTS state to state declarations
let newContent = content.replace(
  '  // Read more/less logic',
  `  // TTS logic
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState<SpeechSynthesisUtterance | null>(null);

  // Read more/less logic`
);

// 2. Add TTS handler
newContent = newContent.replace(
  '  const handleFilterClick = (e: React.MouseEvent) => {',
  `  const toggleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechSynthesisInstance(null);
    } else {
      if (selectedItem) {
        const textToRead = fullArticle?.content || selectedItem.content || selectedItem.description || selectedItem.title;
        // Strip out HTML tags for clean reading
        const plainText = textToRead.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ');
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 0.95; // Slightly slower for better comprehension of dense material
        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeechSynthesisInstance(null);
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setSpeechSynthesisInstance(utterance);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFilterClick = (e: React.MouseEvent) => {`
);

// 3. Add audio and progress buttons to the reader header
const readerHeaderString = `<button
                                  onClick={() => setShowTextSettings(!showTextSettings)}
                                  className={\`p-1.5 rounded-lg transition-colors \${showTextSettings ? 'bg-accent/10 text-accent' : 'text-muted hover:text-main hover:bg-input'}\`}
                                  title="Text Settings"
                                >
                                  <Type className="w-4 h-4" />
                                </button>`;
                                
const modifiedReaderHeaderString = `<button
                                  onClick={toggleTTS}
                                  className={\`p-1.5 rounded-lg transition-colors \${isSpeaking ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'text-muted hover:text-main hover:bg-input'}\`}
                                  title={isSpeaking ? "Stop Reading" : "Listen to Article"}
                                >
                                  {isSpeaking ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => setShowTextSettings(!showTextSettings)}
                                  className={\`p-1.5 rounded-lg transition-colors \${showTextSettings ? 'bg-accent/10 text-accent' : 'text-muted hover:text-main hover:bg-input'}\`}
                                  title="Text Settings"
                                >
                                  <Type className="w-4 h-4" />
                                </button>`;

newContent = newContent.replace(readerHeaderString, modifiedReaderHeaderString);


// 4. Update progress bar tracking
const progressJSX = `        {/* Scroll Progress Bar for the whole view - hidden when a specific article is open to avoid double bars */}
        {!selectedItem && (
          <div className="absolute top-0 left-0 w-full h-0.5 z-50 pointer-events-none print:hidden">
            <div id="rss-scroll-progress-bar" className="h-full bg-accent transition-all duration-100 ease-out" style={{ width: '0%' }} />
          </div>
        )}`;
        
const updatedProgressJSX = `        {/* Progress Bar moved inside the article reader area */}`;

newContent = newContent.replace(progressJSX, updatedProgressJSX);

const articleProgressJSX = `                        <div className="flex items-center gap-1.5">`;
const updatedArticleProgressJSX = `                        {/* Scroll Progress Indicator for Article */}
                        <div className="absolute top-0 left-0 w-full h-1 z-50 pointer-events-none opacity-80">
                          <div id="rss-scroll-progress-bar" className="h-full bg-accent transition-all duration-100 ease-out shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" style={{ width: '0%' }} />
                        </div>
                        <div className="flex items-center gap-1.5">`;
newContent = newContent.replace(articleProgressJSX, updatedArticleProgressJSX);

// 5. Add TOC (Table of Contents) feature state and extraction
newContent = newContent.replace(
  '  // AI brief summary states',
  `  // TOC state
  const [tableOfContents, setTableOfContents] = useState<{id: string, title: string, level: number}[]>([]);
  
  // AI brief summary states`
);

// Hook into full article load to extract TOC
const tocExtractionHook = `  useEffect(() => {
    if (fullArticle?.html) {
      extractTopics(fullArticle.html, selectedItem?.title || "");
    }
  }, [fullArticle, selectedItem]);`;
  
const updatedTocExtractionHook = `  useEffect(() => {
    if (fullArticle?.html) {
      extractTopics(fullArticle.html, selectedItem?.title || "");
      
      // Extract TOC
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullArticle.html, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4');
      const toc: {id: string, title: string, level: number}[] = [];
      
      headings.forEach((heading, index) => {
        const id = \`heading-\${index}\`;
        heading.id = id; // Add ID to the DOM
        
        let level = 2; // Default to H2 level indentation
        if (heading.tagName === 'H1') level = 1;
        if (heading.tagName === 'H3') level = 3;
        if (heading.tagName === 'H4') level = 4;
        
        const title = heading.textContent || "";
        if (title.trim().length > 0) {
          toc.push({ id, title, level });
        }
      });
      
      // We need to update the HTML to include the IDs we just added
      setFullArticle(prev => prev ? { ...prev, html: doc.body.innerHTML } : null);
      setTableOfContents(toc);
    } else {
      setTableOfContents([]);
    }
  }, [fullArticle, selectedItem]);`;
  
newContent = newContent.replace(tocExtractionHook, updatedTocExtractionHook);

fs.writeFileSync('src/components/RssReaderView.tsx', newContent);
console.log('Successfully patched RssReaderView.tsx');
