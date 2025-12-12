import React, { useState, useEffect } from 'react';
import { MCPAgent, ExecutionProfile, Plugin } from '../types';
import { Network, Plus, Trash2, RefreshCw, Link, Layers, Loader2, Zap } from 'lucide-react';
import { api } from '../services/api';

export const MCPAgents: React.FC = () => {
    const [agents, setAgents] = useState<MCPAgent[]>([]);
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [profiles, setProfiles] = useState<ExecutionProfile[]>([]);
    const [newAgentUrl, setNewAgentUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const [a, p, prof] = await Promise.all([
            api.getAgents(),
            api.getPlugins(),
            api.getExecutionProfiles()
        ]);
        setAgents(a);
        setPlugins(p);
        setProfiles(prof);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const addAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAgentUrl) return;
        
        // Use API to connect
        const newAgent = await api.connectAgent(newAgentUrl);
        setAgents([...agents, newAgent]);
        setNewAgentUrl('');
    };

    const removeAgent = (id: string) => {
        setAgents(agents.filter(a => a.id !== id));
    };

    const getPluginName = (id?: string) => plugins.find(p => p.id === id)?.name || 'Unknown Plugin';
    const getProfile = (id?: string) => profiles.find(p => p.id === id);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-auto custom-scrollbar">
             <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">MCP Mesh Aggregation</h2>
                    <p className="text-gray-400">Manage specialized agents and their execution profiles.</p>
                </div>
                <button 
                    onClick={loadData}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <RefreshCw size={16} /> Refresh Mesh
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Add New Connection</h3>
                <form onSubmit={addAgent} className="flex gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Link size={16} className="text-gray-500" />
                        </div>
                        <input 
                            type="url" 
                            value={newAgentUrl}
                            onChange={(e) => setNewAgentUrl(e.target.value)}
                            placeholder="http://localhost:8000/mcp"
                            className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button type="submit" className="bg-white text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Plus size={18} /> Connect
                    </button>
                </form>
            </div>

            <div className="grid gap-4">
                {agents.map(agent => {
                    const profile = getProfile(agent.executionProfileId);
                    
                    return (
                        <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 group hover:border-gray-700 transition-all relative overflow-hidden">
                            {/* Background Decoration */}
                            {profile && (
                                <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none select-none">
                                    <span className="text-[120px] grayscale">{profile.icon}</span>
                                </div>
                            )}

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-5 w-full">
                                    {/* Icon Box */}
                                    <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-inner ${agent.status === 'connected' ? 'bg-gray-800 text-gray-200' : 'bg-red-900/10 text-red-400'}`}>
                                        {profile ? profile.icon : <Network size={24} />}
                                    </div>

                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-bold text-gray-100">{agent.name}</h4>
                                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${agent.status === 'connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                    {agent.status === 'connected' ? 'Online' : 'Offline'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a href={agent.url} className="text-xs font-mono text-gray-600 hover:text-primary-400 transition-colors flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                                                    <Link size={12} />
                                                    {agent.url}
                                                </a>
                                                <button 
                                                    onClick={() => removeAgent(agent.id)}
                                                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                    title="Remove Agent"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Profile & Plugin Info Line */}
                                        <div className="flex items-center gap-3 text-sm py-1">
                                            {profile ? (
                                                <div className="flex items-center gap-2 text-blue-300 font-medium bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 shadow-sm">
                                                    <span className="text-lg leading-none">{profile.icon}</span>
                                                    <span>{profile.name} Profile</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-500 italic bg-gray-800/30 px-2 py-1 rounded-md">
                                                    <Zap size={14} />
                                                    <span>Standard Profile</span>
                                                </div>
                                            )}
                                            <span className="text-gray-800">|</span>
                                            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-800/30 px-2 py-1 rounded-md border border-transparent hover:border-gray-700 transition-colors">
                                                <Layers size={14} />
                                                <span>{getPluginName(agent.pluginId)}</span>
                                            </div>
                                        </div>

                                        {/* Capabilities */}
                                        <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-800/50">
                                            {agent.capabilities.map(cap => (
                                                <span key={cap} className="text-[11px] bg-gray-950 text-gray-500 px-2 py-0.5 rounded border border-gray-800 font-mono">
                                                    {cap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}