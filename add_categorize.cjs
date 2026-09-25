const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `
  app.post('/api/categorize-note', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text required' });
      
      const prompt = \`
Categorize the following text into exactly ONE of these specific UPSC syllabus subjects:
- Current Affairs (General)
- Polity & Governance
- Economy
- Science & Technology
- Environment & Ecology
- International Relations
- History & Culture

Respond with ONLY the exact category name from the list above. Do not include any other text, reasoning, or markdown.

Text to categorize:
"\${text.substring(0, 3000)}"
\`;
      
      const response = await generateGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let category = (response.text || 'Current Affairs (General)').trim();
      
      // Fallback valid check
      const valid = [
        "Current Affairs (General)",
        "Polity & Governance",
        "Economy",
        "Science & Technology",
        "Environment & Ecology",
        "International Relations",
        "History & Culture"
      ];
      
      if (!valid.includes(category)) {
         category = "Current Affairs (General)";
      }
      
      return res.json({ category });
    } catch (err: any) {
      console.error('Categorize error:', err);
      return res.json({ category: "Current Affairs (General)" });
    }
  });
`;

code = code.replace(/if \(process\.env\.NODE_ENV !== 'production'\)/, newEndpoint + "\n  if (process.env.NODE_ENV !== 'production')");
fs.writeFileSync('server.ts', code);
console.log('Added categorize endpoint');
