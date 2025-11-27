
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { Send, Sparkles, ArrowUpRight, ArrowDownRight, MoreHorizontal, Globe, Activity, RefreshCw, TrendingUp, ChevronRight, Info, BarChart3, Zap, AlertTriangle, BrainCircuit, Target, Lightbulb, Compass, FileText, TrendingDown, Download, Bookmark, Users } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { HeatmapItem, NicheTopic, ChatMessage, MarketPriority } from '../../types';
import { chatWithAgent, generateMarketSignals, generateCompetitorAnalysis } from '../../services/geminiService';
import { jsPDF } from 'jspdf';

interface MarketIntelligenceProps {
  view: string;
  isDarkMode: boolean;
  marketPriority: MarketPriority;
  competitors: string[];
  userCompany: string;
}

// Extended Interface for local state to include insights
interface EnrichedHeatmapItem extends HeatmapItem {
  driver: string;
  volume: string;
  insight: string;
}

const SUGGESTED_PROMPTS = [
  "Forecast the impact of rising oil prices on the Logistics sector.",
  "Analyze correlations between US Tech stocks and Asian markets.",
  "What are the projected risks for AI regulation in the EU?"
];

const INSIGHTS_DATA = [
    { 
      id: 1,
      title: "Battery Supply Chain Resilience", 
      date: "Today", 
      summary: "Diversification of lithium sourcing is creating new mid-stream opportunities in South America.",
      details: "Recent policy shifts in Chile and Argentina are encouraging direct foreign investment in local processing capabilities. This moves the value chain closer to the source, reducing logistics costs by approximately 15% and mitigating geopolitical risks associated with current dominant processing hubs. Key players like Albemarle and SQM are already expanding capacity."
    },
    { 
      id: 2,
      title: "The AI Design Revolution", 
      date: "Yesterday", 
      summary: "Generative manufacturing tools are reducing prototyping costs by 40% in aerospace sectors.",
      details: "Aerospace giants are leveraging generative design algorithms to create lighter, stronger components that were previously impossible to manufacture. This shift is not just about weight reduction; it's compressing the R&D cycle from months to weeks. The integration of AI with additive manufacturing is the primary driver, with Autodesk and Ansys leading the software integration."
    },
    { 
      id: 3,
      title: "Hydrogen Infrastructure CapEx", 
      date: "2 days ago", 
      summary: "EU subsidies are accelerating the deployment of green hydrogen hubs faster than projected.",
      details: "The European Hydrogen Bank's latest auction results indicate a clearing price lower than expected, stimulating immediate CapEx deployment. Major utilities are pivoting strategy to secure early-mover advantage in the North Sea corridor. This creates a downstream effect on electrolyzer manufacturers, who are seeing order books fill up through 2026."
    }
];

