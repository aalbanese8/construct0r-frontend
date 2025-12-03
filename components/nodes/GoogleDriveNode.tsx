import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { HardDrive, Loader2, FileText, AlertCircle, Video, Mic, FileSpreadsheet } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeProps, SourceNodeData } from '../../types';
import { pickFileFromDrive } from '../../services/driveService';

export const GoogleDriveNode: React.FC<NodeProps<SourceNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handlePickFile = useCallback(async () => {
    // Set status to loading
    setNodes((nodes) => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'loading', errorMessage: undefined } } : n));

    try {
      // Call service
      const result = await pickFileFromDrive();

      // Update result
      setNodes((nodes) => nodes.map(n => n.id === id ? { 
        ...n, 
        data: { 
          ...n.data, 
          status: result.status, 
          text: result.text,
          title: result.title,
          platform: result.platform,
          url: result.url,
          fileType: result.fileType
        } 
      } : n));
    } catch (error) {
      setNodes((nodes) => nodes.map(n => n.id === id ? { 
        ...n, 
        data: { 
            ...n.data, 
            status: 'error', 
            errorMessage: 'Failed to pick file from Drive' 
        } 
      } : n));
    }
  }, [id, setNodes]);

  const getIconForFileType = (fileType?: string) => {
    if (!fileType) return FileText;
    if (fileType.includes('video')) return Video;
    if (fileType.includes('audio')) return Mic;
    if (fileType.includes('spreadsheet')) return FileSpreadsheet;
    return FileText;
  };

  const FileIcon = getIconForFileType(data.fileType);

  return (
    <div className="w-full h-full">
      <BaseNode 
        title="Google Drive" 
        icon={HardDrive} 
        colorClass="bg-green-600" 
        selected={selected} 
        outputs 
        resizable
      >
        <div className="flex flex-col gap-3 h-full">
          
          {/* Action Area */}
          <div className="shrink-0">
             {data.status === 'idle' || data.status === 'error' ? (
                <button 
                  onClick={handlePickFile}
                  className="w-full py-3 px-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-green-500/50 rounded-lg flex items-center justify-center gap-2 transition-all group"
                >
                    <div className="bg-green-600/20 p-1.5 rounded-full group-hover:bg-green-600/30">
                        <HardDrive className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Select File from Drive</span>
                </button>
             ) : (
                <div className="w-full py-2 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg flex items-center gap-2">
                     <div className="bg-green-600/20 p-1 rounded">
                        <FileIcon className="w-3 h-3 text-green-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Selected File</div>
                        <div className="text-xs text-slate-200 truncate font-medium">{data.title || 'Untitled'}</div>
                     </div>
                     <button 
                        onClick={handlePickFile} 
                        className="text-[10px] text-slate-500 hover:text-white underline px-1"
                        disabled={data.status === 'loading'}
                     >
                        Change
                     </button>
                </div>
             )}
          </div>

          {/* Loading State */}
          {data.status === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  <span>Processing file...</span>
              </div>
          )}

          {/* Error State */}
          {data.status === 'error' && (
             <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded shrink-0">
               <AlertCircle className="w-4 h-4" />
               <span>{data.errorMessage || "Failed to load"}</span>
             </div>
          )}

          {/* Success Content Preview */}
          {data.status === 'success' && (
            <div className="flex flex-col gap-2 flex-1 min-h-0">
               <div className="bg-slate-900/50 p-3 rounded text-[10px] text-slate-400 font-mono flex-1 overflow-y-auto custom-scrollbar border border-slate-800 leading-relaxed whitespace-pre-wrap">
                 {data.text}
               </div>
               <div className="text-[10px] text-slate-600 text-right">
                  Source: Google Drive • {data.text?.length} chars
               </div>
            </div>
          )}
        </div>
      </BaseNode>
    </div>
  );
};