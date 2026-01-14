"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  MessageCircle,
  X,
  Send,
  Music,
  Loader2,
  Minimize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: "Get a quote", action: "arrangement-quote" },
  { label: "Book coaching", action: "coaching-booking" },
  { label: "Ask a question", action: "general-inquiry" },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! I'm Harmony, Deke's virtual assistant. I can help you with arrangements, coaching inquiries, or answer questions about our services. How can I assist you today?",
    timestamp: new Date(),
  },
];

export function HarmonyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Connect to HARMONY agent API
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      "arrangement-quote":
        "I'd like to get a quote for a custom arrangement.",
      "coaching-booking": "I'm interested in booking a coaching session.",
      "general-inquiry": "I have a question about your services.",
    };
    setInput(actionMessages[action] || "");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
        {/* Notification dot */}
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-pulse" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "w-72 h-14"
          : "w-[380px] h-[600px] max-h-[80vh]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Harmony</div>
            <div className="text-xs text-primary-foreground/70">
              Deke's Assistant
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[420px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Badge
                    key={action.action}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    {action.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Powered by HARMONY AI
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

// Simulated response generator - will be replaced by actual agent
function getSimulatedResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("quote") || lowerInput.includes("arrangement")) {
    return "I'd be happy to help you get a quote for a custom arrangement! To provide an accurate estimate, I'll need a few details:\n\n1. What song would you like arranged?\n2. How many voice parts does your group have?\n3. What's your timeline?\n\nFeel free to share these details, or I can connect you with Deke directly for a consultation.";
  }

  if (lowerInput.includes("coaching") || lowerInput.includes("session")) {
    return "Great choice! Deke offers both group and individual coaching sessions, available in-person or virtually. Would you like to:\n\n• Learn about group coaching packages\n• Explore individual session options\n• Schedule a free consultation call\n\nJust let me know which interests you most!";
  }

  if (lowerInput.includes("workshop") || lowerInput.includes("clinic")) {
    return "Deke's workshops are transformative experiences! He works with schools, festivals, competitions, and corporate events worldwide. What type of workshop are you interested in?\n\n• School program residency\n• Competition preparation\n• Festival clinic\n• Corporate team-building";
  }

  if (lowerInput.includes("price") || lowerInput.includes("cost")) {
    return "Pricing varies based on the specific service:\n\n• Arrangements: $500-$3,000+\n• Coaching: $200/hour (individual) or $2,000+ (group)\n• Workshops: From $5,000\n• Speaking: From $15,000\n\nWould you like more details on any of these?";
  }

  return "Thanks for reaching out! I can help with information about:\n\n• Custom arrangements\n• Coaching sessions\n• Workshops and clinics\n• Speaking engagements\n• Online masterclasses\n\nWhat would you like to know more about?";
}