const Sparkline = ({ color, data }: { color: string, data: number[] }) => (
  <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none" className="opacity-80">
    <path
      d={`M0 ${30 - data[0]} L20 ${30 - data[1]} L40 ${30 - data[2]} L60 ${30 - data[3]} L80 ${30 - data[4]} L100 ${30 - data[5]}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d={`M0 ${30 - data[0]} L20 ${30 - data[1]} L40 ${30 - data[2]} L60 ${30 - data[3]} L80 ${30 - data[4]} L100 ${30 - data[5]} V 30 H 0 Z`}
      fill={color}
      fillOpacity="0.1"
    />
  </svg>
);

const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ view, isDarkMode, marketPriority, competitors, userCompany }) => {
  const [sectors, setSectors] = useState<EnrichedHeatmapItem[]>([]);
  const [nicheTopics, setNicheTopics] = useState<NicheTopic[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState<number | null>(null);

  // Radar State
  const [radarData, setRadarData] = useState<any[]>([]);
  const [radarTakeaways, setRadarTakeaways] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);

  // Static Data for Instant Load & Premium UI
  useEffect(() => {
    // Immediate population with premium mock data
    setSectors([
        { sector: 'Technology', change: 2.8, volatility: 'High', driver: 'AI Hardware Rally', volume: 'High', insight: 'Semiconductor earnings beat expectations by 15%, signaling sustained demand for AI infrastructure well into Q4, with cloud providers increasing CapEx guidance.' },
        { sector: 'Energy', change: -1.2, volatility: 'Medium', driver: 'OPEC+ Supply', volume: 'Med', insight: 'Price correction following inventory surplus report; major producers likely to maintain current output caps to stabilize floor price around $78/barrel.' },
        { sector: 'Health', change: 0.9, volatility: 'Low', driver: 'BioTech M&A', volume: 'Med', insight: 'Defensive rotation into large-cap pharma as investors seek stability amidst rate uncertainty, fueled by rumors of a mega-merger in the oncology space.' },
        { sector: 'Finance', change: 1.5, volatility: 'Medium', driver: 'Yield Curve', volume: 'High', insight: 'Regional banks stabilizing post-stress test results, with net interest margins showing unexpected resilience despite inverted yield curve pressures.' },
        { sector: 'Crypto', change: -3.4, volatility: 'High', driver: 'Regulatory News', volume: 'High', insight: 'Sharp sell-off triggered by new SEC guidance on staking services; institutional volume remains flat as uncertainty regarding ETF approvals lingers.' },
        { sector: 'Retail', change: 0.4, volatility: 'Low', driver: 'Consumer Sentiment', volume: 'Low', insight: 'Mixed earnings from big-box retailers suggest consumer spending is shifting heavily towards essentials and discount channels.' },
        { sector: 'Real Estate', change: -0.5, volatility: 'Low', driver: 'Mortgage Rates', volume: 'Low', insight: 'Commercial sector remains under pressure due to refinancing risks in metropolitan office markets, though industrial warehousing demand stays robust.' },
        { sector: 'Industrials', change: 1.8, volatility: 'Medium', driver: 'Infrastructure Bill', volume: 'Med', insight: 'Capital goods orders showing strength driven by federal spending on green manufacturing hubs and defense contract renewals.' },
        { sector: 'Utilities', change: 0.2, volatility: 'Low', driver: 'Safe Haven', volume: 'Low', insight: 'Flat performance amidst growth sector rally; dividend yields remain attractive for conservative portfolios seeking inflation hedges.' },
        { sector: 'Materials', change: 1.1, volatility: 'Medium', driver: 'Commodity Prices', volume: 'Med', insight: 'Copper demand rising on EV production targets; lithium markets showing signs of bottoming out after last quarter\'s oversold conditions.' },
        { sector: 'Cons. Disc.', change: 2.1, volatility: 'High', driver: 'Luxury Demand', volume: 'High', insight: 'Asian markets driving luxury rebound, specifically in high-end fashion and automotive segments, offsetting softer North American sales.' },
        { sector: 'Telecom', change: -0.8, volatility: 'Low', driver: '5G CapEx', volume: 'Low', insight: 'Slowing subscriber growth in EU markets prompting CapEx cuts for major carriers, impacting equipment suppliers negatively.' },
    ]);
    setNicheTopics([
        { topic: 'Solid-State Batteries', signal: 'High', mentions: 1240, growth: '+45%', insight: 'Breakthroughs in energy density are accelerating EV adoption timelines by 2-3 years, prompting major automotive OEMs to re-evaluate supply chain contracts.' },
        { topic: 'Generative Design', signal: 'Medium', mentions: 850, growth: '+22%', insight: 'Manufacturing sectors are adopting AI design tools to reduce material waste by up to 30%, driving efficiency in aerospace and automotive fabrication.' },
        { topic: 'Green Hydrogen', signal: 'High', mentions: 980, growth: '+38%', insight: 'Heavy industry subsidies in the EU are driving a Capex boom in electrolysis infrastructure, creating new opportunities for specialized engineering firms.' },
        { topic: 'Quantum Encryption', signal: 'Low', mentions: 320, growth: '+12%', insight: 'Early-stage pilots in banking sector suggest a coming shift in cybersecurity standards, though widespread commercial viability remains 5+ years out.' },
        { topic: 'Neuromorphic Chips', signal: 'Medium', mentions: 540, growth: '+28%', insight: 'Edge AI applications are demanding lower latency and power consumption, pushing neuromorphic architecture from research labs to specialized use cases.' },
        { topic: 'Space Logistics', signal: 'High', mentions: 410, growth: '+65%', insight: 'Private launch costs dropping below $1,500/kg is opening new markets for orbital manufacturing and satellite servicing, attracting significant VC interest.' },
        { topic: 'Synthetic Biology', signal: 'Medium', mentions: 670, growth: '+31%', insight: 'Precision fermentation technologies are reaching price parity with traditional agriculture in specific high-value protein segments.' },
        { topic: 'Carbon Capture', signal: 'High', mentions: 1100, growth: '+42%', insight: 'Direct Air Capture (DAC) facilities are securing long-term offtake agreements with major tech firms, validating the business model for scalable carbon removal.' },
    ]);
    
    // Initial Radar Mock
    const primaryCompetitor = competitors[0] || "Competitor X";
    setRadarData([
        { subject: 'Innovation', A: 130, B: 95, fullMark: 150, insight: `${userCompany} leads with AI-driven forecasting` },
        { subject: 'Market Share', A: 90, B: 140, fullMark: 150, insight: `${primaryCompetitor} aggressive in APAC` },
        { subject: 'Brand Velocity', A: 105, B: 135, fullMark: 150, insight: `${primaryCompetitor} viral campaign success` },
        { subject: 'Talent Retention', A: 125, B: 100, fullMark: 150, insight: `${userCompany} quantitative team stable` },
        { subject: 'ESG Score', A: 115, B: 85, fullMark: 150, insight: `${userCompany} Green Bond framework superior` },
        { subject: 'Revenue Growth', A: 85, B: 120, fullMark: 150, insight: `${primaryCompetitor} M&A strategy paying off` },
    ]);
    
    setRadarTakeaways([
        { category: "Competitor Action", icon: "Zap", title: "Market Move", text: `${primaryCompetitor} is aggressively discounting to capture market share.`, sentiment: "negative" },
        { category: "Innovation Defense", icon: "BrainCircuit", title: "Tech Lead", text: `${userCompany} retains a strong IP portfolio advantage in core tech.`, sentiment: "positive" },
        { category: "Talent Metrics", icon: "Users", title: "Stability", text: "Turnover rates remain low compared to industry average.", sentiment: "positive" }
    ]);

    // If view changes or priority changes, try to fetch new data if cache isn't valid
    if (view === 'market_heatmap' || view === 'market_niche') {
       handleRefresh();
    }
    if (view === 'market_radar') {
       handleRadarRefresh();
    }
  }, [marketPriority, view, userCompany, competitors]); // Re-run if user changes company or competitors

  const handleRefresh = async () => {
    setLoading(true);
    const result = await generateMarketSignals(marketPriority);
    if (result && result.data && result.data.sectors) {
      // Map API result to Enriched format
      const enrichedSectors = result.data.sectors.map((s: any) => ({
          ...s,
          // Correctly map API response fields to local state, falling back to logical defaults only if missing
          driver: s.driver || 'Market Shift',
          volume: s.volume || 'Medium',
          insight: s.insight || `Recent analysis of the ${s.sector} sector indicates volatility driven by global economic shifts and ${marketPriority} trends.`
      }));
      setSectors(enrichedSectors);
      
      if (result.data.nicheTopics) {
        setNicheTopics(result.data.nicheTopics);
      }
      setGroundingMetadata(result.groundingMetadata);
    }
    setLoading(false);
  };

  const handleRadarRefresh = async () => {
      setRadarLoading(true);
      const result = await generateCompetitorAnalysis(userCompany, competitors);
      if (result) {
          if (result.radarData.length > 0) setRadarData(result.radarData);
          if (result.takeaways.length > 0) setRadarTakeaways(result.takeaways);
          if (result.groundingMetadata) setGroundingMetadata(result.groundingMetadata);
      }
      setRadarLoading(false);
  }

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        id: '1', 
        role: 'ai', 
        text: `Hello, I'm Alara AI. I've calibrated your intelligence feed for **${marketPriority}**. How can I assist you?`, 
        timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAgent(history, userMsg.text);
    
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const toggleInsight = (id: number) => {
    setExpandedInsightId(prev => prev === id ? null : id);
  };

  // PDF Download Handler for Niche Insights
  const handleDownloadNichePDF = () => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    // --- Styles ---
    const colors = {
        navy: [0, 32, 96],
        blue: [0, 90, 180],
        text: [50, 50, 50],
        lightGray: [240, 240, 240]
    };

    // --- Header ---
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("EMERGING-NICHE INSIGHTS", margin, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`ALARA AI MARKET INTELLIGENCE - ${marketPriority.toUpperCase()} PRIORITY`, margin, 30);
    
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, 20, { align: 'right' });

    let yPos = 55;

    INSIGHTS_DATA.forEach((insight, index) => {
        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
        doc.text(`${index + 1}. ${insight.title}`, margin, yPos);
        yPos += 7;

        // Date
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Detected: ${insight.date}`, margin, yPos);
        yPos += 8;

        // Summary
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        const summaryText = doc.splitTextToSize(insight.summary, pageWidth - (margin * 2));
        doc.text(summaryText, margin, yPos);
        yPos += (summaryText.length * 5) + 4;

        // Details Background
        doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
        // Estimate height
        doc.setFont("helvetica", "normal");
        const detailText = doc.splitTextToSize(insight.details, pageWidth - (margin * 2) - 10);
        const boxHeight = (detailText.length * 5) + 10;
        
        doc.rect(margin, yPos, pageWidth - (margin * 2), boxHeight, 'F');
        
        // Details Text
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(detailText, margin + 5, yPos + 7);
        
        yPos += boxHeight + 15;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Confidential - Generated by Alara AI", margin, doc.internal.pageSize.getHeight() - 10);

    doc.save(`Alara_Niche_Insights_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- Sub-Components ---

  const HeatmapComponent = ({ limit }: { limit?: number }) => (
    <div className={`grid ${limit ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
      {(limit ? sectors.slice(0, limit) : sectors).map((item, idx) => {
        const isPositive = item.change >= 0;
        const colorClass = isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
        const bgClass = isPositive ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : 'bg-red-500/5 dark:bg-red-500/10';
        const borderClass = isPositive ? 'border-emerald-500/20' : 'border-red-500/20';

        return (
            <div key={idx} className="relative group perspective-1000">
                <GlassCard className={`relative transition-all duration-300 group-hover:-translate-y-1 border ${borderClass} h-32 overflow-hidden`} noPadding>
                    {/* Background Tint */}
                    <div className={`absolute inset-0 ${bgClass} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    
                    {/* Driver Reveal Overlay */}
                    <div className="absolute inset-0 bg-black/70 dark:bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 p-4 text-center backdrop-blur-[2px]">
                        <Zap className="w-4 h-4 text-yellow-400 mb-1.5" />
                        <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-1">Key Driver</span>
                        <span className="text-sm font-bold text-white leading-tight">{item.driver}</span>
                    </div>

                    {/* Content Layer */}
                    <div className="relative p-5 h-full flex flex-col justify-between z-10 group-hover:opacity-20 transition-opacity duration-300">
                        <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide truncate pr-2">{item.sector}</span>
                            {isPositive ? <ArrowUpRight className={`w-4 h-4 ${colorClass}`} /> : <ArrowDownRight className={`w-4 h-4 ${colorClass}`} />}
                        </div>
                        
                        <div className="flex items-end justify-between">
                            <div className={`text-3xl font-bold tracking-tight ${colorClass}`}>
                                {isPositive ? '+' : ''}{item.change}%
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400 uppercase">Vol</span>
                                <span className={`text-xs font-bold ${item.volatility === 'High' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{item.volatility}</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
      })}
    </div>
  );

  const AnalystNotesComponent = ({ limit }: { limit?: number }) => {
      const itemsToDisplay = limit ? sectors.slice(0, limit) : sectors;
      return (
          <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="bg-blue-500/10 p-1.5 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Analyst Note Collection</h3>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsToDisplay.map((item, idx) => {
                      const isPositive = item.change >= 0;
                      return (
                          <GlassCard key={idx} className="group hover:border-blue-500/30 transition-all p-4 flex flex-col gap-3" noPadding>
                              <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="font-bold text-gray-900 dark:text-white text-sm">{item.sector}</span>
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                              {isPositive ? '+' : ''}{item.change}%
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                          <span className="uppercase tracking-wider">Driver:</span>
                                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.driver}</span>
                                      </div>
                                  </div>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.volatility === 'High' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                                      {item.volatility === 'High' ? <Activity className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                  </div>
                              </div>
                              
                              <div className="flex-1">
                                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                      {item.insight}
                                  </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 mt-auto">
                                   <div className="flex items-center gap-3">
                                       <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">{item.volume} Volume</span>
                                       <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">{item.volatility} Vol</span>
                                   </div>
                                   <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </div>
                          </GlassCard>
                      );
                  })}
              </div>
          </div>
      );
  };

  const NicheComponent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
      {nicheTopics.map((topic, idx) => (
            <GlassCard key={idx} className="flex flex-col hover:bg-gray-50 dark:hover:bg-white/5 transition-colors p-0 h-full" noPadding>
             <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/30">
                         <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{topic.topic}</h4>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`text-xs font-bold ${topic.growth.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{topic.growth} Growth</span>
                             <span className="text-[10px] text-gray-400">• {topic.mentions} Mentions</span>
                        </div>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${topic.signal === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : topic.signal === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                    {topic.signal} Signal
                </div>
             </div>
             <div className="p-5 flex-1 flex flex-col justify-between">
                 <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                     {topic.insight || "Emerging signal detected across global markets, suggesting increased investment activity and technological convergence."}
                 </p>
                 <div className="h-8 w-full opacity-50">
                      <Sparkline 
                        color={topic.growth.startsWith('+') ? '#10b981' : '#ef4444'} 
                        data={[10, 20, 15, 25, 30, 40].map(n => n + Math.random() * 10)} 
                      />
                 </div>
             </div>
            </GlassCard>
        ))
      }
    </div>
  );

  const NicheInsightsCollection = () => (
      <div className="space-y-4">
          <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Niche Market Insights
              </h3>
              <div className="flex gap-2">
                   <button 
                    onClick={handleDownloadNichePDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                   >
                       <Download className="w-3 h-3" /> Export PDF
                   </button>
              </div>
          </div>
          <GlassCard className="p-0 overflow-hidden transition-all">
              {INSIGHTS_DATA.map((item) => {
                  const isExpanded = expandedInsightId === item.id;
                  return (
                      <div key={item.id} className={`flex flex-col border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors ${isExpanded ? 'bg-blue-50/50 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                          {/* Summary Row */}
                          <div 
                            className="flex items-start gap-4 p-4 cursor-pointer"
                            onClick={() => toggleInsight(item.id)}
                          >
                              <div className="mt-1"><Bookmark className={`w-4 h-4 transition-colors ${isExpanded ? 'text-blue-600' : 'text-blue-500'}`} /></div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h4 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{item.title}</h4>
                                      <span className="text-[10px] text-gray-400">{item.date}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.summary}</p>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                          </div>
                          
                          {/* Expanded Content */}
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="p-4 pt-0 pl-12 pr-8">
                                  <div className="p-3 bg-white dark:bg-[#0f0f10] rounded-lg border border-gray-100 dark:border-white/5 shadow-sm">
                                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Deep Dive Analysis
                                      </h5>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {item.details}
                                      </p>
                                      <div className="mt-3 flex gap-2">
                                          <button className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline">View Source</button>
                                          <button className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline">Related Signals</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </GlassCard>
      </div>
  );

  // Custom Tooltip for Radar Chart
  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl min-w-[200px]">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-white/10">{label} Analysis</h4>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-xs">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                 </div>
                 <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/10">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                  <span className="font-bold text-blue-500">Insight:</span> {payload[0]?.payload?.insight}
              </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const RadarComponent = () => {
    const primaryCompetitor = competitors[0] || "Competitor X";
    
    return (
    <div className="flex flex-col h-full w-full">
        <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name={userCompany} dataKey="A" stroke="#0A84FF" strokeWidth={3} fill="#0A84FF" fillOpacity={0.2} />
                <Radar name={primaryCompetitor} dataKey="B" stroke="#FF5F5F" strokeWidth={3} fill="#FF5F5F" fillOpacity={0.2} />
                <Tooltip content={<CustomRadarTooltip />} cursor={false} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            </RadarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Strategic Takeaways */}
        <div className="mt-6 space-y-4">
             <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" /> Key Strategic Takeaways
                </h3>
                {radarLoading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {radarTakeaways.map((takeaway, idx) => {
                    const isPositive = takeaway.sentiment === 'positive';
                    const isNegative = takeaway.sentiment === 'negative';
                    const iconColor = isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';
                    const bgColor = isPositive ? 'bg-green-100 dark:bg-green-500/10' : isNegative ? 'bg-red-100 dark:bg-red-500/10' : 'bg-blue-100 dark:bg-blue-500/10';
                    const Icon = takeaway.icon === 'Zap' ? Zap : takeaway.icon === 'BrainCircuit' ? BrainCircuit : Users;
                    const borderColor = isPositive ? 'hover:border-green-500/30' : isNegative ? 'hover:border-red-500/30' : 'hover:border-blue-500/30';

                    return (
                        <div key={idx} className={`p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 ${borderColor} transition-colors ${idx === 2 ? 'md:col-span-2' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${bgColor} ${iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{takeaway.category}</h4>
                                        {idx === 0 && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 rounded-sm font-bold">LATEST</span>}
                                    </div>
                                    <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{takeaway.title}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {takeaway.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
  };

  const ChatComponent = () => {
    // Basic Markdown Parser for Bold Text
    const parseBold = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const renderMessageContent = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
          // Headers/Sections (Map specific keywords from AI system instruction to Icons)
          if (line.includes('Signal')) {
             return <h4 key={i} className="font-bold text-blue-600 dark:text-blue-400 mt-3 mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><Activity className="w-3 h-3" /> {line.replace(/###/g, '').replace(/\*/g, '').trim()}</h4>;
          }
          if (line.includes('Insight') || line.includes('Key Takeaways')) {
             return <h4 key={i} className="font-bold text-purple-600 dark:text-purple-400 mt-3 mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><Lightbulb className="w-3 h-3" /> {line.replace(/###/g, '').replace(/\*/g, '').trim()}</h4>;
          }
          if (line.includes('Forecast') || line.includes('Scenario')) {
             return <h4 key={i} className="font-bold text-emerald-600 dark:text-emerald-400 mt-3 mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><Compass className="w-3 h-3" /> {line.replace(/###/g, '').replace(/\*/g, '').trim()}</h4>;
          }
          if (line.includes('Strategy')) {
             return <h4 key={i} className="font-bold text-orange-600 dark:text-orange-400 mt-3 mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><Target className="w-3 h-3" /> {line.replace(/###/g, '').replace(/\*/g, '').trim()}</h4>;
          }

          // Blockquotes
          if (line.trim().startsWith('>')) {
              return (
                  <div key={i} className="pl-3 border-l-2 border-blue-500 my-2 italic text-gray-600 dark:text-gray-400 text-sm">
                      {line.replace('>', '').trim()}
                  </div>
              )
          }
          
          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
             return (
                 <div key={i} className="flex items-start gap-2 mb-1 pl-1">
                     <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                     <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: parseBold(line.replace(/^[-*]\s/, ''))}}></span>
                 </div>
             )
          }
    
          // Empty lines
          if (line.trim() === '') return <div key={i} className="h-2" />;
    
          // Standard text
          return <p key={i} className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-1" dangerouslySetInnerHTML={{__html: parseBold(line)}}></p>;
        });
      };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-sm backdrop-blur-md border border-gray-200 dark:border-white/5'
                }`}>
                    {/* Simplified Header for AI */}
                    {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-2 opacity-60 border-b border-gray-300 dark:border-white/10 pb-1">
                            <BrainCircuit className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Alara AI</span>
                        </div>
                    )}
                    
                    {msg.role === 'ai' ? renderMessageContent(msg.text) : msg.text}
                </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-white/10 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                </div>
            )}
            {/* Suggestion Chips when conversation is short */}
            {messages.length < 3 && !isTyping && (
                <div className="px-2 pb-2 flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-500/20"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
            <div className="relative">
                <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Alara about correlations, forecasts..."
                className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                />
                <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                >
                <Send className="w-4 h-4" />
                </button>
            </div>
            </div>
        </div>
    );
  };

  const SourcesFooter = () => {
    if (!groundingMetadata?.groundingChunks?.length) return null;
    return (
       <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 px-2">
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Live Data Sources</h4>
           <div className="flex flex-wrap gap-2">
               {groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                   chunk.web?.uri && (
                       <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-1 rounded transition-colors">
                           <Globe className="w-3 h-3" />
                           <span className="max-w-[150px] truncate">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                       </a>
                   )
               ))}
           </div>
       </div>
    )
  }

  // --- Main Render ---

  // Focused Full Views
  if (view === 'market_heatmap') {
    return (
      <div className="h-full flex flex-col space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Global Sector Heatmap</h2>
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing AI...' : 'Refresh Signal'}
            </button>
        </div>
        <HeatmapComponent />
        <AnalystNotesComponent />
        <SourcesFooter />
      </div>
    );
  }

  if (view === 'market_niche') {
    return (
      <div className="flex flex-col space-y-12 pb-32">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emerging-Niche Topics</h2>
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Scanning...' : 'Scan New Niches'}
            </button>
        </div>
        <NicheComponent />
        <div className="mb-8">
             <NicheInsightsCollection />
        </div>
        <div className="mt-8">
            <SourcesFooter />
        </div>
      </div>
    );
  }

  if (view === 'market_radar') {
    return (
      <div className="h-full flex flex-col space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Radar Analysis</h2>
            <button onClick={handleRadarRefresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                <RefreshCw className={`w-4 h-4 ${radarLoading ? 'animate-spin' : ''}`} />
                {radarLoading ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
        </div>
        <GlassCard className="flex-1 min-h-[500px]">
           <RadarComponent />
           <SourcesFooter />
        </GlassCard>
      </div>
    );
  }

  if (view === 'market_chat') {
      return (
        <div className="h-full flex flex-col space-y-6">
           <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Predictive Engine</h2>
           <GlassCard className="flex-1" noPadding>
              <ChatComponent />
           </GlassCard>
        </div>
      )
  }

  // Default Summary Dashboard View (view === 'market')
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 pb-4 overflow-hidden">
      
      {/* Left Column: Visual Intelligence */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        {/* Heatmap Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Sector Heatmap
            </h2>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/5 px-2 py-1 rounded">Live Data</span>
                 <button onClick={handleRefresh} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                     <RefreshCw className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                 </button>
            </div>
          </div>
          <HeatmapComponent limit={6} />
          <div className="mt-8">
            <AnalystNotesComponent limit={4} />
          </div>
        </section>

        {/* Competitor Radar Section */}
        <div className="grid grid-cols-1 gap-6">
             <section className="min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Competitor Radar</h2>
                </div>
                <GlassCard className="flex-1 flex items-center justify-center p-4 overflow-hidden h-[500px]">
                    <RadarComponent />
                </GlassCard>
            </section>
        </div>
         
         <SourcesFooter />
      </div>

      {/* Right Column: Predictive Engine Chat */}
      <div className="w-full lg:w-[380px] flex flex-col h-[500px] lg:h-auto shrink-0">
        <GlassCard className="flex-1 flex flex-col border border-blue-500/20 dark:border-blue-500/30 shadow-sm dark:shadow-blue-900/20" noPadding>
          <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />
               <h3 className="font-semibold text-gray-900 dark:text-white">Predictive Engine</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ask about correlations, forecasts, or specific data points.</p>
          </div>
          <ChatComponent />
        </GlassCard>
      </div>

    </div>
  );
};

export default MarketIntelligence;
