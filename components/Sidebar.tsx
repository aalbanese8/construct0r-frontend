import React, { useState } from 'react';
import { Plus, Layout, Trash2, FolderOpen, ChevronRight, ChevronLeft, LogOut } from 'lucide-react';
import { Project, User } from '../types';
import clsx from 'clsx';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  user: User;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  user,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={clsx(
        "bg-surface border-r border-border flex flex-col transition-all duration-300 relative z-20 h-full",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-slate-700 border border-slate-600 rounded-full p-0.5 text-slate-300 hover:text-white z-50 shadow-md"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0 h-16">
        {!collapsed && (
           <div className="flex items-center gap-2 font-bold text-slate-100">
             <div className="bg-primary/20 p-1.5 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
             </div>
             <span className="tracking-tight">construct0r</span>
           </div>
        )}
        {collapsed && (
            <div className="w-full flex justify-center">
                 <Layout className="w-5 h-5 text-primary" />
            </div>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
         {!collapsed && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-2">Projects</div>}
         
         {projects.map(project => (
           <button
             key={project.id}
             onClick={() => onSelectProject(project.id)}
             className={clsx(
               "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative",
               activeProjectId === project.id 
                 ? "bg-primary/10 text-white shadow-sm border border-primary/20" 
                 : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
             )}
             title={project.name}
           >
             <FolderOpen className={clsx(
                "w-4 h-4 shrink-0", 
                activeProjectId === project.id ? "text-primary" : "text-slate-500 group-hover:text-slate-400"
             )} />
             
             {!collapsed && (
                <>
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    {projects.length > 1 && (
                        <div 
                            onClick={(e) => onDeleteProject(project.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 hover:text-red-300 rounded transition-all absolute right-2"
                        >
                            <Trash2 className="w-3 h-3" />
                        </div>
                    )}
                </>
             )}
           </button>
         ))}
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-border bg-surface shrink-0 flex flex-col gap-3">
        {/* Create Project */}
        <button
          onClick={onCreateProject}
          className={clsx(
            "flex items-center justify-center gap-2 w-full bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20",
            collapsed ? "p-2 aspect-square" : "py-2.5 px-4"
          )}
          title="Create New Project"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">New Project</span>}
        </button>

        <div className="h-px bg-slate-700/50 mx-1"></div>

        {/* User Profile */}
        <div className={clsx("flex items-center gap-3", collapsed ? "justify-center flex-col" : "px-1")}>
             <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
               {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
               )}
             </div>
             
             {!collapsed && (
               <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
               </div>
             )}

             <button 
                onClick={onLogout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Sign Out"
             >
                <LogOut className="w-4 h-4" />
             </button>
        </div>
      </div>
    </div>
  );
};