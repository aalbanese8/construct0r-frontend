
import { Edge, Node } from 'reactflow';

export enum NodeType {
  VIDEO = 'video',
  WEB = 'web',
  TEXT = 'text',
  CHAT = 'chat',
  DRIVE = 'drive',
  NOTE = 'note',
}

export type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';

export type LoadingMessage =
  | 'Fetching transcript...'
  | 'Checking auto-captions...'
  | 'Downloading video...'
  | 'Compressing audio...'
  | 'Transcribing with AI...'
  | 'Almost done...';

export interface BaseNodeData {
  label?: string;
}

export interface SourceNodeData extends BaseNodeData {
  url?: string;
  text?: string;
  status: ExtractionStatus;
  errorMessage?: string;
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'web' | 'drive';
  title?: string;
  fileType?: string;
  loadingMessage?: LoadingMessage;
  loadingStartTime?: number;
}

export interface TextNodeData extends BaseNodeData {
  text: string;
  title: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ChatNodeData extends BaseNodeData {
  systemPrompt: string;
  userInput: string;
  messages: Message[];
  status: 'idle' | 'thinking' | 'success' | 'error';
  sourceCount?: number;
}

export interface Project {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Re-export specific node props for React Flow
export interface NodeProps<T> {
  id: string;
  data: T;
  selected: boolean;
}
