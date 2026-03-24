"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Check,
  AlertCircle,
  Lightbulb,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Types ───────────────────────────────────────────────

interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  subject: string | null;
  storyContent: string | null;
  craftContent: string | null;
  communityContent: string | null;
  noteContent: string | null;
  status: string;
  sentAt: Date | string | null;
  subscriberCount: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ideas: Idea[];
}

interface Idea {
  id: string;
  title: string;
  body: string | null;
  section: string;
  status: string;
  issueId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Props {
  issue: Issue;
  availableIdeas: Idea[];
  subscriberCount: number;
}

// ─── Section Config ──────────────────────────────────────

const SECTIONS = [
  {
    key: "storyContent" as const,
    label: "The Story",
    section: "STORY",
    min: 400,
    max: 600,
    accent: "#D97706",
    bg: "bg-amber-50/50",
    desc: "A vivid personal moment — the kind of story Deke only tells in person.",
  },
  {
    key: "craftContent" as const,
    label: "The Craft",
    section: "CRAFT",
    min: 400,
    max: 800,
    accent: "#2563EB",
    bg: "bg-blue-50/50",
    desc: "Actionable teaching — specific enough to use at the next rehearsal.",
  },
  {
    key: "communityContent" as const,
    label: "The Community",
    section: "COMMUNITY",
    min: 150,
    max: 300,
    accent: "#059669",
    bg: "bg-emerald-50/50",
    desc: "Group spotlight, arrangement of the month, reader Q&A, or what Deke\u2019s listening to.",
  },
  {
    key: "noteContent" as const,
    label: "The Note",
    section: "NOTE",
    min: 50,
    max: 100,
    accent: "#7C3AED",
    bg: "bg-purple-50/50",
    desc: "A brief, warm sign-off.",
  },
] as const;

type ContentKey = (typeof SECTIONS)[number]["key"];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600",
  READY: "bg-amber-100 text-amber-700",
  SENDING: "bg-sky-100 text-sky-700 animate-pulse",
  SENT: "bg-emerald-100 text-emerald-700",
};

// ─── Helpers ─────────────────────────────────────────────

function wordCount(text: string | null): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function wordCountColor(count: number, min: number, max: number): string {
  if (count === 0) return "text-[#CCC]";
  if (count < min) return "text-[#999]";
  if (count <= max) return "text-emerald-600";
  return "text-red-500";
}

// ─── Component ───────────────────────────────────────────

