import React, { useEffect, useState } from 'react';
import { DBusService } from '../types';
import { Activity, Server, Shield, Zap, Cpu, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
    services: DBusService[];
}

const mockChartData = [
  { name: '10:00', calls: 40 },
  { name: '10:05', calls: 30 },
  { name: '10:10', calls: 20 },
  { name: '10:15', calls: 27 },
  { name: '10:20', calls: 18 },
  { name: '10:25', calls: 23 },
  { name: '10:30', calls: 34 },
];

export const Dashboard: React.FC<DashboardProps> = ({ services }) => {
    // Simulate real-time stats
    const [messagesProcessed, setMessagesProcessed] = useState(1240);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setMessagesProcessed(prev => prev + Math.floor(Math.random() * 5));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const activeServices = services.filter(s => s.status === 'active').length;

    return (
        <div className="p-8 overflow-auto h-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
                <p className="text-gray-400">op-dbus-v2 instance status and metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Active Services</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{activeServices}</h3>
                        </div>
                        <div className="bg-primary-500/20 p-2 rounded-lg text-primary-500">
                            <Server size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <Activity size={12} />
                        <span>All systems operational</span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Messages (MCP)</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{messagesProcessed.toLocaleString()}</h3>
                        </div>
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-500">
                            <Zap size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-purple-400">
                        +12/sec avg throughput
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Introspected Paths</p>
                            <h3 className="text-3xl font-bold text-white mt-1">142</h3>
                        </div>
                        <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                            <Database size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        Cached in memory
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Systemd Link</p>
                            <h3 className="text-3xl font-bold text-white mt-1">OK</h3>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded-lg text-green-500">
                            <Shield size={24} />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        sd_notify sent (READY=1)
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">MCP Tool Invocation Activity</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff'}}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Active Services</h3>
                    <div className="space-y-4">
                        {services.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span className="font-mono text-sm text-gray-300">{s.name}</span>
                                </div>
                                <Cpu size={14} className="text-gray-600" />
                            </div>
                        ))}
                        <button className="w-full mt-2 py-2 text-sm text-center text-primary-400 hover:text-primary-300 border border-dashed border-gray-700 hover:border-primary-500/50 rounded-lg transition-colors">
                            + Add Service
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
