const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf-8');

const oldLogicRegex = /if \(dbMatches\.length === 0 \|\| isExplicitPodcastQuery\) \{[\s\S]*?\/\/ If we found direct database results/m;

const newLogic = `if (isExplicitPodcastQuery) {
        console.log(\`Querying public podcast directory fallback...\`);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const itunesRes = await fetch(\`https://itunes.apple.com/search?media=podcast&term=\${encodeURIComponent(query)}&limit=10\`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (itunesRes.ok) {
            const itunesData = await itunesRes.json();
            if (itunesData.results && itunesData.results.length > 0) {
              const podcastFeeds = itunesData.results
                .filter((r) => r.feedUrl)
                .map((r) => ({
                  name: r.collectionName + " (Podcast/Audio)",
                  url: r.feedUrl,
                  description: r.artistName || "Public audio feed",
                  relevance: "Discovered via open iTunes podcast directory."
                }));
              dbMatches = [...podcastFeeds, ...dbMatches];
            }
          }
        } catch (e) {
          console.error("iTunes open directory search failed:", e);
        }
      }

      // If we found direct database results`;

serverTs = serverTs.replace(oldLogicRegex, newLogic);
fs.writeFileSync('server.ts', serverTs);
console.log('Fixed server.ts podcast logic.');
