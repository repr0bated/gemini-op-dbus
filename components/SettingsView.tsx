import React, { useState, useEffect, useRef } from 'react';
import { Save, Server, Terminal, CheckCircle2, AlertCircle, HardDrive, DownloadCloud, Play } from 'lucide-react';
import clsx from 'clsx';
import { aiService } from '../services/aiService';

export const SettingsView: React.FC = () => {
    const [config, setConfig] = useState({
        port: '8080',
        logLevel: 'info',
        installPath: '/usr/local/bin/op-dbus-v2',
        configPath: '/etc/op-dbus/config.json',
        enableRemote: false
    });
    
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const terminalRef = useRef<HTMLDivElement>(null);
    const logBuffer = useRef<string>("");

    const addLogs = (textChunk: string) => {
        // Append new chunk to buffer
        logBuffer.current += textChunk;
        
        // Split by newline to get lines
        const lines = logBuffer.current.split('\n');
        
        // If the last line is not empty, it means it's an incomplete line (stream still coming),
        // keep it in the buffer. Otherwise, the last split element is an empty string from the last \n.
        if (lines.length > 1) {
             const completeLines = lines.slice(0, -1);
             setDeployLogs(prev => [...prev, ...completeLines]);
             
             // Keep the last part in buffer
             logBuffer.current = lines[lines.length - 1];
        }
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [deployLogs]);

    const handleDeploy = async () => {
        setIsDeploying(true);
        setDeployStatus('idle');
        setDeployLogs([]);
        logBuffer.current = "";
        
        try {
            // Real-time streaming from AI Service
            for await (const chunk of aiService.streamDeploymentLogs(config)) {
                addLogs(chunk);
            }
            
            // Flush remaining buffer
            if (logBuffer.current.trim()) {
                setDeployLogs(prev => [...prev, logBuffer.current]);
            }
            
            setDeployStatus('success');
        } catch (e) {
            console.error(e);
            setDeployLogs(prev => [...prev, `[CRITICAL ERROR] Deployment failed: ${(e as Error).message}`]);
            setDeployStatus('error');
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-auto custom-scrollbar">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">System Configuration</h2>
                <p className="text-gray-400">Configure and deploy the op-dbus-v2 daemon to your local environment.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Form */}
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <Server size={20} className="text-primary-500" /> 
                            Daemon Settings
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Listen Port</label>
                                <input 
                                    type="number" 
                                    value={config.port}
                                    onChange={(e) => setConfig({...config, port: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Log Level</label>
                                <select 
                                    value={config.logLevel}
                                    onChange={(e) => setConfig({...config, logLevel: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="debug">DEBUG</option>
                                    <option value="info">INFO</option>
                                    <option value="warn">WARN</option>
                                    <option value="error">ERROR</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="remote"
                                    checked={config.enableRemote}
                                    onChange={(e) => setConfig({...config, enableRemote: e.target.checked})}
                                    className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="remote" className="text-sm text-gray-300">Enable Remote Access (0.0.0.0)</label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                            <HardDrive size={20} className="text-purple-500" /> 
                            Installation Paths
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Binary Location</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={config.installPath}
                                        onChange={(e) => setConfig({...config, installPath: e.target.value})}
                                        className="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Config Location</label>
                                <input 
                                    type="text" 
                                    value={config.configPath}
                                    onChange={(e) => setConfig({...config, configPath: e.target.value})}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className={clsx(
                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                            isDeploying 
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                : "bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white shadow-lg shadow-primary-900/20"
                        )}
                    >
                        {isDeploying ? <DownloadCloud className="animate-bounce" /> : <Play fill="currentColor" />}
                        {isDeploying ? "Run Real-time Deployment" : "Deploy to Local System"}
                    </button>
                </div>

                {/* Deployment Console */}
                <div className="flex flex-col h-full min-h-[500px] bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-gray-400" />
                            <span className="text-xs font-mono text-gray-400">Deployment Log (Live Stream)</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>
                    <div 
                        ref={terminalRef}
                        className="flex-1 p-4 font-mono text-xs overflow-auto space-y-1 text-gray-300"
                    >
                        {deployLogs.length === 0 && !isDeploying && (
                            <div className="text-gray-600 italic opacity-50 select-none">
                                Waiting for deployment trigger...
                            </div>
                        )}
                        {deployLogs.map((log, i) => (
                            <div key={i} className="break-all">
                                <span className="text-gray-600 mr-2">$</span>
                                {log}
                            </div>
                        ))}
                        {/* Cursor Blinking Effect */}
                        {isDeploying && (
                             <div className="animate-pulse text-primary-500">_</div>
                        )}
                        {deployStatus === 'success' && (
                            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-400 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                System successfully deployed and running.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
