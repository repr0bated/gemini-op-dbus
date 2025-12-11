export interface DBusMethodArg {
  name: string;
  type: string;
  direction: 'in' | 'out';
}

export interface DBusMethod {
  name: string;
  args: DBusMethodArg[];
}

export interface DBusProperty {
  name: string;
  type: string;
  access: 'read' | 'write' | 'readwrite';
}

export interface DBusSignal {
  name: string;
  args: DBusMethodArg[];
}

export interface DBusInterface {
  name: string;
  methods: DBusMethod[];
  properties: DBusProperty[];
  signals: DBusSignal[];
}

export interface DBusObject {
  path: string;
  interfaces: DBusInterface[];
  children?: DBusObject[]; // For tree structure
}

export interface DBusService {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  objects: DBusObject[];
}

export type ModelID = 'gemini-2.5-flash' | 'claude-3-opus' | 'gpt-4-turbo' | 'mistral-large';

export interface ExecutionProfile {
  id: string;
  name: string;
  description: string;
  modelPreferences: ModelID[];
  temperature: number;
  timeoutMs: number;
  maxRetries: number;
  icon: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  icon?: string;
}

export interface MCPAgent {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected';
  capabilities: string[];
  pluginId?: string;
  executionProfileId?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, string>;
  category: 'analysis' | 'utility' | 'system' | 'coding' | 'content' | 'data' | 'security' | 'devops' | 'research' | 'creative' | 'business';
  pluginId?: string;
  executionProfileId?: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  INTROSPECTOR = 'INTROSPECTOR',
  MCP_AGENTS = 'MCP_AGENTS',
  ORCHESTRATOR = 'ORCHESTRATOR',
  SETTINGS = 'SETTINGS'
}

export interface OrchestrationStep {
  id: string;
  type: 'thought' | 'call' | 'result' | 'error';
  content: string;
  toolName?: string;
  args?: Record<string, any>;
  timestamp: number;
  executionProfile?: string;
}
