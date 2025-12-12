import React, { useState, useEffect, useRef } from 'react';
import { Save, Server, Terminal, CheckCircle2, AlertCircle, HardDrive, DownloadCloud, Play, Copy, Box, Command, Database } from 'lucide-react';
import clsx from 'clsx';
import { aiService } from '../services/aiService';

export const SettingsView: React.FC = () => {
    const [config, setConfig] = useState({
        port: '8080',
        logLevel: 'info',
        storage: 'sqlite',
        installPath: '/usr/local/bin/op-dbus-v2',
        configPath: '/etc/op-dbus/config.json',
        enableRemote: false
    });
    
    const [activeTab, setActiveTab] = useState<'deploy' | 'manual'>('deploy');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [copied, setCopied] = useState(false);
    
    const terminalRef = useRef<HTMLDivElement>(null);
    const logBuffer = useRef<string>("");

    const addLogs = (textChunk: string) => {
        logBuffer.current += textChunk;
        const lines = logBuffer.current.split('\n');
        if (lines.length > 1) {
             const completeLines = lines.slice(0, -1);
             setDeployLogs(prev => [...prev, ...completeLines]);
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
            for await (const chunk of aiService.streamDeploymentLogs(config)) {
                addLogs(chunk);
            }
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

    const generateInstallScript = () => {
        return `
#!/bin/bash
# op-dbus-v2 Installer
set -e

echo ">> Downloading op-dbus-v2 agent..."
# Mock download command
curl -L https://releases.op-dbus.io/v2/latest/agent -o ${config.installPath}
chmod +x ${config.installPath}

echo ">> Generating Configuration at ${config.configPath}..."
mkdir -p $(dirname ${config.configPath})
cat <<EOF > ${config.configPath}
{
  "port": ${config.port},
  "logLevel": "${config.logLevel}",
  "storage": "${config.storage}",
  "remote": ${config.enableRemote},
  "mcp_enabled": true
}
EOF

echo ">> Creating Systemd Service..."
cat <<EOF > /etc/systemd/system/op-dbus.service
[Unit]
Description=OP-DBus v2 Agent (Introspector)
After=network.target

[Service]
ExecStart=${config.installPath} --config ${config.configPath}
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

echo ">> Starting Service..."
systemctl daemon-reload
systemctl enable op-dbus
systemctl start op-dbus

echo ">> Installation Complete! Listening on port ${config.port}"
`.trim();
    };

    const copyScript = () => {
        navigator.clipboard.writeText(generateInstallScript());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-auto custom-scrollbar">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">System Configuration</h2>
                    <p className="text-gray-400">Configure, deploy, or manually install the op-dbus-v2 daemon.</p>
                </div>
                <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('deploy')}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'deploy' ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <Play size={14} /> Auto Deploy
                    </button>
                    <button 
                        onClick={() => setActiveTab('manual')}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'manual' ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <Terminal size={14} /> Manual Install
                    </button>
                </div>
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

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Persistence</label>
                                    <select 
                                        value={config.storage}
                                        onChange={(e) => setConfig({...config, storage: e.target.value})}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option value="sqlite">SQLite (Default)</option>
                                        <option value="json">JSON File</option>
                                        <option value="memory">In-Memory</option>
                                        <option value="postgres">PostgreSQL</option>
                                    </select>
                                </div>
                            </div>

                            {config.storage === 'postgres' && (
                                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-start gap-2">
                                    <Database size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>
                                        External DB Mode: The agent will require <code>DATABASE_URL</code> env var to start. 
                                        Schema migration will run automatically on first boot.
                                    </span>
                                </div>
                            )}

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
                </div>

                {/* Right Panel: Deployment Console OR Manual Instructions */}
                {activeTab === 'deploy' ? (
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
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                    <Server size={32} className="opacity-20" />
                                    <p className="opacity-50 select-none">Ready to deploy...</p>
                                    <button 
                                        onClick={handleDeploy}
                                        disabled={isDeploying}
                                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-primary-900/20 flex items-center gap-2"
                                    >
                                        <Play size={16} fill="currentColor" /> Run Deployment
                                    </button>
                                </div>
                            )}
                            {deployLogs.map((log, i) => (
                                <div key={i} className="break-all">
                                    <span className="text-gray-600 mr-2">$</span>
                                    {log}
                                </div>
                            ))}
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
                ) : (
                    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl border border-gray-800 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Command size={20} className="text-gray-400" /> 
                                Manual Installation
                            </h3>
                            <p className="text-sm text-gray-400">
                                Run this script on your Linux machine to install the daemon with current settings.
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={copyScript}
                                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 border border-gray-700"
                                >
                                    {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                                    {copied ? "Copied" : "Copy Script"}
                                </button>
                            </div>
                            <pre className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto custom-scrollbar h-[350px]">
                                {generateInstallScript()}
                            </pre>
                        </div>

                        <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                            <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                <Box size={14} className="text-blue-500" /> Docker Alternative
                            </h4>
                            <div className="font-mono text-xs text-gray-400 break-all bg-gray-900 p-2 rounded border border-gray-800 select-all">
                                docker run -d -p {config.port}:{config.port} --name op-dbus-v2 \
                                <br/>&nbsp;&nbsp;-e STORAGE_ENGINE={config.storage} \
                                <br/>&nbsp;&nbsp;-v /var/run/dbus:/var/run/dbus \
                                <br/>&nbsp;&nbsp;ghcr.io/op-dbus/agent:latest
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};