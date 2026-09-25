const fs = require('fs');
const content = fs.readFileSync('src/index.css', 'utf-8');

const newStyles = `
/* Elegant Image and Caption Presentation */
article.rss-reader-article img {
  border-radius: 0.75rem !important;
  box-shadow: 0 8px 25px -5px color-mix(in srgb, var(--text-main) 12%, transparent) !important;
  margin-left: auto !important;
  margin-right: auto !important;
  display: block !important;
  max-width: 100% !important;
  margin-top: 2.5em !important;
  margin-bottom: 1em !important;
}

article.rss-reader-article figure {
  margin: 2.5em auto !important;
  text-align: center !important;
}

article.rss-reader-article figure img {
  margin-top: 0 !important;
  margin-bottom: 1em !important;
}

article.rss-reader-article figcaption,
article.rss-reader-article .wp-caption-text,
article.rss-reader-article .caption {
  display: block !important;
  text-align: center !important;
  font-size: 0.85em !important;
  font-style: italic !important;
  color: var(--text-muted) !important;
  margin-top: 0.75em !important;
  margin-bottom: 2.5em !important;
  line-height: 1.5 !important;
  padding-inline: 2em !important;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 50%, transparent) !important;
  padding-bottom: 1.5em !important;
}

/* Sometimes captions are just small text after an image */
article.rss-reader-article img + em,
article.rss-reader-article img + i {
  display: block !important;
  text-align: center !important;
  font-size: 0.85em !important;
  color: var(--text-muted) !important;
  margin-top: -0.5em !important;
  margin-bottom: 2em !important;
  padding-bottom: 1em !important;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 50%, transparent) !important;
}
`;

fs.appendFileSync('src/index.css', newStyles);
console.log('Successfully appended styles to index.css');
