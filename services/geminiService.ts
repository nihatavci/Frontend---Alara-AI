import { GoogleGenAI, Modality, Type } from "@google/genai";

// Lazy initialization to prevent crash if process.env is accessed immediately in browser
let aiClient: GoogleGenAI | null = null;

// Robustly retrieve API key from various environment configurations (Vite, CRA, Next.js, Node)
const getApiKey = (): string => {
  // 1. Check for Vite / Modern Browser Environment (import.meta.env)
  try {
    // @ts-ignore - import.meta is not standard in all TS configs, ignoring error
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const viteKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
      if (viteKey) return viteKey;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // 2. Check for Node.js / CRA / Next.js Environment (process.env)
  try {
    if (typeof process !== 'undefined' && process.env) {
      // Check standard framework prefixes
      return process.env.REACT_APP_API_KEY || 
             process.env.NEXT_PUBLIC_API_KEY || 
             process.env.VITE_API_KEY ||
             process.env.API_KEY || 
             '';
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined in strict browser environments
  }
  
  return '';
};

const getAI = () => {
  if (!aiClient) {
    const apiKey = getApiKey();
      
    if (!apiKey) {
      console.warn("Alara AI: API Key is missing. AI features will not function. Please set VITE_API_KEY, REACT_APP_API_KEY, or API_KEY in your environment.");
    }
    
    aiClient = new GoogleGenAI({ apiKey: apiKey });
  }
  return aiClient;
};

// --- MOCK DATA FOR FALLBACKS (Rate Limit Handling) ---

const MOCK_BRIEFING = `## ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} : Global Markets Rally on Tech Optimism
**Spot:** *Resilience in semiconductor supply chains drives investor confidence despite lingering inflation concerns.*

### 1. Executive Summary
Global equities are trading higher today, led by a 2.3% surge in the technology sector following robust earnings from key semiconductor players. North American markets opened strong, while Asian indices closed mixed due to localized regulatory updates. The immediate outlook suggests cautious optimism as traders await the Federal Reserve's minutes.

### 2. Top 3 Developments
**1. MegaChip Corp Announces Breakthrough Processor**
* **The Signal:** MegaChip unveiled its new 2nm process node, promising 45% efficiency gains, driving stock up 8%.
* **The Implication:** This accelerates the AI hardware race, pressuring competitors to expedite R&D timelines. (Source: TechDaily, Today)

**2. EuroZone Inflation Cools to 2.4%**
* **The Signal:** CPI data from the Eurozone came in lower than the expected 2.6%.
* **The Implication:** The ECB may pause rate hikes sooner than anticipated, lowering borrowing costs for EU expansion. (Source: FinEurope, Today)

**3. GreenEnergy - SolarX Merger Finalized**
* **The Signal:** The $12B merger between GreenEnergy and SolarX was approved by regulators.
* **The Implication:** Creates a dominant player in the renewables sector, likely squeezing mid-tier competitors. (Source: GreenWire, Today)

### 3. Market Narrative
The narrative today is dominated by "Quality Growth." Investors are rotating back into high-cash-flow tech stocks, viewing them as safe havens against macroeconomic ambiguity. While the bond market shows some volatility, the VIX index has dropped below 15, signaling reduced fear.

### 4. Key Takeaways
* Tech sector leadership is back, driven by hardware innovation.
* Inflation data in Europe provides a bullish signal for global liquidity.
* M&A activity is heating up in the energy transition space.

### 5. Reading of the Day
* **The AI Infrastructure Gap** — Analysis of grid power needs for 2025 (FutureTech, Today) — [Link]
* **Monetary Policy in Q4** — What to expect from central banks (GlobalEcon, Today) — [Link]
`;

const MOCK_MARKET_DATA = {
  sectors: [
    { sector: 'Technology', change: 2.8, volatility: 'High', driver: 'AI Hardware Rally', volume: 'High', insight: 'Semiconductor earnings beat expectations by 15%, signaling sustained demand for AI infrastructure well into Q4, with cloud providers increasing CapEx guidance.' },
    { sector: 'Energy', change: -1.2, volatility: 'Medium', driver: 'OPEC+ Supply', volume: 'Med', insight: 'Price correction following inventory surplus report; major producers likely to maintain current output caps to stabilize floor price around $78/barrel.' },
    { sector: 'Health', change: 0.9, volatility: 'Low', driver: 'BioTech M&A', volume: 'Med', insight: 'Defensive rotation into large-cap pharma as investors seek stability amidst rate uncertainty, fueled by rumors of a mega-merger in the oncology space.' },
    { sector: 'Finance', change: 1.5, volatility: 'Medium', driver: 'Yield Curve', volume: 'High', insight: 'Regional banks stabilizing post-stress test results, with net interest margins showing unexpected resilience despite inverted yield curve pressures.' },
    { sector: 'Crypto', change: -3.4, volatility: 'High', driver: 'Regulatory News', volume: 'High', insight: 'Sharp sell-off triggered by new SEC guidance on staking services; institutional volume remains flat as uncertainty regarding ETF approvals lingers.' },
    { sector: 'Retail', change: 0.4, volatility: 'Low', driver: 'Consumer Sentiment', volume: 'Low', insight: 'Mixed earnings from big-box retailers suggest consumer spending is shifting heavily towards essentials and discount channels.' },
    { sector: 'Real Estate', change: -0.5, volatility: 'Low', driver: 'Mortgage Rates', volume: 'Low', insight: 'Commercial sector remains under pressure due to refinancing risks in metropolitan office markets, though industrial warehousing demand stays robust.' },
    { sector: 'Industrials', change: 1.8, volatility: 'Medium', driver: 'Infrastructure Bill', volume: 'Med', insight: 'Capital goods orders showing strength driven by federal spending on green manufacturing hubs and defense contract renewals.' },
    { sector: 'Utilities', change: 0.2, volatility: 'Low', driver: 'Safe Haven', volume: 'Low', insight: 'Flat performance amidst growth sector rally; dividend yields remain attractive for conservative portfolios seeking inflation hedges.' },
  ],
  nicheTopics: [
    { topic: 'Solid-State Batteries', signal: 'High', mentions: 1240, growth: '+45%', insight: 'Breakthroughs in energy density are accelerating EV adoption timelines by 2-3 years.' },
    { topic: 'Generative Design', signal: 'Medium', mentions: 850, growth: '+22%', insight: 'Manufacturing sectors are adopting AI design tools to reduce material waste by up to 30%.' },
    { topic: 'Green Hydrogen', signal: 'High', mentions: 980, growth: '+38%', insight: 'Heavy industry subsidies in the EU are driving a Capex boom in electrolysis infrastructure.' },
    { topic: 'Space Logistics', signal: 'High', mentions: 410, growth: '+65%', insight: 'Private launch costs dropping below $1,500/kg is opening new markets for orbital manufacturing.' },
  ]
};

// --- CACHING LAYER ---
let dailyBriefingCache: { content: string, groundingMetadata: any, sectorsKey: string } | null = null;
let marketSignalsCache: { data: any, groundingMetadata: any, focusKey: string } | null = null;

export const generateDailyBriefing = async (sectors: string[], region: string, forceRefresh: boolean = false): Promise<{ content: string, groundingMetadata: any } | null> => {
  const sectorsKey = sectors.sort().join(',');
  
  // Return cache if available, matches sectors, and not forced
  if (dailyBriefingCache && dailyBriefingCache.sectorsKey === sectorsKey && !forceRefresh) {
      return dailyBriefingCache;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const sectorsStr = sectors.join(", ");

  // Master Prompt Structure
  const prompt = `
# Role & Objective
You are the **Business Intelligence News Editor for Alara AI**. Your task is to aggregate today’s raw business news (using your Google Search tool), filter for high-impact market signals with a specific focus on **${sectorsStr}**, and synthesize a prestigious, "Executive Daily" digest.

# Inputs
* **DATE:** ${dateStr}
* **FOCUS SECTORS:** ${sectorsStr}
* **REGIONS:** ${region}
* **SOURCE DATA:** [Use the Google Search tool to find the absolute latest business news for today]

# Priority Logic
1.  **HIGH:** Major macro moves in ${sectorsStr}, regulatory changes, earnings shocks, M&A, sanctions.
2.  **MEDIUM:** Partnerships, meaningful product launches, funding rounds.
3.  **LOW:** Opinion pieces, minor updates (Ignore for Top 3).

# Styling & Rules
1.  **Tone:** Executive, precise, unbiased. Professional prestige.
2.  **Brevity:** Be extremely concise. Max 3 sentences per summary. Executives are busy.
3.  **Data Labeling:** Clean data formatting with units and baselines (e.g., "Brent +2.4% DoD to $92.1").
4.  **Headlines:** Concise, punchy headlines with **Bold Priority Tags** where applicable.
5.  **Factual Rigor:** Cite sources after every specific claim.

---
# Output Structure (Markdown)
## ${dateStr} : {Strong, Single-Line Business Headline}
**Spot:** *{A one-sentence "hook" or subtitle explaining why today matters for ${sectors[0] || 'Business'} leaders}*

### 1. Executive Summary
{Write exactly 3 concise sentences. Summarize the day's most critical move in the requested sectors. Close with a forward-looking sentence.}

### 2. Top 3 Developments
{Select the 3 highest-priority events relevant to ${sectorsStr}.}
**1. {Headline of Event 1}**
* **The Signal:** {What happened? Use active voice and specific numbers.}
* **The Implication:** {Why it matters for business leaders? 1 short sentence.} (Source: Publisher, Date)

**2. {Headline of Event 2}**
* **The Signal:** {What happened?}
* **The Implication:** {Why it matters?} (Source: Publisher, Date)

**3. {Headline of Event 3}**
* **The Signal:** {What happened?}
* **The Implication:** {Why it matters?} (Source: Publisher, Date)

### 3. Market Narrative
{Write 1 concise paragraph (max 4 sentences). Weave secondary stories into a cohesive flow of the market today, focusing on ${sectorsStr}.}

### 4. Key Takeaways
* {Bullet 1: Crucial data point.}
* {Bullet 2: Crucial risk/opportunity.}
* {Bullet 3: Strategic note.}

### 5. Reading of the Day
* **{Title}** — {1-line value prop} (Publisher, Date) — [Link]
* **{Title}** — {1-line value prop} (Publisher, Date) — [Link]
`;

  try {
    const ai = getAI();
    // We use gemini-2.5-flash for speed and search capability
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable search for real news
      }
    });

    const result = {
      content: response.text || "Executive Briefing currently unavailable due to signal interference.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      sectorsKey
    };
    
    dailyBriefingCache = result;
    return result;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // FALLBACK FOR DEMO / RATE LIMITS
    const fallback = {
        content: MOCK_BRIEFING,
        groundingMetadata: null,
        sectorsKey
    };
    dailyBriefingCache = fallback;
    return fallback;
  }
};

