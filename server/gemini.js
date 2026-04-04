let GoogleGenAI = null;
try {
  // Use dynamic import or conditionally require to avoid breaking jest
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  // ignore
}

async function generateHackerLeak(featureTitle, featureTicker) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are a dark web market intel generator for a simulated software feature stock exchange called "CodeStreet".
Users can invest in software features (assets).
You are intercepting communication or generating leaked insights about a feature.

Feature Title: ${featureTitle}
Feature Ticker: ${featureTicker || 'ASSET'}

Write a SINGLE, punchy, slightly cryptic sentence (max 20 words) that sounds like leaked hacker intel or insider trading info about this feature.
Prefix the message with a tag like [DECRYPTED_COMMS], [LEAKED_SLACK], [INSIDER_DUMP], [REPO_SCRAPE], [MARKET_MAKER_LOG], or [CEO_EMAIL_INTERCEPT].
It should hint at either a price pump (positive) or a dump (negative).

Example output:
[DECRYPTED_COMMS]: Whale wallets accumulating $${featureTicker || 'ASSET'} in dark pools. Upward volatility expected.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
}

module.exports = { generateHackerLeak };
