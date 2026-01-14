/**
 * Deke Sharon AI Agent Ecosystem - Core Types
 */

// Agent Identifiers
export type AgentId =
  | 'harmony'      // Website concierge
  | 'pitch'        // Social media engagement
  | 'maestro'      // Arrangement quotes
  | 'conductor'    // Workshop/coaching booking
  | 'spotlight'    // Speaking bureau
  | 'tempo'        // Client onboarding
  | 'arranger'     // Arrangement delivery
  | 'virtuoso'     // AI coaching assistant
  | 'scribe'       // Content creation
  | 'repertoire'   // Song recommendations
  | 'metrics'      // Analytics dashboard
  | 'scout';       // Opportunity finder

// Agent Tiers
export type AgentTier =
  | 'front-of-house'    // Lead capture
  | 'sales-booking'     // Sales automation
  | 'fulfillment'       // Delivery
  | 'content-education' // Content & coaching
  | 'intelligence';     // Analytics & ops

// Base Agent Configuration
export interface AgentConfig {
  id: AgentId;
  name: string;
  tier: AgentTier;
  description: string;
  systemPrompt: string;
  tools: string[];
  triggers?: AgentTrigger[];
}

// Agent Trigger Types
export interface AgentTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  config: Record<string, unknown>;
}

// Agent Context
export interface AgentContext {
  sessionId: string;
  leadId?: string;
  userId?: string;
  conversationHistory: Message[];
  metadata: Record<string, unknown>;
}

// Message Types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Tool Types
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  execute: (params: Record<string, unknown>, context: AgentContext) => Promise<ToolResult>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Agent Response
export interface AgentResponse {
  message: string;
  toolsUsed?: string[];
  metadata?: Record<string, unknown>;
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  label: string;
  action: string;
  params?: Record<string, unknown>;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'calendar' | 'email' | 'payment' | 'storage';
  config: Record<string, unknown>;
  authenticate: () => Promise<boolean>;
  execute: (action: string, params: Record<string, unknown>) => Promise<unknown>;
}

// Event Types for Agent Communication
export interface AgentEvent {
  eventId: string;
  sourceAgent: AgentId;
  targetAgent?: AgentId;
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

// Lead Qualification
export interface LeadQualification {
  score: number;          // 0-100
  factors: {
    intent: number;       // Purchase intent
    budget: number;       // Budget fit
    timeline: number;     // Timeline urgency
    fit: number;          // Service fit
  };
  recommendation: 'hot' | 'warm' | 'cold' | 'nurture';
  suggestedService?: string;
}

// Quote Generation
export interface Quote {
  id: string;
  leadId: string;
  serviceType: string;
  packageTier: string;
  basePrice: number;
  adjustments: QuoteAdjustment[];
  totalPrice: number;
  validUntil: Date;
  notes?: string;
}

export interface QuoteAdjustment {
  type: 'discount' | 'rush' | 'complexity' | 'volume' | 'custom';
  description: string;
  amount: number;
  percentage?: number;
}

// Booking Types
export interface BookingRequest {
  leadId: string;
  serviceType: string;
  preferredDates: Date[];
  location?: string;
  duration?: number;
  notes?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  status: 'confirmed' | 'pending' | 'waitlist';
  scheduledDate: Date;
  location: string;
  paymentRequired?: number;
  nextSteps: string[];
}
