import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, Microscope, Network, Settings, Terminal, Activity, Bot } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewMode.INTROSPECTOR, label: 'Introspector', icon: Microscope },
    { id: ViewMode.MCP_AGENTS, label: 'MCP Mesh', icon: Network },
    { id: ViewMode.ORCHESTRATOR, label: 'Orchestrator', icon: Bot },
    { id: ViewMode.SETTINGS, label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="bg-primary-600 p-2 rounded-lg">
            <Terminal size={20} className="text-white" />
        </div>
        <div>
            <h1 className="font-bold text-gray-100 tracking-tight">op-dbus-v2</h1>
            <span className="text-xs text-primary-400 font-mono">READY=1</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-900/20 text-primary-400 border border-primary-800/50'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-green-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-400">System Status</span>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>CPU</span>
                    <span>1.2%</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[1.2%]"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>RAM</span>
                    <span>42MB</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary-500 h-full w-[15%]"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;