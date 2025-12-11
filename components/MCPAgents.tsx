import React, { useState, useEffect } from 'react';
import { MCPAgent, ExecutionProfile, Plugin } from '../types';
import { Network, Plus, Trash2, RefreshCw, Link, Layers, Loader2 } from 'lucide-react';
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
                        <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-between group hover:border-gray-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${agent.status === 'connected' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Network size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-200 flex items-center gap-2">
                                        {agent.name}
                                        <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-normal border border-gray-700 flex items-center gap-1">
                                            <Layers size={10} /> {getPluginName(agent.pluginId)}
                                        </span>
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <a href={agent.url} className="text-sm text-gray-500 hover:text-primary-400 transition-colors">{agent.url}</a>
                                        {profile && (
                                            <span className="text-xs text-blue-400 flex items-center gap-1 bg-blue-900/10 px-2 py-0.5 rounded border border-blue-900/30">
                                                {profile.icon} {profile.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {agent.capabilities.map(cap => (
                                            <span key={cap} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">{cap}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className={`text-xs font-mono uppercase tracking-wider ${agent.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
                                    {agent.status}
                                </span>
                                <button 
                                    onClick={() => removeAgent(agent.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
