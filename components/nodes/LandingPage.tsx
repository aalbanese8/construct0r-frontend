
import React from 'react';
import { Layout, ArrowRight, Zap, Brain, Share2, Youtube, Globe, HardDrive, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans selection:bg-primary/30 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary/20 p-2 rounded-lg backdrop-blur-sm border border-primary/10">
            <Layout className="w-6 h-6 text-primary" />
          </div>
          <span>construct0r</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onGetStarted}
            className="text-sm font-medium bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-[100%] blur-[120px] -z-10 opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/10 rounded-[100%] blur-[100px] -z-10 opacity-30" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-primary mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            v1.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Architect your context.<br />
            <span className="text-white">Power your AI.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A visual, node-based workspace to gather context from videos, web pages, and docs, then pipe it directly into powerful AI models for better answers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all shadow-xl shadow-blue-500/20 hover:scale-105 flex items-center gap-2"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Abstract Visual Representation of the App */}
        <div className="mt-20 max-w-5xl mx-auto relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-surface border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden h-[400px] md:h-[600px] transform rotate-x-12 group-hover:rotate-0 transition-transform duration-700 ease-out">
            {/* Mock UI Header */}
            <div className="h-12 border-b border-border bg-slate-900/50 flex items-center px-4 gap-2">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
               </div>
            </div>
            {/* Mock Nodes */}
            <div className="absolute top-20 left-20 w-64 bg-slate-800 rounded-lg border border-red-500/50 shadow-xl p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase"><Youtube className="w-4 h-4"/> Video Source</div>
               <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
               <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
               <div className="h-20 bg-slate-900/50 rounded border border-slate-700/50 p-2">
                 <div className="h-1.5 w-full bg-slate-700/50 rounded mb-1"></div>
                 <div className="h-1.5 w-5/6 bg-slate-700/50 rounded mb-1"></div>
                 <div className="h-1.5 w-4/6 bg-slate-700/50 rounded"></div>
               </div>
            </div>

             {/* Connection Line */}
             <svg className="absolute inset-0 pointer-events-none z-0">
                <path d="M 320 180 C 400 180, 400 350, 500 350" stroke="#64748b" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                <path d="M 320 480 C 400 480, 400 350, 500 350" stroke="#64748b" strokeWidth="2" fill="none" strokeDasharray="5,5" />
             </svg>

            <div className="absolute bottom-20 left-20 w-64 bg-slate-800 rounded-lg border border-blue-500/50 shadow-xl p-4 flex flex-col gap-3">
               <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase"><Globe className="w-4 h-4"/> Web Source</div>
               <div className="h-2 w-2/3 bg-slate-700 rounded"></div>
               <div className="h-16 bg-slate-900/50 rounded border border-slate-700/50 p-2">
                 <div className="h-1.5 w-full bg-slate-700/50 rounded mb-1"></div>
                 <div className="h-1.5 w-full bg-slate-700/50 rounded mb-1"></div>
               </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-20 w-80 bg-slate-800 rounded-lg border border-accent/50 shadow-xl shadow-accent/10 p-4 flex flex-col gap-3 z-10">
               <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase"><Brain className="w-4 h-4"/> Gemini AI Chat</div>
               <div className="flex gap-2">
                 <div className="w-6 h-6 rounded-full bg-purple-900 flex-shrink-0"></div>
                 <div className="bg-slate-700/50 rounded-lg p-2 text-[10px] text-slate-300 w-full">
                    Based on the video and article, the key strategy is...
                 </div>
               </div>
               <div className="mt-2 relative">
                 <div className="h-8 bg-slate-900 border border-slate-700 rounded w-full"></div>
                 <div className="absolute right-1 top-1 w-6 h-6 bg-accent rounded flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to build context</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Stop tabbing between windows. Bring all your research into one infinite canvas and let AI connect the dots.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Youtube className="w-6 h-6 text-red-500" />}
              title="Video Transcription"
              description="Paste any YouTube, TikTok, or Instagram URL. We automatically extract the transcript so your AI can read the video."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-blue-500" />}
              title="Web Extraction"
              description="Pull content from blogs, documentation, and news sites. Clean, readable text ready for LLM processing."
            />
            <FeatureCard 
              icon={<HardDrive className="w-6 h-6 text-green-500" />}
              title="Google Drive Sync"
              description="Directly access your docs, sheets, and PDFs. If it's a file, we can read it and use it as context."
            />
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-indigo-500" />}
              title="Infinite Canvas"
              description="Map out your thoughts visually. Connect nodes to create complex data pipelines for your AI chats."
            />
            <FeatureCard 
              icon={<Brain className="w-6 h-6 text-purple-500" />}
              title="Multi-Model Chat"
              description="Powered by Google Gemini. Chain chat nodes together to create multi-step reasoning workflows."
            />
            <FeatureCard 
              icon={<Share2 className="w-6 h-6 text-pink-500" />}
              title="Export & Share"
              description="Save your workflows as projects. Export your findings or share your prompt chains with the team."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 border-t border-slate-800">
         <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1 space-y-8">
                  <h3 className="text-3xl font-bold">From Chaos to Clarity</h3>
                  <div className="space-y-6">
                     <Step number="01" title="Add Sources" desc="Drop in video links, websites, or upload files." />
                     <Step number="02" title="Connect Nodes" desc="Drag wires to link your sources to an AI Chat node." />
                     <Step number="03" title="Generate" desc="Ask questions. The AI uses your connected nodes as ground truth." />
                  </div>
               </div>
               <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-start gap-4 mb-6">
                     <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0 flex items-center justify-center font-bold">U</div>
                     <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none text-sm text-slate-300">
                        Summarize the key takeaways from this video and the marketing doc.
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-purple-600 shrink-0 flex items-center justify-center"><Zap className="w-4 h-4 text-white"/></div>
                     <div className="bg-purple-900/20 border border-purple-500/20 p-3 rounded-lg rounded-tl-none text-sm text-purple-100">
                        Based on the <span className="text-red-400 font-medium">YouTube Video</span> and <span className="text-green-400 font-medium">Q4 Strategy Doc</span>, here is the summary...
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-300">
             <Layout className="w-5 h-5 text-slate-500" />
             <span>construct0r</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2024 construct0r. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 transition-all group">
    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-slate-100">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
   <div className="flex gap-4">
      <div className="text-xl font-bold text-slate-600">{number}</div>
      <div>
         <h4 className="font-semibold text-slate-200 mb-1">{title}</h4>
         <p className="text-sm text-slate-400">{desc}</p>
      </div>
   </div>
);
