import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DBusInterface } from '../types';
import { ModelID } from '../types';

/**
 * Interface for AI Providers (Gemini, OpenAI, Claude, etc.)
 */
export interface AIProvider {
    id: ModelID;
    generateText(prompt: string): Promise<string>;
    generatePlan(prompt: string, tools: string[], context?: string): Promise<any[]>;
    executeTool(toolName: string, args: any, context?: string): Promise<string>;
    streamDeploymentLogs(config: any): AsyncGenerator<string, void, unknown>;
}

// --- Gemini Implementation ---
class GeminiProvider implements AIProvider {
    id: ModelID = 'gemini-2.5-flash';
    private client: GoogleGenAI | null = null;

    constructor() {
        if (process.env.API_KEY) {
            this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            console.warn("Gemini API Key missing. AI features will run in mock mode.");
        }
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.client) return "Error: API Key missing for Gemini.";
        try {
            const response = await this.client.models.generateContent({
                model: this.id,
                contents: prompt,
            });
            return response.text || "No response generated.";
        } catch (e: any) {
            return `Gemini Error: ${e.message}`;
        }
    }

    async generatePlan(userPrompt: string, tools: string[], systemContext: string = ""): Promise<any[]> {
        if (!this.client) throw new Error("API Key missing");
        
        const systemPrompt = `
            You are an intelligent Model-Agnostic Orchestration Engine for the 'op-dbus-v2' system.
            Your task is to break down the user's request into a sequence of tool executions.
            
            GLOBAL SYSTEM CONTEXT:
            ${systemContext}

            Key capabilities:
            - You have access to "Execution Profiles" (e.g., Real-time, Reasoning). 
            - When choosing a tool, consider its profile. For complex reasoning, prefer tools with the 'Deep Reasoning' profile.
            - For simple queries, prefer 'Real-time'.
            - Use the SYSTEM CONTEXT to make decisions. If a service is down, do not try to query it without starting it first.
            - If the user asks for system analysis, look for 'Log Analysis' or 'System Health Check'.

            Available Tools & Skills (Format: [PROFILE] ToolName - Description):
            ${tools.map(t => `- ${t}`).join('\n')}

            User Request: "${userPrompt}"

            Return a JSON array of steps (thought, call).
            Output JSON Schema:
            [
                { "type": "thought", "content": "string" },
                { 
                    "type": "call", 
                    "toolName": "string", 
                    "args": { "key": "value" }, 
                    "content": "description",
                    "executionProfile": "string (optional, derived from tool)"
                }
            ]
        `;

        try {
            const response = await this.client.models.generateContent({
                model: this.id,
                contents: systemPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                content: { type: Type.STRING },
                                toolName: { type: Type.STRING },
                                args: { type: Type.OBJECT },
                                executionProfile: { type: Type.STRING }
                            },
                            required: ["type", "content"]
                        }
                    }
                }
            });
            return JSON.parse(response.text || "[]");
        } catch (e) {
            console.error("Plan Gen Error", e);
            return [{ type: 'error', content: 'Failed to generate plan.' }];
        }
    }

    async executeTool(toolName: string, args: any, context?: string): Promise<string> {
        if (!this.client) return JSON.stringify({ status: "error", message: "API Key missing" });

        const prompt = `
            You are a Tool Execution Simulator for a system dashboard (op-dbus-v2).
            
            Task: Simulate the output of the tool '${toolName}' with arguments: ${JSON.stringify(args)}.
            Context: ${context || "User requested an operation."}

            Requirements:
            - Return realistic, structured JSON data that this tool would produce.
            - If it's a query (e.g., SQL, Log), return plausible mock rows/logs with ISO timestamps.
            - If it's an action (e.g., Restart, Build), return a status report.
            - If it's a code analysis, return a list of issues found.
            - Do not include Markdown formatting or code blocks. Just raw JSON.
        `;

        try {
            const response = await this.client.models.generateContent({
                model: this.id,
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            return response.text || "{}";
        } catch (e: any) {
            return JSON.stringify({ status: "error", message: e.message });
        }
    }

    async *streamDeploymentLogs(config: any): AsyncGenerator<string, void, unknown> {
        if (!this.client) {
            yield "Error: API Key missing. Cannot stream logs.";
            return;
        }

        const prompt = `
            Act as a Linux installation script logger for 'op-dbus-v2'.
            Configuration: ${JSON.stringify(config)}
            
            Task: Generate a realistic, real-time log stream for the installation process.
            
            Requirements:
            - Start immediately.
            - Output raw text lines. No markdown.
            - Include timestamps [HH:MM:SS] at the start of lines.
            - Cover these stages:
              1. Environment Check (Kernel, Permissions).
              2. Dependency Resolution (apt-get/yum simulation).
              3. Binary Installation to ${config.installPath}.
              4. Configuration Write to ${config.configPath}.
              5. Systemd Unit Creation.
              6. Service Startup on Port ${config.port}.
            - End with "DEPLOYMENT SUCCESSFUL".
        `;

        try {
            const response = await this.client.models.generateContentStream({
                model: this.id,
                contents: prompt
            });

            for await (const chunk of response) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    yield c.text;
                }
            }
        } catch (e: any) {
            yield `\n[ERROR] Stream interrupted: ${e.message}`;
        }
    }
}