export function IssueComposer({ issue, availableIdeas, subscriberCount }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState(issue.subject || "");
  const [content, setContent] = useState<Record<ContentKey, string>>({
    storyContent: issue.storyContent || "",
    craftContent: issue.craftContent || "",
    communityContent: issue.communityContent || "",
    noteContent: issue.noteContent || "",
  });
  const [status, setStatus] = useState(issue.status);
  const [ideas, setIdeas] = useState(availableIdeas);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSent = status === "SENT";

  // ─── Auto-save on blur ─────────────────────────────────

  const save = useCallback(
    async (data?: Partial<Record<string, string | null>>) => {
      if (isSent) return;
      setSaving(true);
      setSaved(false);
      try {
        const res = await fetch(`/api/newsletters/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subject || null,
            ...content,
            ...data,
          }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } finally {
        setSaving(false);
      }
    },
    [issue.id, subject, content, isSent]
  );

  function scheduleAutoSave() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(), 2000);
  }

  function updateContent(key: ContentKey, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
    scheduleAutoSave();
  }

  // ─── Status transitions ────────────────────────────────

  async function markReady() {
    await save({ status: "READY" });
    setStatus("READY");
  }

  async function markDraft() {
    await save({ status: "DRAFT" });
    setStatus("DRAFT");
  }

  async function sendNewsletter() {
    setSending(true);
    try {
      // First ensure status is READY
      if (status !== "READY") {
        await fetch(`/api/newsletters/issues/${issue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READY" }),
        });
      }

      const res = await fetch(`/api/newsletters/issues/${issue.id}/send`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setSendResult({ sent: data.sent, failed: data.failed });
        setStatus("SENT");
      } else {
        alert(data.error || "Failed to send newsletter");
      }
    } finally {
      setSending(false);
    }
  }

  // ─── Link idea ─────────────────────────────────────────

  async function linkIdea(ideaId: string) {
    const res = await fetch(`/api/newsletters/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: issue.id, status: "USED" }),
    });
    if (res.ok) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, issueId: issue.id, status: "USED" } : i))
      );
    }
  }

  async function unlinkIdea(ideaId: string) {
    const res = await fetch(`/api/newsletters/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: null, status: "IDEA" }),
    });
    if (res.ok) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, issueId: null, status: "IDEA" } : i))
      );
    }
  }

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/newsletters")}
            className="p-2 hover:bg-[#F5F3EF] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#999]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-xl font-bold text-[#1a1a1a] tracking-tight"
                style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
              >
                {issue.title}
              </h1>
              <Badge className={`${STATUS_COLORS[status]} border-0 text-[10px] font-semibold`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-[#999] mt-0.5">
              Issue #{issue.issueNumber} &middot; {subscriberCount} subscribers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-[#999]">Saving...</span>}
          {saved && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          {!isSent && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => save()}
                disabled={saving}
                className="border-[#E8E4DD]"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="border-[#E8E4DD]"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {status === "DRAFT" ? (
                <Button
                  size="sm"
                  onClick={markReady}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Mark Ready
                </Button>
              ) : status === "READY" ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markDraft}
                    className="border-[#E8E4DD]"
                  >
                    Back to Draft
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowSendConfirm(true)}
                    className="bg-[#C05A3C] hover:bg-[#A84D33] text-white"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send Newsletter
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Subject line */}
      <Card className="border-[#E8E4DD]">
        <CardContent className="p-4">
          <label className="text-[10px] font-semibold text-[#888] tracking-wider uppercase mb-2 block">
            Email Subject Line
          </label>
          <Input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              scheduleAutoSave();
            }}
            onBlur={() => save()}
            placeholder={`The Arrangement #${issue.issueNumber}: [Your hook here]`}
            disabled={isSent}
            className="border-[#E8E4DD] text-base font-medium h-12"
          />
        </CardContent>
      </Card>

      {/* Content sections */}
      {SECTIONS.map((sec) => {
        const wc = wordCount(content[sec.key]);
        const linkedIdeas = ideas.filter(
          (i) => i.issueId === issue.id && i.section === sec.section
        );
        const availableForSection = ideas.filter(
          (i) => i.issueId !== issue.id && (i.section === sec.section || i.section === "UNCATEGORIZED")
        );

        return (
          <Card key={sec.key} className={`border-[#E8E4DD] ${sec.bg}`}>
            <CardContent className="p-0">
              {/* Section header */}
              <div
                className="flex items-center justify-between px-5 py-3 border-b border-[#E8E4DD]/60"
                style={{ borderLeftWidth: 3, borderLeftColor: sec.accent }}
              >
                <div>
                  <h2
                    className="text-xs font-bold tracking-[2px] uppercase"
                    style={{ color: sec.accent }}
                  >
                    {sec.label}
                  </h2>
                  <p className="text-[11px] text-[#999] mt-0.5">{sec.desc}</p>
                </div>
                <span className={`text-xs font-mono ${wordCountColor(wc, sec.min, sec.max)}`}>
                  {wc}/{sec.min}-{sec.max}w
                </span>
              </div>

              {/* Textarea */}
              <div className="px-5 py-4">
                <Textarea
                  value={content[sec.key]}
                  onChange={(e) => updateContent(sec.key, e.target.value)}
                  onBlur={() => save()}
                  disabled={isSent}
                  placeholder={`Write the ${sec.label.toLowerCase()} section...`}
                  rows={sec.key === "noteContent" ? 3 : 8}
                  className="border-0 bg-transparent text-sm leading-relaxed placeholder:text-[#CCC] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
              </div>

              {/* Linked ideas */}
              {(linkedIdeas.length > 0 || availableForSection.length > 0) && (
                <div className="px-5 py-3 border-t border-[#E8E4DD]/40 flex items-center gap-2 flex-wrap">
                  <Lightbulb className="h-3.5 w-3.5 text-[#BBB]" />
                  {linkedIdeas.map((idea) => (
                    <span
                      key={idea.id}
                      className="inline-flex items-center gap-1 bg-white border border-[#E8E4DD] rounded-full px-2.5 py-1 text-[11px] text-[#666]"
                    >
                      {idea.title}
                      {!isSent && (
                        <button
                          onClick={() => unlinkIdea(idea.id)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {!isSent && availableForSection.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center gap-1 text-[11px] text-[#999] hover:text-[#666] transition-colors">
                          <Plus className="h-3 w-3" />
                          Link idea
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-64 p-2 max-h-48 overflow-y-auto"
                      >
                        {availableForSection.map((idea) => (
                          <button
                            key={idea.id}
                            onClick={() => linkIdea(idea.id)}
                            className="w-full text-left px-2.5 py-2 rounded text-xs hover:bg-[#F5F3EF] transition-colors truncate"
                          >
                            {idea.title}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* ─── Preview Modal ─── */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              How the newsletter will appear in subscribers&apos; inboxes.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#0D1117] rounded-lg p-6 space-y-6">
            {/* Header preview */}
            <div className="text-center">
              <p className="text-[10px] tracking-[3px] text-[#C9943A] uppercase mb-3">
                A Monthly Letter from Deke Sharon
              </p>
              <h2 className="font-serif text-2xl font-semibold text-white">
                {issue.title}
              </h2>
              {subject && subject !== issue.title && (
                <p className="text-sm text-[#7A8A9A] mt-2">{subject}</p>
              )}
              <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#C9943A] to-transparent" />
            </div>

            {/* Sections preview */}
            {SECTIONS.map((sec) => {
              const text = content[sec.key];
              if (!text?.trim()) return null;
              return (
                <div key={sec.key}>
                  <div
                    className="inline-block px-3 py-1 mb-3 border-l-2"
                    style={{ borderColor: sec.accent, backgroundColor: `${sec.accent}15` }}
                  >
                    <span
                      className="text-[10px] font-semibold tracking-[2px] uppercase"
                      style={{ color: sec.accent }}
                    >
                      {sec.label}
                    </span>
                  </div>
                  <div className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                    {text}
                  </div>
                </div>
              );
            })}

            {/* Sign-off */}
            <div className="text-center pt-4 border-t border-[#1E2A38]">
              <div className="inline-block w-10 h-0.5 bg-[#C9943A] rounded mb-3" />
              <p className="text-sm text-[#7A8A9A] italic">Keep singing,</p>
              <p className="text-base text-white font-semibold mt-1">Deke</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Send Confirmation Modal ─── */}
      <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-[#C05A3C]" />
              Send Newsletter
            </DialogTitle>
            <DialogDescription>
              This will send The Arrangement #{issue.issueNumber} to all opted-in subscribers.
            </DialogDescription>
          </DialogHeader>

          {sendResult ? (
            <div className="py-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-[#1a1a1a]">Newsletter sent!</p>
              <p className="text-xs text-[#888] mt-1">
                {sendResult.sent} delivered
                {sendResult.failed > 0 && `, ${sendResult.failed} failed`}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setShowSendConfirm(false);
                  router.push("/dashboard/newsletters");
                }}
              >
                Back to Newsletter Manager
              </Button>
            </div>
          ) : (
            <>
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#888]">Recipients</span>
                  <span className="font-medium text-[#1a1a1a]">{subscriberCount} subscribers</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#888]">Subject</span>
                  <span className="font-medium text-[#1a1a1a] truncate max-w-[200px]">
                    {subject || issue.title}
                  </span>
                </div>

                {/* Warnings */}
                {SECTIONS.map((sec) => {
                  const wc = wordCount(content[sec.key]);
                  if (wc === 0) {
                    return (
                      <div key={sec.key} className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {sec.label} is empty
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={sendNewsletter}
                  disabled={sending}
                  className="bg-[#C05A3C] hover:bg-[#A84D33] text-white"
                >
                  {sending ? "Sending..." : `Send to ${subscriberCount} subscribers`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
