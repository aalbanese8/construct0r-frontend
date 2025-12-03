import React, { useState, useRef, useEffect } from 'react';
import { useReactFlow, useEdges, useNodes } from 'reactflow';
import { MessageSquare, Send, Sparkles, Box, Trash2, User, Bot } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { ChatNodeData, NodeProps, Message } from '../../types';
import { chatAPI } from '../../services/api';
import clsx from 'clsx';

export const ChatNode: React.FC<NodeProps<ChatNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isHovering, setIsHovering] = useState(false);

  // Helper to update node data
  const updateData = (updates: Partial<ChatNodeData>) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data.messages, data.status]);

  // Get connected source nodes
  const getSources = () => {
    const connectedSourceIds = edges
      .filter(edge => edge.target === id)
      .map(edge => edge.source);
    
    return nodes
      .filter(node => connectedSourceIds.includes(node.id))
      .map(node => ({
        id: node.id,
        type: node.type || 'unknown',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: node.data as any
      }));
  };

  const handleSend = async () => {
    if (!data.userInput.trim()) return;

    const currentQuery = data.userInput;
    const currentHistory = data.messages || [];

    // 1. Add User Message immediately
    const updatedMessages: Message[] = [
        ...currentHistory, 
        { role: 'user', text: currentQuery }
    ];

    updateData({ 
        status: 'thinking', 
        messages: updatedMessages,
        userInput: '' 
    });

    try {
      const sources = getSources();
      
      // Filter out sources that aren't ready
      const validSources = sources
        .filter(s => {
           if (s.type === 'text') return !!s.data.text;
           if (s.type === 'chat') return s.data.messages && s.data.messages.length > 0;
           return s.data.status === 'success' && !!s.data.text;
        })
        .map(s => {
          let content = '';
          if (s.type === 'chat') {
             // Extract conversation history as text context for the next node
             // This enables chaining: Chat A -> Chat B
             content = s.data.messages
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((m: any) => `${m.role.toUpperCase()}: ${m.text}`)
                .join('\n');
          } else {
             content = s.data.text || '';
          }
          
          return {
            type: s.type,
            title: s.data.title || s.type,
            content
          };
        });

      // 2. Call API with history + current query
      const response = await chatAPI.sendMessage(
        currentQuery,
        currentHistory,
        validSources,
        data.systemPrompt
      );

      const responseText = response.response;

      // 3. Add Model Response
      updateData({ 
        status: 'success', 
        messages: [...updatedMessages, { role: 'model', text: responseText || "No response generated." }],
        sourceCount: validSources.length
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : "Could not generate response.";
      updateData({
        status: 'error',
        messages: [...updatedMessages, { role: 'model', text: `Error: ${errorMessage}` }]
      });
    }
  };

  const handleClearChat = () => {
      updateData({ messages: [], status: 'idle' });
  };

  const sources = getSources();
  const activeSources = sources.length;
  const messages = data.messages || [];

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="w-full h-full"
    >
        <BaseNode
          title="AI Chat (OpenAI)"
          icon={Sparkles}
          colorClass="bg-accent"
          selected={selected}
          inputs
          outputs
          resizable
          minWidth={400}
          minHeight={500}
        >
        <div className="flex flex-col gap-3 h-full">
            {/* System Prompt / Role */}
            <div className="border-b border-slate-700 pb-2 mb-1 shrink-0 flex justify-between items-center gap-2">
                <input
                    className="nodrag w-full bg-transparent text-xs font-medium text-purple-300 placeholder:text-purple-300/50 focus:outline-none"
                    placeholder="Assign a role (e.g., 'YouTube Script Writer')"
                    value={data.systemPrompt}
                    onChange={(e) => updateData({ systemPrompt: e.target.value })}
                />
                {messages.length > 0 && (
                    <button 
                        onClick={handleClearChat}
                        className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400 transition-colors"
                        title="Clear History"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Source Status */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/30 p-1.5 rounded shrink-0">
                <Box className="w-3 h-3" />
                <span>{activeSources} source{activeSources !== 1 ? 's' : ''} connected</span>
            </div>

            {/* Chat History Area */}
            <div
                ref={scrollRef}
                className="nodrag flex-1 bg-slate-900 border border-slate-700 rounded p-3 text-xs overflow-y-auto custom-scrollbar min-h-[100px] flex flex-col gap-3"
                onWheel={(e) => e.stopPropagation()}
            >
                {messages.length === 0 && (
                  <div className="text-slate-600 italic text-center mt-10">
                    Connect sources and start chatting...
                  </div>
                )}

                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={clsx(
                            "flex gap-2 max-w-[90%]",
                            msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                        )}
                    >
                        <div className={clsx(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            msg.role === 'user' ? "bg-purple-600" : "bg-slate-700"
                        )}>
                            {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-purple-300" />}
                        </div>
                        <div className={clsx(
                            "p-2 rounded-lg leading-relaxed whitespace-pre-wrap",
                            msg.role === 'user' ? "bg-purple-600/20 text-purple-50" : "bg-slate-800 text-slate-200"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {data.status === 'thinking' && (
                    <div className="flex gap-2 max-w-[90%] self-start">
                         <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-purple-300" />
                        </div>
                        <div className="bg-slate-800 p-2 rounded-lg flex items-center gap-2 text-slate-400">
                             <Sparkles className="w-3 h-3 animate-pulse" />
                             <span>Thinking...</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Input Area */}
            <div className="relative mt-2 shrink-0">
            <textarea
                className="nodrag w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none h-20 custom-scrollbar"
                placeholder="Ask something..."
                value={data.userInput}
                onChange={(e) => updateData({ userInput: e.target.value })}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
                }}
            />
            <button
                onClick={handleSend}
                disabled={data.status === 'thinking' || !data.userInput.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
                {data.status === 'thinking' ? <Sparkles className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
            </button>
            </div>
        </div>
        </BaseNode>
    </div>
  );
};