// --- Mock Provider for other models ---
class MockProvider implements AIProvider {
    constructor(public id: ModelID) {}
    
    async generateText(prompt: string): Promise<string> {
        return `[Mock ${this.id}] Response to: ${prompt.substring(0, 20)}...`;
    }

    async generatePlan(prompt: string, tools: string[], context?: string): Promise<any[]> {
        return [
            { type: 'thought', content: `[${this.id}] Simulating plan with context: ${context?.substring(0, 20)}...` },
            { type: 'call', toolName: 'MockTool', args: {}, content: 'Mock execution', executionProfile: 'Reasoning' }
        ];
    }

    async executeTool(toolName: string, args: any): Promise<string> {
        return JSON.stringify({ status: "success", mock_data: true, tool: toolName });
    }

    async *streamDeploymentLogs(config: any): AsyncGenerator<string, void, unknown> {
        const logs = ["Initializing...", "Mocking deployment...", "Done."];
        for (const log of logs) {
            await new Promise(r => setTimeout(r, 500));
            yield log + "\n";
        }
    }
}

// --- Service Facade ---
class AIService {
    private activeProvider: AIProvider;
    private providers: Record<string, AIProvider>;

    constructor() {
        this.providers = {
            'gemini-2.5-flash': new GeminiProvider(),
            'claude-3-opus': new MockProvider('claude-3-opus'),
            'gpt-4-turbo': new MockProvider('gpt-4-turbo'),
        };
        this.activeProvider = this.providers['gemini-2.5-flash'];
    }

    setModel(modelId: ModelID) {
        if (this.providers[modelId]) {
            this.activeProvider = this.providers[modelId];
        }
    }

    async explainInterface(iface: DBusInterface): Promise<string> {
        const prompt = `
            You are a Linux Systems Expert specializing in DBus and low-level system architecture.
            
            Explain the following DBus Interface in a concise, developer-friendly way.
            Identify its likely purpose, what service it belongs to (e.g., systemd, NetworkManager), and give an example of how one might use the 'StartUnit' or similar important method if present.
            
            Interface Name: ${iface.name}
            
            Methods:
            ${iface.methods.map(m => `- ${m.name}(${m.args.map(a => `${a.name}: ${a.type}`).join(', ')})`).join('\n')}
            
            Properties:
            ${iface.properties.map(p => `- ${p.name} (${p.type}) [${p.access}]`).join('\n')}
            
            Format the response in Markdown. Keep it technical but clear.
        `;
        return this.activeProvider.generateText(prompt);
    }

    async generateOrchestrationPlan(userPrompt: string, tools: string[], systemContext?: string): Promise<any[]> {
        return this.activeProvider.generatePlan(userPrompt, tools, systemContext);
    }

    async executeTool(toolName: string, args: any, context?: string): Promise<string> {
        return this.activeProvider.executeTool(toolName, args, context);
    }

    async *streamDeploymentLogs(config: any): AsyncGenerator<string, void, unknown> {
        for await (const chunk of this.activeProvider.streamDeploymentLogs(config)) {
            yield chunk;
        }
    }
}

export const aiService = new AIService();