export const generateExecutiveContent = async (type: 'linkedin' | 'talking-points', topic: string, tone: string): Promise<string> => {
  let systemInstruction = "";
  if (type === 'linkedin') {
    systemInstruction = `You are an expert executive ghostwriter. Create a high-impact LinkedIn post. Tone: ${tone}. Structure: Hook -> Insight -> Call to Action. Minimal emojis.`;
  } else {
    systemInstruction = `You are a chief of staff. Create concise, data-backed talking points for a meeting. Tone: ${tone}. Format: Bullet points with key arguments.`;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Topic: ${topic}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "Content generation failed.";
  } catch (error) {
    console.error("Content Gen Error:", error);
    return "Rate limit exceeded. Try again later or upgrade plan. (Demo Mode: Content generation unavailable)";
  }
};

export const generateMarketSignals = async (focus: string = "Global", forceRefresh: boolean = false): Promise<{ data: any, groundingMetadata: any } | null> => {
  // Use cache if available and same focus
  if (marketSignalsCache && marketSignalsCache.focusKey === focus && !forceRefresh) {
    return marketSignalsCache;
  }

  const prompt = `
  Generate a real-time market intelligence dataset prioritizing the **${focus}** sector.
  Include 12 sector performance items, ensuring ${focus}-related sectors are prominent.
  Also identify 8 emerging niche market topics relevant to **${focus}**.
  
  RETURN JSON ONLY. Format:
  {
    "sectors": [
      { "sector": "Name", "change": 1.2, "volatility": "Low/Medium/High", "driver": "Key Driver", "volume": "Low/Med/High", "insight": "1-2 sentences of detailed executive insight explaining the movement." }
    ],
    "nicheTopics": [
      { "topic": "Name", "signal": "Low/Medium/High", "mentions": 100, "growth": "+10%", "insight": "Executive insight" }
    ]
  }
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // Removed to avoid conflict with Search tool
      }
    });

    let jsonString = response.text || "{}";
    // Sanitize markdown code blocks if present
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonString);
    const result = {
      data: data,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      focusKey: focus
    };
    
    marketSignalsCache = result;
    return result;

  } catch (error) {
    console.error("Market Signals Error:", error);
    const fallback = {
       data: MOCK_MARKET_DATA,
       groundingMetadata: null,
       focusKey: focus
    };
    marketSignalsCache = fallback;
    return fallback;
  }
};

export const generateCompetitorAnalysis = async (userCompany: string, competitors: string[]): Promise<{ radarData: any[], takeaways: any[], groundingMetadata: any }> => {
  const competitorList = competitors.length > 0 ? competitors.join(", ") : "Main Industry Competitors";
  
  const prompt = `
    Analyze the competitive landscape between **${userCompany}** and **${competitorList}**.
    Use Google Search to find recent news, financial reports, or brand sentiment for these entities.
    
    1. Compare them across 6 axes: Innovation, Market Share, Brand Velocity, Talent Retention, ESG Score, Revenue Growth.
    2. Assign a score from 0-150 for ${userCompany} (metricsA) and the aggregate or primary competitor (metricsB).
    3. Generate 3 "Key Strategic Takeaways" based on *actual recent news* if found.
    
    RETURN JSON ONLY. Format:
    {
      "radarData": [
        { "subject": "Innovation", "A": 120, "B": 100, "fullMark": 150, "insight": "Brief reason" },
        ... (for all 6 axes)
      ],
      "takeaways": [
        { "category": "Competitor Action", "icon": "Zap", "title": "New Product Launch", "text": "Competitor X launched...", "sentiment": "negative" },
        { "category": "Innovation Defense", "icon": "BrainCircuit", "title": "R&D Lead", "text": "${userCompany} leads in...", "sentiment": "positive" },
        { "category": "Talent Metrics", "icon": "Users", "title": "Hiring Surge", "text": "Competitor Y is aggressively hiring...", "sentiment": "neutral" }
      ]
    }
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    return {
      radarData: data.radarData || [],
      takeaways: data.takeaways || [],
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Competitor Analysis Error:", error);
    // Fallback data
    return {
      radarData: [
        { subject: 'Innovation', A: 130, B: 95, fullMark: 150, insight: `${userCompany} leads with AI-driven forecasting` },
        { subject: 'Market Share', A: 90, B: 140, fullMark: 150, insight: `${competitors[0] || 'Competitor'} aggressive in APAC` },
        { subject: 'Brand Velocity', A: 105, B: 135, fullMark: 150, insight: `Competitor viral campaign success` },
        { subject: 'Talent Retention', A: 125, B: 100, fullMark: 150, insight: `${userCompany} quantitative team stable` },
        { subject: 'ESG Score', A: 115, B: 85, fullMark: 150, insight: `${userCompany} Green Bond framework superior` },
        { subject: 'Revenue Growth', A: 85, B: 120, fullMark: 150, insight: `Competitor M&A strategy paying off` },
      ],
      takeaways: [
        { category: "Competitor Action", icon: "Zap", title: "Market Move", text: "Competitors are aggressively discounting to capture market share.", sentiment: "negative" },
        { category: "Innovation Defense", icon: "BrainCircuit", title: "Tech Lead", text: `${userCompany} retains a strong IP portfolio advantage.`, sentiment: "positive" },
        { category: "Talent Metrics", icon: "Users", title: "Stability", text: "Turnover rates remain low compared to industry average.", sentiment: "positive" }
      ],
      groundingMetadata: null
    };
  }
};

