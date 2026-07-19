import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file to get the API key
const envPath = path.resolve(__dirname, '../../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_TAVILY_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error("API Key not found in .env");
  process.exit(1);
}

async function testTavily() {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: "Mars",
        search_depth: 'basic',
        max_results: 10,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, await response.text());
      return;
    }

    const data = await response.json();
    console.log("Success! Data received.");
    console.log("Answer:", data.answer);
    console.log("Results count:", data.results?.length);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testTavily();
