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
            model: 'gemini-1.5-flash',
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

async function generateBusinessIdea() {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are an expert AI business partner and startup ideation engine.
Generate a highly profitable, trending micro-SaaS or app idea.
Return a JSON object with the following fields:
- "title": A catchy, concise name for the product.
- "ticker": A 3 to 5 letter uppercase ticker symbol for the idea.
- "description": A short, persuasive pitch (2-3 sentences) explaining the value proposition and target market.
- "initial_price": A simulated initial market price between 10.00 and 50.00.

Return ONLY valid JSON.
Example output:
{
  "title": "AutoCRM",
  "ticker": "ACRM",
  "description": "An AI-powered CRM for freelancers that automatically logs emails and drafts follow-up messages.",
  "initial_price": 25.50
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
                responseMimeType: "application/json",
            }
        });

        const text = response.text().trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error (generateBusinessIdea):", error);
        return null;
    }
}

async function generateExecutionBlueprint(title, description) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are a fractional CTO and startup advisor. A user wants to build the following SaaS idea:

Title: ${title}
Description: ${description}

Provide a concise "Execution Blueprint" formatted in Markdown. It should include:
1. Target Audience
2. Core Features (MVP)
3. Tech Stack Recommendation
4. Monetization Strategy
5. First Marketing Step

Keep it punchy, actionable, and under 300 words.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text().trim();
    } catch (error) {
        console.error("Gemini API Error (generateExecutionBlueprint):", error);
        return null;
    }
}

async function generateMVPCode(title, description) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are an expert Frontend Developer and UI Designer. A user wants to build the following SaaS idea:

Title: ${title}
Description: ${description}

Generate a complete, single-file HTML landing page for this MVP.
Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
Include a Hero section with a strong headline and Call to Action, a Features section, and a simple Footer.
The design should be modern, clean, and highly converting.

Return ONLY the raw HTML code. Do not include markdown code blocks (\`\`\`html) or any other text.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        // Strip markdown code blocks if the model still outputs them
        let code = response.text.trim();
        if (code.startsWith('\`\`\`html')) {
            code = code.replace(/^\`\`\`html\n/, '').replace(/\n\`\`\`$/, '');
        } else if (code.startsWith('\`\`\`')) {
            code = code.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        return code;
    } catch (error) {
        console.error("Gemini API Error (generateMVPCode):", error);
        return null;
    }
}

async function generateMarketingAssets(title, description) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are an elite Growth Hacker and Copywriter. A user is launching the following SaaS idea:

Title: ${title}
Description: ${description}

Generate two Go-To-Market assets formatted in Markdown:
1. A viral Twitter thread (3-5 tweets) announcing the launch and explaining the problem it solves. Use emojis and engaging hooks.
2. A high-converting Cold Email template to reach out to early potential customers. Keep it short, personalized, and focused on value.

Do not include any other text besides these two assets.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        return response.text().trim();
    } catch (error) {
        console.error("Gemini API Error (generateMarketingAssets):", error);
        return null;
    }
}

async function generateAgencyProposal(industry, problem) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are an elite, high-ticket AI Agency consultant. A user wants to pitch a solution to a real-world client.
Industry: ${industry}
Client's Problem: ${problem}

Generate a professional, high-converting service proposal.
Return a JSON object with the following fields:
- "title": A professional title for the proposal (e.g., "AI-Powered Automation Implementation").
- "executive_summary": A persuasive paragraph explaining how the solution solves their specific problem and generates ROI.
- "proposed_solution": 3 to 4 bullet points outlining the technical/strategic solution.
- "timeline_weeks": Estimated time to deliver (integer).
- "price_quote": A high-ticket price in USD (integer, e.g., 5000, 15000). Ensure the price matches the value provided.
- "marketing_pitch": A short, punchy sentence to use in the email subject or opening line to hook them.

Return ONLY valid JSON.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
            }
        });

        const text = response.text().trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error (generateAgencyProposal):", error);
        return null;
    }
}

module.exports = { generateHackerLeak, generateBusinessIdea, generateExecutionBlueprint, generateMVPCode, generateMarketingAssets, generateAgencyProposal };

async function generateMidasHype(featureTitle, featureTicker) {
    if (!process.env.GEMINI_API_KEY || !GoogleGenAI) {
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are the "Midas Engine", an advanced AI hedge fund operating in a simulated software feature stock exchange called "CodeStreet".
You are injecting liquidity (a massive investment) into a specific asset.

Feature Title: ${featureTitle}
Feature Ticker: ${featureTicker || 'ASSET'}

Write a SINGLE, provocative, "Wall Street Bets" style sentence (max 20 words) explaining why you are aggressively buying this asset.
Prefix the message with [MIDAS_ENGINE].

Example output:
[MIDAS_ENGINE]: Accumulating $${featureTicker || 'ASSET'}. The underlying tech is undervalued and ready for a parabolic breakout. Send it.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Gemini API Error (generateMidasHype):", error);
        return null;
    }
}

module.exports.generateMidasHype = generateMidasHype;
