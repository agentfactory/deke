/**
 * Base Agent Class - Foundation for all Deke Sharon AI Agents
 */

import type {
  AgentConfig,
  AgentContext,
  AgentResponse,
  Message,
  Tool,
  ToolResult,
  AgentEvent,
} from './types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected tools: Map<string, Tool> = new Map();
  protected context: AgentContext | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Initialize the agent with context
   */
  async initialize(context: AgentContext): Promise<void> {
    this.context = context;
    await this.onInitialize();
  }

  /**
   * Override in subclass for custom initialization
   */
  protected async onInitialize(): Promise<void> {
    // Default: no-op
  }

  /**
   * Register a tool for this agent
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a tool by name
   */
  async executeTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" not found`,
      };
    }

    if (!this.context) {
      return {
        success: false,
        error: 'Agent context not initialized',
      };
    }

    try {
      const result = await tool.execute(params, this.context);
      await this.logToolExecution(toolName, params, result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Process a user message and generate a response
   */
  abstract processMessage(message: string): Promise<AgentResponse>;

  /**
   * Handle an event from another agent or system
   */
  async handleEvent(event: AgentEvent): Promise<void> {
    await this.onEvent(event);
  }

  /**
   * Override in subclass for custom event handling
   */
  protected async onEvent(event: AgentEvent): Promise<void> {
    // Default: no-op
  }

  /**
   * Emit an event to the agent system
   */
  protected async emitEvent(
    eventType: string,
    payload: Record<string, unknown>,
    targetAgent?: string
  ): Promise<void> {
    const event: AgentEvent = {
      eventId: crypto.randomUUID(),
      sourceAgent: this.config.id,
      targetAgent: targetAgent as any,
      eventType,
      payload,
      timestamp: new Date(),
    };

    // TODO: Integrate with event bus
    console.log('Agent event:', event);
  }

  /**
   * Log tool execution for analytics
   */
  protected async logToolExecution(
    toolName: string,
    params: Record<string, unknown>,
    result: ToolResult
  ): Promise<void> {
    // TODO: Integrate with Prisma for logging
    console.log(`[${this.config.id}] Tool: ${toolName}`, {
      params,
      success: result.success,
    });
  }

  /**
   * Get the agent's system prompt
   */
  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }

  /**
   * Get conversation history from context
   */
  protected getConversationHistory(): Message[] {
    return this.context?.conversationHistory || [];
  }

  /**
   * Add a message to conversation history
   */
  protected addToHistory(message: Message): void {
    if (this.context) {
      this.context.conversationHistory.push(message);
    }
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }
}