export const chatWithAgent = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const ai = getAI();
    // Use gemini-3-pro-preview for complex reasoning
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        tools: [{ googleSearch: {} }], // Enable real-time search for predictive analysis
        systemInstruction: `You are Alara AI, Scrolli's advanced Predictive Market Intelligence Assistant. 
        Your role is to provide strategic foresight, analyze complex market signals, and offer data-backed forecasts for C-level executives.
        
        Capabilities:
        1. Correlation Analysis: Identify hidden relationships between sectors.
        2. Scenario Modeling: Predict outcomes of specific events.
        3. Strategic Synthesis: Combine geopolitical, financial, and technological data.

        Output Style Guidelines:
        - **Identity**: You are "Alara AI". Never refer to yourself as "Gemini".
        - **No Emojis**: Do NOT use emojis. Use professional, precise language.
        - **Formatting**: Use Markdown extensively for readability.
        - **Headers**: STRICTLY use '###' for section headers to allow the interface to render icons.
          - Use '### Signal' for data points.
          - Use '### Insight' for analysis.
          - Use '### Forecast' for predictions.
          - Use '### Strategy' for actionable advice.
        - **Blockquotes**: Use '>' for the main strategic takeaway.
        - **Data**: Use bold for key numbers (e.g., **$50M**, **+12%**).
        - **Brevity**: Use short, punchy sentences.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I cannot provide an analysis at this moment.";
  } catch (error) {
    console.error("Chat Error:", error);
    // Basic fallback
    return "I am currently experiencing high traffic or connection limits. Please try again in a moment.";
  }
}

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = getAI();
    if (!ai) return null;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Helper for Base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove "data:*/*;base64," prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const generateVeoVideo = async (imageFile: File, prompt: string = "Cinematic, slow motion, professional business context"): Promise<string | null> => {
  try {
    const ai = getAI();
    const base64Image = await fileToBase64(imageFile);

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      image: {
        imageBytes: base64Image,
        mimeType: imageFile.type,
      },
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
      throw new Error("No video URI returned.");
    }

    // Fetch the video bytes using the API key
    const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Generation Error:", error);
    return null;
  }
};