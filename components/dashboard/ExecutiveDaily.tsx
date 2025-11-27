import React, { useEffect, useState, useRef, useMemo } from 'react';
import { RefreshCw, Headphones, Download, Play, Pause, SkipForward, SkipBack, Share2, Mail, FileText, CheckCircle, ExternalLink, StopCircle, Volume2, Globe, Clock, Settings2, CloudSun, Wind, Droplets, Quote, ListMusic, BarChart3, Loader2, Video as VideoIcon, Upload, Zap, Lightbulb, BookOpen, TrendingUp, Target, Activity } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { generateDailyBriefing, generateSpeech, generateVeoVideo } from '../../services/geminiService';
import { MarketPriority } from '../../types';
import { jsPDF } from 'jspdf';

interface ExecutiveDailyProps {
  view: string; // 'daily', 'daily_briefing', 'daily_export', 'daily_podcast'
  marketPriority: MarketPriority;
}

// --- Lazy Image Component for Performance ---
const LazyImage: React.FC<{ src: string; alt: string; className?: string; priority?: boolean }> = ({ 
  src, 
  alt, 
  className = "",
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-white/5 ${className}`}>
      {/* Skeleton Pulse */}
      <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />
    </div>
  );
};

// --- Quote Widget Data ---
const QUOTES = [
  { 
    text: "The people who are crazy enough to think they can change the world are the ones who do.", 
    author: "Steve Jobs", 
    role: "Co-founder, Apple", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/220px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg" 
  },
  { 
    text: "The happiness of your life depends upon the quality of your thoughts.", 
    author: "Marcus Aurelius", 
    role: "Roman Emperor", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Marcus_Aurelius_Louvre_MR561_n01.jpg/220px-Marcus_Aurelius_Louvre_MR561_n01.jpg" 
  },
  { 
    text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.", 
    author: "Bill Gates", 
    role: "Co-founder, Microsoft", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/220px-Bill_Gates_2017_%28cropped%29.jpg" 
  },
];

const WeatherWidget = () => (
  <GlassCard className="flex flex-col justify-center p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 border-blue-100/50 dark:border-blue-500/20 h-full">
    <div className="flex items-center justify-between w-full h-full">
      <div className="flex flex-col justify-center gap-1">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Istanbul, Turkey</h3>
        <div className="flex items-baseline gap-2">
           <span className="text-3xl font-bold text-gray-900 dark:text-white leading-none">19°</span>
           <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Clear</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
         <CloudSun className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
         <span className="text-[10px] text-gray-400 font-medium">H:22° L:14°</span>
      </div>
    </div>
  </GlassCard>
);

const DailyQuoteWidget = () => {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <GlassCard className="relative overflow-hidden p-4 flex items-center gap-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 h-full">
       <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-white/20 shadow-md shrink-0">
          <LazyImage src={quote.image} alt={quote.author} className="w-full h-full" />
       </div>
       <div className="relative z-10 min-w-0 flex flex-col justify-center flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 mb-1">"{quote.text}"</p>
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{quote.author}</span>
             <span className="w-0.5 h-2.5 bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
             <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate hidden sm:block">{quote.role}</span>
          </div>
       </div>
    </GlassCard>
  );
};

interface PlaylistTrack { id: string; title: string; text: string; duration?: number; }

const ExecutiveDaily: React.FC<ExecutiveDailyProps> = ({ view, marketPriority }) => {
  const [content, setContent] = useState<string>("");
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date] = useState(new Date());
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  
  // Cache to store audio URLs for tracks to prevent re-generation lag
  const audioCache = useRef<Map<string, string>>(new Map());

  // Video Generation State (Veo)
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSectorsFromPriority = (priority: MarketPriority): string[] => {
      switch (priority) {
          case 'Energy': return ["Oil & Gas", "Renewables", "Green Hydrogen", "Utilities"];
          case 'Finance': return ["Banking", "Fintech", "Private Equity", "Crypto"];
          case 'Innovation': return ["Startups", "Venture Capital", "Biotech", "Deep Tech"];
          case 'Business': return ["M&A", "Corporate Strategy", "Retail", "Supply Chain"];
          case 'Tech': return ["SaaS", "AI", "Semiconductors", "Cybersecurity"];
          default: return ["Tech", "Finance", "Energy", "AI"]; // General
      }
  };

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    const sectors = getSectorsFromPriority(marketPriority);
    const region = "Global";
    const result = await generateDailyBriefing(sectors, region, forceRefresh);
    if (result) {
      setContent(result.content);
      setGroundingMetadata(result.groundingMetadata);
    }
    setLoading(false);
  };

  useEffect(() => {
    if ((view === 'daily' || view === 'daily_briefing' || view === 'daily_podcast' || view === 'daily_export')) {
      // Even in export view, we need the content to generate the PDF
      if (!content) fetchData();
    } else {
        setLoading(false);
    }
  }, [view, marketPriority]);

  useEffect(() => {
    if (content) {
      const newPlaylist: PlaylistTrack[] = [];
      let trackCount = 0;
      const summaryText = getSummaryText();
      if (summaryText) {
        newPlaylist.push({ id: `playlist-${trackCount++}`, title: "Executive Summary", text: summaryText });
      }
      const lines = content.split('\n');
      let currentSection = '';
      lines.forEach(line => {
         if (line.startsWith('### ')) currentSection = line;
         if (currentSection.includes('Top 3 Developments') && line.match(/^\*\*\d+\./)) {
             const title = line.replace(/^\*\*\d+\.\s*/, '').replace(/\*\*/g, '');
             const text = getDevelopmentText(title);
             newPlaylist.push({ id: `playlist-${trackCount++}`, title: title, text: text });
         }
      });
      setPlaylist(newPlaylist);
    }
  }, [content]);

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
    setCurrentTime(0);
  };

  const togglePlayback = () => {
    if (audioRef.current && currentAudioId) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    } else if (!currentAudioId && playlist.length > 0) {
        playPlaylistTrack(0);
    }
  };

  const playText = async (id: string, text: string, autoAdvanceIndex: number = -1) => {
    // Prevent race conditions by tracking the latest request ID
    activeRequestIdRef.current = id;

    // If the same track is clicked, toggle play/pause
    if (currentAudioId === id) {
      togglePlayback();
      return;
    }

    // New track selected: stop previous and load new
    stopAudio();
    setCurrentAudioId(id);
    setIsAudioLoading(true);
    setDuration(0); 

    try {
      let audioUrl = audioCache.current.get(id);

      if (!audioUrl) {
        const base64Audio = await generateSpeech(text);
        
        // Race condition check: If user clicked another track while waiting
        if (activeRequestIdRef.current !== id) return;

        if (!base64Audio) {
          setCurrentAudioId(null);
          setIsAudioLoading(false);
          return;
        }

        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const wavBytes = createWavHeader(bytes);
        const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(wavBlob);
        audioCache.current.set(id, audioUrl);
      }
      
      // Secondary race condition check after processing
      if (activeRequestIdRef.current !== id) return;

      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.onloadedmetadata = () => {
        if (activeRequestIdRef.current === id) setDuration(audio.duration);
      };
      audio.ontimeupdate = () => {
        if (activeRequestIdRef.current === id) setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentAudioId(null);
        if (autoAdvanceIndex !== -1 && autoAdvanceIndex < playlist.length - 1) {
             const nextTrack = playlist[autoAdvanceIndex + 1];
             playText(nextTrack.id, nextTrack.text, autoAdvanceIndex + 1);
        }
      };
      
      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
      setIsAudioLoading(false);
    } catch (error) {
      console.error("Audio Playback Error", error);
      if (activeRequestIdRef.current === id) {
        setCurrentAudioId(null);
        setIsAudioLoading(false);
      }
    }
  };

  const playPlaylistTrack = (index: number) => {
      const track = playlist[index];
      if (track) playText(track.id, track.text, index);
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsGeneratingVideo(true);
      const file = e.target.files[0];
      const video = await generateVeoVideo(file);
      if (video) {
        setVideoUrl(video);
      }
      setIsGeneratingVideo(false);
    }
  };

  const createWavHeader = (pcmData: Uint8Array) => {
      const numChannels = 1; const sampleRate = 24000; const bitsPerSample = 16;
      const blockAlign = numChannels * bitsPerSample / 8; const byteRate = sampleRate * blockAlign; const dataSize = pcmData.length;
      const buffer = new ArrayBuffer(44 + dataSize); const view = new DataView(buffer);
      writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true);
      writeString(view, 36, 'data'); view.setUint32(40, dataSize, true);
      new Uint8Array(buffer, 44).set(pcmData);
      return buffer;
  }
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  }

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60); const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getDevelopmentText = (title: string) => {
    if (!content) return title;
    const lines = content.split('\n');
    const titleIndex = lines.findIndex(line => line.includes(title));
    if (titleIndex === -1) return title;
    let extracted = title + ". ";
    for (let i = titleIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') || (line.startsWith('**') && line.match(/^\*\*\d+\./))) break;
      if (line) extracted += line.replace(/\*\*/g, '') + " ";
    }
    return extracted;
  };
  
  const getSummaryText = () => {
    if (!content) return "";
    const lines = content.split('\n');
    const summaryIndex = lines.findIndex(l => l.includes('Executive Summary'));
    if (summaryIndex === -1) return "";
    let text = "";
    for (let i = summaryIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('###')) break;
        text += lines[i] + " ";
    }
    return text.trim();
  }

  // Refined Render Content to support sections and icons
  const renderContent = (text: string) => {
    const sectionsRaw = text.split(/(?=### )/g);
    
    return sectionsRaw.map((section, secIdx) => {
      const lines = section.split('\n');
      const sectionElements: React.ReactNode[] = [];
      let currentSectionTitle = '';
      let isTakeaways = false;

      // Handle Title / Spot (First chunk usually doesn't have ###)
      if (!section.startsWith('###')) {
         lines.forEach((line, idx) => {
           if (line.startsWith('## ')) {
             const headlineText = line.replace(/## .*? : /, '');
             sectionElements.push(
               <div key={`head-${secIdx}-${idx}`} className="mb-4">
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight font-display">
                   {headlineText || line.replace('## ', '')}
                 </h1>
               </div>
             );
           } else if (line.startsWith('**Spot:**')) {
             sectionElements.push(
               <p key={`spot-${secIdx}-${idx}`} className="text-lg text-gray-600 dark:text-gray-300 italic border-l-4 border-blue-500 pl-4 mb-8 leading-relaxed font-light">
                 {line.replace('**Spot:**', '').replace(/\*\*/g, '').trim()}
               </p>
             );
           }
         });
         return <div key={`sec-top-${secIdx}`}>{sectionElements}</div>;
      }

      // Handle Regular Sections
      lines.forEach((line, idx) => {
        if (line.startsWith('### ')) {
           const title = line.replace('### ', '').replace(/^\d+\.\s*/, ''); // Remove numbering
           currentSectionTitle = title;
           isTakeaways = title.includes('Key Takeaways');

           let Icon = FileText;
           if (title.includes('Executive Summary')) Icon = Activity;
           if (title.includes('Developments')) Icon = Zap;
           if (title.includes('Market Narrative')) Icon = TrendingUp;
           if (title.includes('Key Takeaways')) Icon = Lightbulb;
           if (title.includes('Reading')) Icon = BookOpen;

           sectionElements.push(
             <div key={`header-${secIdx}-${idx}`} className="mt-8 mb-4">
                 <div className="h-px w-full bg-gray-200 dark:bg-white/10 mb-6"></div>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg"><Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h2>
                 </div>
             </div>
           );
        } else if (line.trim() !== '') {
            if (isTakeaways && line.trim().startsWith('* ')) {
                sectionElements.push(
                   <div key={`takeaway-${secIdx}-${idx}`} className="flex items-start gap-3 p-3 mb-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{line.replace('* ', '')}</span>
                   </div>
                );
            } else if (currentSectionTitle.includes('Developments') && line.startsWith('**') && line.match(/^\*\*\d+\./)) {
                // Developments Audio Buttons
                const title = line.replace(/^\*\*\d+\.\s*/, '').replace(/\*\*/g, '');
                // Using regex to ensure unique ID across refreshes but stable enough
                const devId = `dev-${title.substring(0, 15).replace(/\s/g, '')}-${secIdx}`;
                const isActive = currentAudioId === devId;
                sectionElements.push(
                     <div key={`dev-title-${secIdx}-${idx}`} className="group flex items-start gap-3 mt-5 mb-2">
                        <button 
                          onClick={() => playText(devId, getDevelopmentText(title))}
                          disabled={isAudioLoading && !isActive} 
                          className={`flex-shrink-0 p-2 rounded-full transition-all mt-0.5 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-blue-600 hover:text-white'}`}
                        >
                           {isActive && isAudioLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isActive && isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pt-1">{title}</h3>
                     </div>
                 );
            } else if (line.trim().startsWith('* ')) {
                const content = line.replace('* ', '');
                if (content.includes('**The Signal:**') || content.includes('**The Implication:**')) {
                    const label = content.match(/\*\*(.*?)\*\*/)?.[1];
                    const value = content.replace(/\*\*.*?\*\*/, '');
                    sectionElements.push(
                        <div key={`bullet-${secIdx}-${idx}`} className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-2 ml-11 text-gray-700 dark:text-gray-300 text-sm">
                           <span className="font-bold text-gray-900 dark:text-white min-w-[120px] text-xs uppercase tracking-wide opacity-80 mt-0.5">{label}</span>
                           <span className="flex-1 leading-relaxed">{value}</span>
                        </div>
                    )
                } else if (content.includes('[Link]')) {
                     const parts = content.split('—');
                     sectionElements.push(
                         <div key={`link-${secIdx}-${idx}`} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg mb-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-gray-200 dark:border-white/5 shadow-sm ml-1">
                             <div className="mt-1"><ExternalLink className="w-4 h-4 text-blue-500" /></div>
                             <div><p className="font-semibold text-gray-900 dark:text-white text-sm">{parts[0]?.replace(/\*\*/g, '')}</p><p className="text-xs text-gray-500 mt-1">{parts[1]?.replace('[Link]', '')}</p></div>
                         </div>
                     )
                } else {
                    sectionElements.push(<li key={`li-${secIdx}-${idx}`} className="ml-4 mb-2 text-gray-700 dark:text-gray-300 list-disc pl-2 text-sm leading-relaxed">{content}</li>);
                }
            } else {
                sectionElements.push(<p key={`p-${secIdx}-${idx}`} className="mb-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>);
            }
        }
      });
      return <div key={`sec-${secIdx}`}>{sectionElements}</div>;
    });
  };

  const PodcastView = () => (
    <div className="flex flex-col md:flex-row h-full animate-fade-in gap-6 md:gap-12 px-6 py-4 max-w-6xl mx-auto w-full items-center justify-center">
      {/* Left Side - Visualizer & Track Info */}
      <div className="flex-none flex flex-col items-center justify-center w-full md:w-auto">
        <div className="relative w-64 h-64 mb-6 group shrink-0">
          {/* Animated Ambient Glow */}
          <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-[50px] ${isPlaying ? 'animate-pulse scale-125 opacity-80' : 'opacity-30'} transition-all duration-1000`}></div>
          <div className={`absolute inset-8 bg-indigo-500/20 rounded-full blur-[30px] ${isPlaying ? 'animate-pulse scale-110 opacity-80' : 'opacity-30'} transition-all duration-1000 delay-150`}></div>
          
          {/* Main Container */}
          <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-[#151516] dark:to-black rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-2xl z-10 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
             {/* Rotating Ring */}
             {isPlaying && (
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.15)_180deg,transparent_360deg)] animate-[spin_4s_linear_infinite]"></div>
             )}
             
             {/* Large Icon */}
             <Headphones 
                className={`w-28 h-28 text-gray-300 dark:text-gray-600 ${isPlaying ? 'text-blue-500 dark:text-blue-400 scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''} transition-all duration-700 ease-in-out`} 
                strokeWidth={isPlaying ? 1.5 : 1} 
             />
          </div>
        </div>

        {/* Text Info */}
        <div className="text-center space-y-2 max-w-sm px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
             {playlist.find(t => t.id === currentAudioId)?.title || "Executive Daily Briefing"}
          </h2>
          <div className="flex items-center justify-center gap-2">
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isPlaying ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'}`}>
                {currentAudioId ? "Now Playing" : "Ready"}
             </span>
             <span className="text-gray-300 dark:text-gray-700">•</span>
             <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Controls & Playlist */}
      <div className="flex-1 w-full max-w-xl flex flex-col gap-6 h-full md:h-auto md:max-h-[600px]">
        {/* Controls Card - Compact */}
        <div className="flex-none bg-white/60 dark:bg-white/5 rounded-3xl p-5 border border-gray-200 dark:border-white/5 shadow-xl backdrop-blur-md">
          {/* Scrubber */}
          <div className="space-y-2 mb-6">
            <div className="relative group cursor-pointer">
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek} 
                  disabled={!currentAudioId || isAudioLoading} 
                  className="absolute inset-0 w-full h-2 opacity-0 z-20 cursor-pointer" 
                />
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-100 ease-linear rounded-full relative"
                     style={{ width: `${(currentTime / (duration || 0.1)) * 100}%` }}
                   >
                   </div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center justify-between px-2">
              <button 
                  onClick={() => setPlaybackSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-10 text-left"
              >
                  {playbackSpeed}x
              </button>

              <div className="flex items-center gap-6">
                  <button 
                      onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10; }} 
                      disabled={!currentAudioId} 
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
                  >
                      <SkipBack className="w-6 h-6" fill="currentColor" />
                  </button>
                  <button 
                      onClick={togglePlayback}
                      disabled={playlist.length === 0}
                      className="w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                      {isAudioLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
                  </button>
                  <button 
                      onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10; }} 
                      disabled={!currentAudioId} 
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
                  >
                      <SkipForward className="w-6 h-6" fill="currentColor" />
                  </button>
              </div>
               
              <div className="w-10 flex justify-end">
                  {isAudioLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
              </div>
          </div>
        </div>
        
        {/* Playlist - Scrollable area */}
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-2 shrink-0">
              <ListMusic className="w-3 h-3" /> Playlist
           </h3>
           <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-2">
              {playlist.map((track, idx) => (
                 <div key={track.id} onClick={() => playPlaylistTrack(idx)} className={`group p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${currentAudioId === track.id ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-100 dark:hover:border-white/5'}`}>
                     <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 ${currentAudioId === track.id ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 group-hover:text-blue-500'}`}>
                         {currentAudioId === track.id && isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-3 h-3 ml-0.5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                         <p className={`text-sm font-bold truncate ${currentAudioId === track.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{track.title}</p>
                         <p className="text-xs text-gray-400 truncate mt-0.5">{track.text.substring(0, 50)}...</p>
                     </div>
                     <div className="text-xs font-mono text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {Math.floor(Math.random() * 3) + 1}:{(Math.floor(Math.random() * 50) + 10).toString().padStart(2, '0')}
                     </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const ExportView = () => {
    
    const handleDownloadPDF = () => {
        if (!content) return;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // --- Styles ---
        const colors = {
            navy: [0, 32, 96], // Dark corporate blue
            blue: [0, 90, 180], // Bright corporate blue
            text: [50, 50, 50],
            lightGray: [240, 240, 240]
        };

        // --- Header ---
        doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("EXECUTIVE DAILY BRIEF", margin, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("ALARA AI INTELLIGENCE SUITE", margin, 28);
        
        doc.text(date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 20, { align: 'right' });
        doc.text(`Priority Focus: ${marketPriority}`, pageWidth - margin, 28, { align: 'right' });

        // --- Content Logic ---
        let yPos = 50;

        const checkPageBreak = (neededHeight: number) => {
            if (yPos + neededHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                
                // Minimal Header on subsequent pages
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, margin - 5, pageWidth - margin, margin - 5);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Alara AI - ${date.toLocaleDateString()}`, margin, margin - 7);
            }
        };

        // Parse lines
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) {
                yPos += 3;
                return;
            }

            // --- Main Title (Usually handled in header, but if exists in text) ---
            if (cleanLine.startsWith('## ')) {
                checkPageBreak(15);
                const text = cleanLine.replace(/## .*? : /, '').replace('## ', '');
                
                // Add separator
                doc.setDrawColor(colors.navy[0], colors.navy[1], colors.navy[2]);
                doc.setLineWidth(0.5);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 8;

                doc.setFont("times", "bold");
                doc.setFontSize(16);
                doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
                doc.text(text, margin, yPos);
                yPos += 10;
            }
            // --- Spot/Hook ---
            else if (cleanLine.startsWith('**Spot:**')) {
                const text = cleanLine.replace('**Spot:**', '').replace(/\*\*/g, '').trim();
                checkPageBreak(20);
                
                doc.setFont("times", "italic");
                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                const splitText = doc.splitTextToSize(text, contentWidth - 5);
                
                // Draw left border line
                const blockHeight = (splitText.length * 5) + 4;
                doc.setDrawColor(colors.blue[0], colors.blue[1], colors.blue[2]);
                doc.setLineWidth(1);
                doc.line(margin, yPos, margin, yPos + blockHeight);
                
                doc.text(splitText, margin + 4, yPos + 4);
                yPos += blockHeight + 8;
            }
            // --- Section Header ---
            else if (cleanLine.startsWith('### ')) {
                const text = cleanLine.replace('### ', '').replace(/^\d+\.\s*/, '').trim();
                checkPageBreak(12);
                
                // Executive Summary special styling
                if (text.includes('Executive Summary')) {
                   doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
                   doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
                }

                yPos += 2;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
                doc.text(text.toUpperCase(), margin, yPos);
                yPos += 8;
            }
            // --- Bullet Points ---
            else if (cleanLine.startsWith('* ')) {
                let text = cleanLine.replace('* ', '');
                let prefix = '';
                
                // Check for bold label e.g. "**The Signal:**"
                if (text.includes('**')) {
                   const parts = text.split('**');
                   if (parts.length > 2) {
                       prefix = parts[1] + ' '; // The part between **
                       text = text.replace(`**${parts[1]}**`, '').trim();
                   }
                }
                
                text = text.replace(/\*\*/g, ''); // Clean remaining
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

                const bulletIndent = 5;
                const availableWidth = contentWidth - bulletIndent;
                
                // If prefix exists, measure it
                let prefixWidth = 0;
                if (prefix) {
                     doc.setFont("helvetica", "bold");
                     prefixWidth = doc.getTextWidth(prefix);
                }

                const splitText = doc.splitTextToSize(text, availableWidth - prefixWidth);
                const blockHeight = splitText.length * 5;
                checkPageBreak(blockHeight);

                // Draw Bullet
                doc.circle(margin + 2, yPos - 1, 0.5, 'F');

                // Draw Prefix
                if (prefix) {
                    doc.setFont("helvetica", "bold");
                    doc.text(prefix, margin + bulletIndent, yPos);
                    doc.setFont("helvetica", "normal");
                    doc.text(splitText[0], margin + bulletIndent + prefixWidth, yPos);
                    
                    if (splitText.length > 1) {
                         // Remaining lines
                         doc.text(splitText.slice(1), margin + bulletIndent, yPos + 5);
                    }
                } else {
                    doc.text(splitText, margin + bulletIndent, yPos);
                }
                
                yPos += blockHeight + 2;
            }
            // --- Standard Text ---
            else {
                const text = cleanLine.replace(/\*\*/g, '');
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
                
                const splitText = doc.splitTextToSize(text, contentWidth);
                checkPageBreak(splitText.length * 5);
                doc.text(splitText, margin, yPos);
                yPos += (splitText.length * 5) + 2;
            }
        });

        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            doc.text("CONFIDENTIAL - FOR EXECUTIVE USE ONLY", margin, pageHeight - 10);
        }

        doc.save(`Alara_Executive_Brief_${date.toISOString().split('T')[0]}.pdf`);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
         <GlassCard className="space-y-4 p-8">
            <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4"><FileText className="w-6 h-6 text-red-500 dark:text-red-400" /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">PDF Report</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Download a formal, McKinsey-style one-pager of today's briefing.</p>
            <button 
                onClick={handleDownloadPDF}
                disabled={loading || !content}
                className="w-full py-3 mt-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-900 dark:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                Download PDF
            </button>
         </GlassCard>
         <GlassCard className="space-y-4 p-8">
            <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4"><Mail className="w-6 h-6 text-blue-500 dark:text-blue-400" /></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email Brief</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Send this briefing to your executive team.</p>
            <button className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/20"><Share2 className="w-4 h-4" /> Send Email</button>
         </GlassCard>
      </div>
    );
  };

  const SourcesSection = () => {
    if (!groundingMetadata?.groundingChunks?.length) return null;
    return (
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verified Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
            chunk.web?.uri && (
              <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
              </a>
            )
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
             <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30 uppercase tracking-wider">{marketPriority} Focus</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {view === 'daily_podcast' ? 'AI Podcast' : view === 'daily_export' ? 'Export' : 'Executive Daily'}
          </h1>
        </div>
        {(view === 'daily' || view === 'daily_briefing') && (
          <button onClick={() => fetchData(true)} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors" title="Refresh">
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {view === 'daily_podcast' ? (
        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden h-[calc(100vh-14rem)] min-h-[500px]"><PodcastView /></GlassCard>
      ) : view === 'daily_export' ? (
        <ExportView />
      ) : (
        loading ? (
          <div className="space-y-6 animate-pulse max-w-4xl mx-auto w-full mt-4">
             <div className="h-64 bg-gray-200 dark:bg-white/5 rounded-2xl w-full"></div>
             <div className="space-y-4"><div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-3/4"></div><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-full"></div></div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-3 h-28"><DailyQuoteWidget /></div>
                <div className="md:col-span-2 h-28"><WeatherWidget /></div>
            </div>
            
            {/* Hero Section with Veo Video Support */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl group">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <LazyImage src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" alt="Executive Briefing Hero" className="w-full h-full group-hover:scale-105 transition-transform duration-1000" priority={true} />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-8">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded mb-2 w-fit shadow-lg backdrop-blur-sm z-10">DAILY INTEL</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white max-w-3xl leading-tight drop-shadow-md z-10">Market Signals & Strategic Foresight</h2>
                        <div className="flex items-center gap-3 mt-3 z-10">
                            <button onClick={() => { const summaryText = getSummaryText(); if (summaryText) playText('summary', summaryText); }} disabled={isAudioLoading && currentAudioId !== 'summary'} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-medium transition-all">
                                {currentAudioId === 'summary' && isAudioLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isPlaying && currentAudioId === 'summary' ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3 fill-current" />}
                                {isPlaying && currentAudioId === 'summary' ? "Playing..." : "Listen to Summary"}
                            </button>
                        </div>
                    </div>
                    
                    {/* Veo Animation Trigger */}
                    <div className="z-10 relative">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isGeneratingVideo}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all disabled:opacity-50 flex items-center gap-2"
                            title="Animate Hero with Veo"
                        >
                            {isGeneratingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <VideoIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
              </div>
            </div>

            <GlassCard className="min-h-[600px] p-8 md:p-10">
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">{renderContent(content)}</div>
              <SourcesSection />
            </GlassCard>
          </div>
        )
      )}
    </div>
  );
};

export default ExecutiveDaily;