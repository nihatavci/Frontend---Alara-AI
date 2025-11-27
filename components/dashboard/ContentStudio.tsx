
import React, { useState, useEffect } from 'react';
import { Linkedin, MessageSquare, Copy, Check, Sparkles, FileText, History, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { generateExecutiveContent } from '../../services/geminiService';

interface ContentStudioProps {
  view: string; // 'content', 'content_linkedin', 'content_talking'
}

const ContentStudio: React.FC<ContentStudioProps> = ({ view }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Visionary');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const getContentType = (): 'linkedin' | 'talking-points' => {
    return view === 'content_talking' ? 'talking-points' : 'linkedin';
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedContent("");
    const type = getContentType();
    const result = await generateExecutiveContent(type, topic, tone);
    setGeneratedContent(result);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
      setGeneratedContent('');
      setTopic('');
  }, [view]);

  if (view === 'content') {
      return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
             <div className="text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Studio</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your executive presence and communication strategy.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <GlassCard className="group hover:border-blue-500/50 transition-colors cursor-pointer flex flex-col min-h-[260px] p-6 shadow-sm dark:shadow-none relative overflow-hidden" noPadding={false}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Linkedin className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col items-start">
                         <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                             <Linkedin className="w-6 h-6" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">LinkedIn Architect</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            Generate viral, high-authority thought leadership posts tailored to your executive voice.
                         </p>
                         <div className="mt-auto pt-6 flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                             Launch Generator <ArrowRight className="w-4 h-4 ml-1" />
                         </div>
                    </div>
                 </GlassCard>

                 <GlassCard className="group hover:border-purple-500/50 transition-colors cursor-pointer flex flex-col min-h-[260px] p-6 shadow-sm dark:shadow-none relative overflow-hidden" noPadding={false}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageSquare className="w-24 h-24 text-purple-600" />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col items-start">
                         <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                             <FileText className="w-6 h-6" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Talking Points Memo</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            Prepare concise, data-backed arguments for board meetings and press interviews.
                         </p>
                         <div className="mt-auto pt-6 flex items-center text-purple-600 dark:text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                             Create Brief <ArrowRight className="w-4 h-4 ml-1" />
                         </div>
                    </div>
                 </GlassCard>
             </div>

             <div className="mt-8">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Drafts</h3>
                 <GlassCard className="p-0 overflow-hidden">
                     {[1, 2, 3].map((i) => (
                         <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                     <History className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-gray-900 dark:text-white">Q3 Financial Outlook Strategy</p>
                                     <p className="text-xs text-gray-500">Edited 2 hours ago • LinkedIn Post</p>
                                 </div>
                             </div>
                             <ArrowRight className="w-4 h-4 text-gray-400" />
                         </div>
                     ))}
                 </GlassCard>
             </div>
        </div>
      );
  }

  // Generator View
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto pb-10">
        {/* Left: Configuration */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'content_linkedin' ? 'LinkedIn Architect' : 'Talking Points Memo'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your content parameters.</p>
            </div>

            <GlassCard className="space-y-8 p-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Topic or Context</label>
                    <textarea 
                        className="w-full h-48 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none leading-relaxed"
                        placeholder={view === 'content_linkedin' ? "e.g., The future of AI in supply chain management..." : "e.g., Arguments for increasing R&D budget by 15%..."}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Tone of Voice</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Visionary', 'Pragmatic', 'Contrarian', 'Empathetic'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setTone(t)}
                                className={`px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${tone === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-500'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 mt-auto">
                    <button 
                        onClick={handleGenerate}
                        disabled={!topic || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isGenerating ? 'Drafting...' : 'Generate Draft'}
                    </button>
                </div>
            </GlassCard>
        </div>

        {/* Right: Preview */}
        <div className="w-full lg:w-2/3 flex flex-col h-full min-h-[600px]">
            <GlassCard className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#1C1C1E]" noPadding>
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Draft Preview</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCopy}
                            disabled={!generatedContent}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Copy to Clipboard"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {generatedContent ? (
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
                            {generatedContent}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-50">
                            <Sparkles className="w-16 h-16 mb-4" strokeWidth={1} />
                            <p className="text-sm">Ready to generate intelligence.</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    </div>
  );
};

export default ContentStudio;
