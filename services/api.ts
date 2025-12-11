import { MCPAgent, Skill, Plugin, ExecutionProfile, DBusService } from '../types';
import { MOCK_AGENTS, BUILTIN_SKILLS, PLUGINS, EXECUTION_PROFILES, MOCK_SERVICES } from '../constants';

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    getExecutionProfiles: async (): Promise<ExecutionProfile[]> => {
        await delay(100);
        return EXECUTION_PROFILES;
    },

    getPlugins: async (): Promise<Plugin[]> => {
        await delay(150);
        return PLUGINS;
    },

    getAgents: async (): Promise<MCPAgent[]> => {
        await delay(300); // Simulate fetching from distributed mesh
        return MOCK_AGENTS;
    },

    getSkills: async (): Promise<Skill[]> => {
        await delay(200);
        return BUILTIN_SKILLS;
    },

    getServices: async (): Promise<DBusService[]> => {
        await delay(100); // Simulate DBus introspection
        return MOCK_SERVICES;
    },

    // Simulate adding an agent to the backend
    connectAgent: async (url: string): Promise<MCPAgent> => {
        await delay(500);
        return {
            id: Date.now().toString(),
            name: `New Agent (${new URL(url).port || '80'})`,
            url: url,
            status: 'connected',
            capabilities: ['discovered_new_tool'],
            pluginId: 'plugin-core',
            executionProfileId: 'profile-realtime'
        };
    }
};
