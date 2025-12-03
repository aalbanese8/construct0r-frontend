
import React from 'react';
import { useReactFlow } from 'reactflow';
import { StickyNote } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeProps, TextNodeData } from '../../types';

export const NoteNode: React.FC<NodeProps<TextNodeData>> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handleChange = (field: keyof TextNodeData, value: string) => {
    setNodes((nodes) => nodes.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n));
  };

  return (
    <div className="w-full h-full">
      <BaseNode 
        title="Sticky Note" 
        icon={StickyNote} 
        colorClass="bg-yellow-500" 
        selected={selected} 
        outputs 
        resizable
      >
        <div className="flex flex-col h-full -m-2 p-2 rounded bg-yellow-500/5">
           <input 
             className="nodrag w-full bg-transparent border-none text-sm font-bold text-yellow-100 focus:ring-0 placeholder:text-yellow-500/50 mb-2 shrink-0 px-2"
             placeholder="Note Title"
             value={data.title}
             onChange={(e) => handleChange('title', e.target.value)}
          />
          <textarea
            className="nodrag w-full bg-yellow-900/20 border-none rounded p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-colors placeholder:text-slate-500 custom-scrollbar resize-none flex-1 leading-relaxed font-medium"
            placeholder="Type your note here..."
            value={data.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
        </div>
      </BaseNode>
    </div>
  );
};
