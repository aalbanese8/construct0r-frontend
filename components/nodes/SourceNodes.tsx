import React, { useCallback, useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Youtube, Globe, Type, AlertCircle, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { extractContent } from '../../services/extractor';
import { SourceNodeData, TextNodeData, NodeProps } from '../../types';

// --- VIDEO NODE ---
export const VideoNode: React.FC<NodeProps<SourceNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const [urlInput, setUrlInput] = useState(data.url || '');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const processUrl = useCallback(async (url: string) => {
    if (!url) return;
    
    // Update status to loading
    setNodes((nodes) => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'loading', url } } : n));

    // Call service
    const result = await extractContent(url, 'video');

    // Update result
    setNodes((nodes) => nodes.map(n => n.id === id ? { 
      ...n, 
      data: { 
        ...n.data, 
        status: result.status, 
        text: result.text,
        title: result.title,
        platform: result.platform,
        errorMessage: result.errorMessage
      } 
    } : n));
  }, [id, setNodes]);

  const handleBlur = () => {
    if (urlInput !== data.url) {
      processUrl(urlInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processUrl(urlInput);
    }
  };

  return (
    <div className="w-full h-full">
      <BaseNode title="Video Transcript" icon={Youtube} colorClass="bg-red-600" selected={selected} outputs resizable>
        <div className="flex flex-col gap-3 h-full">
          <div className="relative shrink-0">
              <input
              type="text"
              className="nodrag w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
              placeholder="Paste YouTube, TikTok, IG URL..."
              value={urlInput}
              onChange={handleUrlChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              />
              {data.status === 'loading' && <Loader2 className="absolute right-2 top-2 w-4 h-4 animate-spin text-slate-400" />}
          </div>

          {data.status === 'error' && (
             <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded shrink-0">
               <AlertCircle className="w-4 h-4" />
               <span>{data.errorMessage || "Failed to load"}</span>
             </div>
          )}

          {data.status === 'success' && (
            <div className="flex flex-col gap-2 flex-1 min-h-0">
               <div className="flex items-center gap-2 text-green-400 text-xs shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="font-medium truncate max-w-[200px]">{data.title}</span>
               </div>
               <div className="bg-slate-900/50 p-2 rounded text-[10px] text-slate-400 font-mono flex-1 overflow-y-auto custom-scrollbar border border-slate-800">
                 {data.text}
               </div>
            </div>
          )}
        </div>
      </BaseNode>
    </div>
  );
};

// --- WEB NODE ---
export const WebNode: React.FC<NodeProps<SourceNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const [urlInput, setUrlInput] = useState(data.url || '');

  const processUrl = useCallback(async (url: string) => {
    if (!url) return;
    setNodes((nodes) => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'loading', url } } : n));
    const result = await extractContent(url, 'web');
    setNodes((nodes) => nodes.map(n => n.id === id ? { 
      ...n, 
      data: { ...n.data, status: result.status, text: result.text, title: result.title, errorMessage: result.errorMessage } 
    } : n));
  }, [id, setNodes]);

  return (
    <div className="w-full h-full">
      <BaseNode title="Web Page Context" icon={Globe} colorClass="bg-blue-600" selected={selected} outputs resizable>
        <div className="flex flex-col gap-3 h-full">
          <input
            type="text"
            className="nodrag w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 shrink-0"
            placeholder="https://example.com/article..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={() => urlInput !== data.url && processUrl(urlInput)}
            onKeyDown={(e) => e.key === 'Enter' && processUrl(urlInput)}
          />
          
          {data.status === 'loading' && <div className="text-xs text-slate-400 flex items-center gap-2 shrink-0"><Loader2 className="w-3 h-3 animate-spin"/> Fetching...</div>}
          
          {data.status === 'success' && (
             <div className="bg-slate-900/50 p-2 rounded text-[10px] text-slate-400 font-mono flex-1 overflow-y-auto custom-scrollbar border border-slate-800">
               {data.text}
             </div>
          )}
        </div>
      </BaseNode>
    </div>
  );
};

// --- TEXT NODE ---
export const TextNode: React.FC<NodeProps<TextNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handleChange = (field: keyof TextNodeData, value: string) => {
    setNodes((nodes) => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  };

  return (
    <div className="w-full h-full">
      <BaseNode title="Text Prompt" icon={Type} colorClass="bg-orange-500" selected={selected} outputs resizable>
        <div className="flex flex-col gap-2 h-full">
          <input 
             className="nodrag w-full bg-transparent border-none text-sm font-semibold text-slate-200 focus:ring-0 placeholder:text-slate-500 mb-1 shrink-0"
             placeholder="Untitled Node"
             value={data.title}
             onChange={(e) => handleChange('title', e.target.value)}
          />
          <textarea
            className="nodrag w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600 custom-scrollbar resize-none flex-1"
            placeholder="Enter manual context or instructions here..."
            value={data.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
          <div className="text-[10px] text-slate-500 text-right shrink-0">{data.text?.length || 0} chars</div>
        </div>
      </BaseNode>
    </div>
  );
};