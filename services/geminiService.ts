// DEPRECATED: This service has been superseded by aiService.ts which offers
// unified provider support (Gemini, Mock, etc.) and streaming capabilities.
// Please import { aiService } from './aiService' instead.

import { aiService } from './aiService';

export const explainInterface = (iface: any) => aiService.explainInterface(iface);
export const generateOrchestrationPlan = (prompt: string, tools: string[], context?: string) => aiService.generateOrchestrationPlan(prompt, tools, context);
