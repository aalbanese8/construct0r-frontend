import React, { ReactNode } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface BaseNodeProps {
  title: string;
  icon: LucideIcon;
  colorClass: string;
  selected?: boolean;
  children: ReactNode;
  inputs?: boolean;
  outputs?: boolean;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  icon: Icon,
  colorClass,
  selected,
  children,
  inputs = false,
  outputs = false,
  resizable = true,
  minWidth = 300,
  minHeight = 200,
}) => {
  return (
    <div
      className="relative w-full h-full group"
      style={{ minWidth, minHeight }}
    >
      {/* Resizer */}
      {resizable && (
        <NodeResizer 
          minWidth={minWidth} 
          minHeight={minHeight} 
          isVisible={selected} 
          lineClassName="border-primary" 
          handleClassName="h-3 w-3 bg-primary border-2 border-white rounded" 
        />
      )}

      {/* Main Content Card */}
      <div
        className={clsx(
          "flex flex-col w-full h-full rounded-xl bg-surface border-2 shadow-xl transition-all duration-200 overflow-hidden",
          selected ? "border-primary ring-2 ring-primary/20" : "border-border",
          "hover:border-slate-500"
        )}
      >
        {/* Header */}
        <div className={clsx("px-4 py-2 border-b border-border flex items-center gap-2 shrink-0", colorClass)}>
          <Icon className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
        </div>

        {/* Body */}
        <div className="p-4 bg-surface/95 backdrop-blur-sm flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>

      {/* Handles - Rendered outside to prevent clipping */}
      {inputs && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-slate-400 !border-2 !border-slate-800 -left-[6px] z-50"
        />
      )}
      {outputs && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-blue-400 !border-2 !border-slate-800 -right-[6px] z-50"
        />
      )}
    </div>
  );
};