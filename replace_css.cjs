const fs = require('fs');
const content = fs.readFileSync('src/index.css', 'utf-8');

const lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('/* Highly Differentiated relative-sized headings inside the RSS Reader'));
const endIndex = lines.findIndex((line, i) => i > startIndex && line.includes('/* Ensure all children of headings inherit styles cleanly'));

if (startIndex !== -1 && endIndex !== -1) {
  const newStyles = `/* Elegant Magazine-style Headings for the RSS Reader */
article.rss-reader-article h1,
article.rss-reader-article .prose h1 {
  display: block !important;
  font-size: 2.2em !important;
  font-weight: 900 !important;
  line-height: 1.15 !important;
  letter-spacing: -0.03em !important;
  margin-top: 1.8em !important;
  margin-bottom: 0.8em !important;
  color: var(--text-main) !important;
  border-bottom: 2px solid color-mix(in srgb, var(--accent) 40%, transparent) !important;
  padding-bottom: 0.4em !important;
  font-family: var(--font-serif, "Playfair Display", "Lora", serif) !important;
}

article.rss-reader-article h2,
article.rss-reader-article .prose h2 {
  display: block !important;
  font-size: 1.6em !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.02em !important;
  margin-top: 1.6em !important;
  margin-bottom: 0.7em !important;
  color: var(--text-main) !important;
  border-left: 4px solid var(--accent) !important;
  padding-left: 0.8em !important;
}

article.rss-reader-article h3,
article.rss-reader-article .prose h3 {
  display: block !important;
  font-size: 1.3em !important;
  font-weight: 750 !important;
  line-height: 1.3 !important;
  margin-top: 1.5em !important;
  margin-bottom: 0.6em !important;
  color: var(--text-main) !important;
  border-bottom: 1px dashed color-mix(in srgb, var(--panel-border) 80%, transparent) !important;
  padding-bottom: 0.4em !important;
}

article.rss-reader-article h4,
article.rss-reader-article .prose h4 {
  display: inline-block !important;
  font-size: 1em !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  margin-top: 1.4em !important;
  margin-bottom: 0.5em !important;
  color: var(--text-main) !important;
  background-color: color-mix(in srgb, var(--accent) 10%, transparent) !important;
  padding: 0.2em 0.6em !important;
  border-radius: 0.25rem !important;
}

article.rss-reader-article h5,
article.rss-reader-article .prose h5,
article.rss-reader-article h6,
article.rss-reader-article .prose h6 {
  display: block !important;
  font-size: 0.95em !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  margin-top: 1.2em !important;
  margin-bottom: 0.4em !important;
  color: var(--text-muted) !important;
}
`;

  const newLines = [
    ...lines.slice(0, startIndex),
    newStyles,
    ...lines.slice(endIndex)
  ];

  fs.writeFileSync('src/index.css', newLines.join('\n'));
  console.log('Successfully updated index.css');
} else {
  console.log('Could not find markers', startIndex, endIndex);
}
