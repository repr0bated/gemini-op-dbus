import React, { useState, useRef, useEffect } from 'react';
import { DBusService, OrchestrationStep, Skill, MCPAgent, Plugin, ExecutionProfile } from '../types';
import { Bot, Terminal, CheckCircle2, ArrowRight, Loader2, Cpu, Wrench, Layers, Database, Activity } from 'lucide-react';
import clsx from 'clsx';
import { aiService } from '../services/aiService';
import { api } from '../services/api';

interface OrchestratorProps {
    services: DBusService[];
}

export const Orchestrator: React.FC<OrchestratorProps> = ({ services }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{role: 'user' | 'assistant', steps: OrchestrationStep[]}[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePlugin, setActivePlugin] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Local state for fetched metadata
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [agents, setAgents] = useState<MCPAgent[]>([]);
    const [profiles, setProfiles] = useState<ExecutionProfile[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [p, s, a, prof] = await Promise.all([
                api.getPlugins(),
                api.getSkills(),
                api.getAgents(),
                api.getExecutionProfiles()
            ]);
            setPlugins(p);
            setSkills(s);
            setAgents(a);
            setProfiles(prof);
        };
        loadData();
    }, []);

    // Get icon for profile
    const getProfileIcon = (id?: string) => {
        const p = profiles.find(p => p.id === id);
        return p ? p.icon : '⚡';
    };

    // Construct a context summary for the AI
    const getSystemContext = () => {
        const activeServices = services.filter(s => s.status === 'active').map(s => s.name);
        const activeAgents = agents.filter(a => a.status === 'connected').map(a => `${a.name} (${a.url})`);
        
        return `
            [SYSTEM STATE SNAPSHOT]
            Active DBus Services (${activeServices.length}): ${activeServices.join(', ')}
            Connected MCP Agents (${activeAgents.length}): ${activeAgents.join(', ')}
            
            [ORCHESTRATION RULES]
            1. If a user asks to query a DBus service that is NOT active, you must attempt to start it first or report it as offline.
            2. Prefer using connected MCP agents for specialized tasks (e.g., use 'Docker Orchestrator' for container tasks).
        `;
    };

    // Flatten tools for the prompt with profile info
    const getAvailableTools = () => {
        const tools: string[] = [];
        
        // Local DBus Tools
        services.forEach(s => {
            // Include active services in tool list
            s.objects.forEach(o => {
                o.interfaces.forEach(i => {
                    i.methods.forEach(m => {
                        const args = m.args.filter(a => a.direction === 'in').map(a => `${a.name}: ${a.type}`).join(', ');
                        tools.push(`[System] DBUS: ${s.name} ${i.name}.${m.name}(${args})`);
                    });
                });
            });
        });

        // Agent Tools
        agents.forEach(a => {
            if(a.status !== 'connected') return;
            const profile = profiles.find(p => p.id === a.executionProfileId);
            const profileName = profile ? profile.name : 'Standard';
            a.capabilities.forEach(c => {
                tools.push(`[${profileName}] AGENT [${a.name}]: ${c}`);
            });
        });

        // Built-in Skills
        skills.forEach(skill => {
            const profile = profiles.find(p => p.id === skill.executionProfileId);
            const profileName = profile ? profile.name : 'Standard';
            const params = Object.entries(skill.parameters).map(([k, v]) => `${k}: ${v}`).join(', ');
            tools.push(`[${profileName}] SKILL [${skill.category}]: ${skill.name}(${params}) - ${skill.description}`);
        });

        return tools;
    };

    const handleExecute = async () => {
        if (!input.trim() || isProcessing) return;

        const userMsg = input;
        setInput('');
        setIsProcessing(true);

        setHistory(prev => [...prev, { role: 'user', steps: [{ id: Date.now().toString(), type: 'thought', content: userMsg, timestamp: Date.now() }] }]);

        try {
            // Pass context to AI
            const context = getSystemContext();
            const tools = getAvailableTools();
            
            const plan = await aiService.generateOrchestrationPlan(userMsg, tools, context);
            
            const newHistoryIdx = history.length + 1;
            
            const updateHistory = (newStep: OrchestrationStep) => {
                setHistory(prev => {
                    const copy = [...prev];
                    if (copy.length === newHistoryIdx) {
                        copy[newHistoryIdx - 1].steps.push(newStep);
                    } else {
                        copy.push({ role: 'assistant', steps: [newStep] });
                    }
                    return copy;
                });
            };

            for (const step of plan) {
                // Simulate thinking time based on profile?
                await new Promise(r => setTimeout(r, 600));
                
                const stepData: OrchestrationStep = {
                    id: Math.random().toString(36),
                    type: step.type as any,
                    content: step.content,
                    toolName: step.toolName,
                    args: step.args,
                    timestamp: Date.now(),
                    executionProfile: step.executionProfile
                };
                updateHistory(stepData);

                if (step.type === 'call' && step.toolName) {
                    // Context-aware tool execution
                    // We pass the context here so the "Simulator" knows that if we call 'GetUnit' on 'systemd', it should succeed if systemd is in the active list.
                    const resultJson = await aiService.executeTool(step.toolName, step.args, `User Prompt: ${userMsg}\nSystem Context: ${context}`);
                    
                    updateHistory({
                        id: Math.random().toString(36),
                        type: 'result',
                        content: resultJson,
                        timestamp: Date.now()
                    });
                }
            }

        } catch (error) {
            console.error(error);
            const errStep: OrchestrationStep = {
                id: Date.now().toString(),
                type: 'error',
                content: "Orchestration failed. Please try again.",
                timestamp: Date.now()
            };
             setHistory(prev => {
                const copy = [...prev];
                if (copy.length === history.length + 1) {
                    copy[history.length].steps.push(errStep);
                } else {
                    copy.push({ role: 'assistant', steps: [errStep] });
                }
                return copy;
            });
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="flex h-full bg-gray-950">
            {/* Left Panel: Plugin & Tool Registry */}
            <div className="w-80 border-r border-gray-800 bg-gray-900/30 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={14} /> Plugin Registry
                    </h2>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                         <Activity size={10} className="text-green-500 animate-pulse" />
                         <span className="text-[10px] text-green-400 font-mono">LIVE CTX</span>
                    </div>
                </div>
                {plugins.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center text-gray-500">
                        <Loader2 className="animate-spin" size={24} />
                     </div>
                ) : (
                    <div className="flex-1 overflow-auto p-2 space-y-2 custom-scrollbar">
                        {plugins.map(plugin => {
                            const pluginSkills = skills.filter(s => s.pluginId === plugin.id);
                            const pluginAgents = agents.filter(a => a.pluginId === plugin.id);
                            const isOpen = activePlugin === plugin.id;

                            return (
                                <div key={plugin.id} className="border border-gray-800 rounded-lg bg-gray-900/50 overflow-hidden">
                                    <button 
                                        onClick={() => setActivePlugin(isOpen ? null : plugin.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-800 p-1.5 rounded text-gray-300">
                                                {plugin.id.includes('dev') ? <Terminal size={14} /> : 
                                                plugin.id.includes('data') ? <Database size={14} /> : 
                                                plugin.id.includes('ops') ? <Cpu size={14} /> : <Wrench size={14} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-gray-200">{plugin.name}</div>
                                                <div className="text-[10px] text-gray-500">{pluginSkills.length} Skills • {pluginAgents.length} Agents</div>
                                            </div>
                                        </div>
                                        <div className={clsx("transition-transform text-gray-500", isOpen ? "rotate-90" : "")}>
                                            <ArrowRight size={14} />
                                        </div>
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="bg-gray-950/50 p-2 space-y-2 border-t border-gray-800">
                                            {/* Skills */}
                                            {pluginSkills.map(skill => (
                                                <div key={skill.id} className="pl-3 py-1 text-xs group cursor-help">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-primary-400 font-mono">{skill.name}</span>
                                                        <span title="Execution Profile">{getProfileIcon(skill.executionProfileId)}</span>
                                                    </div>
                                                    <div className="text-gray-500 truncate">{skill.description}</div>
                                                </div>
                                            ))}
                                            {/* Agents */}
                                            {pluginAgents.map(agent => (
                                                <div key={agent.id} className="pl-3 py-1 text-xs border-l-2 border-green-500/50 ml-1">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="text-green-400 font-bold">{agent.name}</span>
                                                        <span title="Execution Profile">{getProfileIcon(agent.executionProfileId)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {agent.capabilities.map(cap => (
                                                            <span key={cap} className="bg-gray-800 text-gray-500 px-1 rounded-[2px]">{cap}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Panel: Chat Interface */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto p-6 space-y-8 custom-scrollbar" ref={scrollRef}>
                    {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Bot size={64} className="mb-4 text-gray-700" />
                            <h3 className="text-xl font-bold text-gray-500">Agent Skills Enabled</h3>
                            <p className="max-w-md text-center mt-2 text-sm">
                                47 specialized skills extending model capabilities across 65 focused plugins.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-300">{plugins.length}</div>
                                    <div className="text-xs text-gray-500">Plugins</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-300">{skills.length}</div>
                                    <div className="text-xs text-gray-500">Skills</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-300">{agents.length}</div>
                                    <div className="text-xs text-gray-500">Agents</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {history.map((entry, idx) => (
                        <div key={idx} className={clsx("flex gap-4 max-w-4xl mx-auto", entry.role === 'user' ? 'flex-row-reverse' : '')}>
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                entry.role === 'assistant' ? 'bg-primary-600/20 text-primary-400' : 'bg-gray-700/50 text-gray-300'
                            )}>
                                {entry.role === 'assistant' ? <Bot size={20} /> : <div className="text-sm font-bold">U</div>}
                            </div>
                            
                            <div className={clsx(
                                "flex-1 rounded-xl p-4 space-y-3",
                                entry.role === 'assistant' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-800'
                            )}>
                                {entry.steps.map((step) => (
                                    <div key={step.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {step.type === 'thought' && (
                                            <div className="text-gray-400 italic text-sm mb-2 flex gap-2">
                                                <div className="w-1 h-full bg-gray-600 rounded-full"></div>
                                                {step.content}
                                            </div>
                                        )}
                                        
                                        {step.type === 'call' && (
                                            <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 font-mono text-xs my-2 relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-yellow-500 font-bold flex items-center gap-2">
                                                        <Terminal size={12} /> TOOL CALL
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {step.executionProfile && (
                                                            <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 border border-gray-700">
                                                                {step.executionProfile}
                                                            </span>
                                                        )}
                                                        <span className="text-gray-600">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-primary-400 font-bold mb-1">{step.toolName}</div>
                                                <div className="text-gray-500 overflow-x-auto whitespace-pre-wrap">
                                                    {JSON.stringify(step.args, null, 2)}
                                                </div>
                                            </div>
                                        )}

                                        {step.type === 'result' && (
                                            <div className="bg-gray-950/50 rounded-lg border border-gray-800/50 p-2 font-mono text-xs text-green-400/80 flex items-center gap-2">
                                                <CheckCircle2 size={12} className="flex-shrink-0" />
                                                <span className="overflow-x-auto whitespace-pre-wrap max-h-40 custom-scrollbar block w-full">{step.content}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {entry.role === 'assistant' && isProcessing && idx === history.length - 1 && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 animate-pulse">
                                        <Loader2 size={12} className="animate-spin" /> Processing step...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur">
                    <div className="max-w-4xl mx-auto relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                            placeholder="Describe a task (e.g., 'Analyze the security logs and generate a report')..."
                            disabled={isProcessing}
                            className="w-full bg-gray-950 border border-gray-700 rounded-xl py-4 pl-5 pr-14 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-lg shadow-black/50 disabled:opacity-50"
                        />
                        <button 
                            onClick={handleExecute}
                            disabled={!input.trim() || isProcessing}
                            className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-800 text-white p-2.5 rounded-lg transition-all flex items-center justify-center"
                        >
                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};