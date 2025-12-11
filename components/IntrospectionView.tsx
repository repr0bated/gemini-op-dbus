import React, { useState } from 'react';
import { DBusService, DBusObject, DBusInterface, DBusMethod, DBusProperty } from '../types';
import { Folder, FileCode, Box, ChevronRight, ChevronDown, Sparkles, Play, Info, Microscope } from 'lucide-react';
import clsx from 'clsx';
import { aiService } from '../services/aiService';

interface IntrospectionViewProps {
  services: DBusService[];
}

const MethodBadge: React.FC<{ name: string; args: string }> = ({ name, args }) => (
    <div className="font-mono text-xs flex items-center gap-2 py-1 px-2 hover:bg-gray-800 rounded cursor-pointer group">
        <span className="text-purple-400 font-bold group-hover:text-purple-300">M</span>
        <span className="text-gray-300">{name}</span>
        <span className="text-gray-600 truncate max-w-[200px]">{args}</span>
    </div>
);

const PropertyBadge: React.FC<{ name: string; type: string; access: string }> = ({ name, type, access }) => (
    <div className="font-mono text-xs flex items-center gap-2 py-1 px-2 hover:bg-gray-800 rounded cursor-pointer group">
        <span className={clsx("font-bold group-hover:opacity-100", access === 'read' ? 'text-green-500' : 'text-orange-500')}>P</span>
        <span className="text-gray-300">{name}</span>
        <span className="text-gray-600">: {type}</span>
    </div>
);

export const IntrospectionView: React.FC<IntrospectionViewProps> = ({ services }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedInterface, setSelectedInterface] = useState<DBusInterface | null>(null);
  
  // Safely initialize expanded paths only if data exists
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
      const initialPaths = new Set<string>();
      if (services[0]?.objects[0]?.path) {
          initialPaths.add(services[0].objects[0].path);
      }
      return initialPaths;
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const togglePath = (path: string) => {
    const newSet = new Set(expandedPaths);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setExpandedPaths(newSet);
  };

  const activeService = services.find(s => s.id === selectedServiceId);

  const handleAnalyze = async (iface: DBusInterface) => {
      setIsAnalyzing(true);
      setAiAnalysis(null);
      const result = await aiService.explainInterface(iface);
      setAiAnalysis(result);
      setIsAnalyzing(false);
  };

  const renderTree = (object: DBusObject) => {
    const isExpanded = expandedPaths.has(object.path);
    const pathParts = object.path.split('/');
    const label = pathParts[pathParts.length - 1] || '/';

    return (
      <div key={object.path} className="ml-4 border-l border-gray-800 pl-2">
        <div 
            className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary-400 transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                togglePath(object.path);
            }}
        >
            {object.children && object.children.length > 0 ? (
                isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />
            ) : <span className="w-[14px]"></span>}
            <Folder size={14} className={isExpanded ? 'text-primary-400' : 'text-gray-600'} />
            <span className="text-sm font-mono text-gray-300 truncate">{label}</span>
        </div>

        {isExpanded && (
            <div className="ml-2">
                {object.interfaces.map(iface => (
                    <div 
                        key={iface.name} 
                        className={clsx(
                            "flex items-center gap-2 py-1 px-2 cursor-pointer rounded ml-4 border-l border-transparent hover:bg-gray-800/50",
                            selectedInterface?.name === iface.name ? 'bg-primary-900/30 border-primary-500 text-white' : 'text-gray-500'
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInterface(iface);
                            setAiAnalysis(null);
                        }}
                    >
                        <FileCode size={14} />
                        <span className="text-xs font-mono">{iface.name}</span>
                    </div>
                ))}
                {object.children?.map(child => renderTree(child))}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Navigation / Tree Pane */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col min-w-[300px]">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Service Bus</label>
            <select 
                value={selectedServiceId} 
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:ring-1 focus:ring-primary-500 outline-none"
            >
                {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.status === 'active' ? '●' : '○'}</option>
                ))}
            </select>
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {activeService ? (
                activeService.objects.map(obj => renderTree(obj))
            ) : (
                <div className="text-gray-500 text-sm italic p-2">Select a service to view objects</div>
            )}
        </div>
      </div>

      {/* Detail / Inspector Pane */}
      <div className="flex-1 bg-gray-900/20 overflow-auto custom-scrollbar flex flex-col">
        {selectedInterface ? (
            <div className="p-8 max-w-4xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-1 flex items-center gap-3">
                            <Box className="text-primary-500" />
                            {selectedInterface.name}
                        </h2>
                        <p className="text-gray-500 text-sm font-mono">Interfaces defined on object path</p>
                    </div>
                    <button 
                        onClick={() => handleAnalyze(selectedInterface)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        {isAnalyzing ? 'Analyzing...' : 'Ask AI'}
                    </button>
                </div>

                {/* AI Analysis Result */}
                {aiAnalysis && (
                    <div className="mb-6 bg-gray-800/40 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
                        <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                            <Sparkles size={14} /> Gemini Analysis
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                             <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>') }} />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Methods Column */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                            <span className="font-semibold text-gray-300 text-sm">Methods</span>
                            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{selectedInterface.methods.length}</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {selectedInterface.methods.length > 0 ? selectedInterface.methods.map((method, idx) => (
                                <MethodBadge 
                                    key={idx} 
                                    name={method.name} 
                                    args={`(${method.args.map(a => `${a.name}: ${a.type}`).join(', ')})`} 
                                />
                            )) : (
                                <div className="p-4 text-center text-gray-600 text-sm italic">No methods exported</div>
                            )}
                        </div>
                    </div>

                    {/* Properties Column */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                            <span className="font-semibold text-gray-300 text-sm">Properties</span>
                            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{selectedInterface.properties.length}</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {selectedInterface.properties.length > 0 ? selectedInterface.properties.map((prop, idx) => (
                                <PropertyBadge 
                                    key={idx} 
                                    name={prop.name} 
                                    type={prop.type} 
                                    access={prop.access} 
                                />
                            )) : (
                                <div className="p-4 text-center text-gray-600 text-sm italic">No properties exported</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Signals Section */}
                <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                        <span className="font-semibold text-gray-300 text-sm">Signals</span>
                        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{selectedInterface.signals.length}</span>
                    </div>
                    <div className="p-4">
                        {selectedInterface.signals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedInterface.signals.map((signal, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                        {signal.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 text-sm italic">No signals monitored</div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <Microscope size={48} className="text-gray-700" />
                </div>
                <h3 className="text-lg font-medium text-gray-400">No Interface Selected</h3>
                <p className="text-sm max-w-md text-center mt-2 text-gray-500">
                    Select a service from the left and drill down into an object path to view its interfaces and introspection data.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};