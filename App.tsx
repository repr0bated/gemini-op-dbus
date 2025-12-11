import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ViewMode, DBusService } from './types';
import { IntrospectionView } from './components/IntrospectionView';
import { Dashboard } from './components/Dashboard';
import { MCPAgents } from './components/MCPAgents';
import { Orchestrator } from './components/Orchestrator';
import { SettingsView } from './components/SettingsView';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [services, setServices] = useState<DBusService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (e) {
            console.error("Failed to load services", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchServices();
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-primary-500 animate-spin" />
                    <p className="text-gray-500 font-mono">Connecting to op-dbus-v2 daemon...</p>
                </div>
            </div>
        );
    }

    switch (currentView) {
      case ViewMode.DASHBOARD:
        return <Dashboard services={services} />;
      case ViewMode.INTROSPECTOR:
        return <IntrospectionView services={services} />;
      case ViewMode.MCP_AGENTS:
        return <MCPAgents />;
      case ViewMode.ORCHESTRATOR:
        return <Orchestrator services={services} />;
      case ViewMode.SETTINGS:
        return <SettingsView />;
      default:
        return <Dashboard services={services} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-200 font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
