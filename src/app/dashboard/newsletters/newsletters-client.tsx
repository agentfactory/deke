"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  BookOpen,
  Users,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  Link2,
  Send,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ───────────────────────────────────────────────

type Section = "STORY" | "CRAFT" | "COMMUNITY" | "NOTE" | "UNCATEGORIZED";

interface Idea {
  id: string;
  title: string;
  body: string | null;
  section: Section;
  status: string;
  issueId: string | null;
  issue: { id: string; title: string; issueNumber: number } | null;
  createdAt: string;
}

interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  subject: string | null;
  status: string;
  sentAt: string | null;
  subscriberCount: number | null;
  createdAt: string;
  _count: { ideas: number };
}

interface Props {
  initialIdeas: Idea[];
  initialIssues: Issue[];
  subscriberCount: number;
}

// ─── Constants ───────────────────────────────────────────

const SECTION_COLORS: Record<Section, { bg: string; text: string; border: string }> = {
  STORY: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  CRAFT: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  COMMUNITY: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  NOTE: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  UNCATEGORIZED: { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200" },
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600",
  READY: "bg-amber-100 text-amber-700",
  SENDING: "bg-sky-100 text-sky-700",
  SENT: "bg-emerald-100 text-emerald-700",
};

// ─── Component ───────────────────────────────────────────

export function NewslettersClient({ initialIdeas, initialIssues, subscriberCount }: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  // Quick-add form state
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSection, setNewSection] = useState<Section>("UNCATEGORIZED");
  const [showNotes, setShowNotes] = useState(false);
  const [adding, setAdding] = useState(false);

  // Filter
  const [sectionFilter, setSectionFilter] = useState<Section | "ALL">("ALL");

  // Edit modal
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSection, setEditSection] = useState<Section>("UNCATEGORIZED");
  const [saving, setSaving] = useState(false);

  // Assign modal
  const [assignIdea, setAssignIdea] = useState<Idea | null>(null);

  // ─── Ideas CRUD ────────────────────────────────────────

  async function addIdea() {
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/newsletters/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim() || undefined,
          section: newSection,
        }),
      });
      if (res.ok) {
        const { idea } = await res.json();
        setIdeas((prev) => [{ ...idea, issue: null }, ...prev]);
        setNewTitle("");
        setNewBody("");
        setNewSection("UNCATEGORIZED");
        setShowNotes(false);
      }
    } finally {
      setAdding(false);
    }
  }

  async function deleteIdea(id: string) {
    const res = await fetch(`/api/newsletters/ideas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    }
  }

  async function saveEdit() {
    if (!editIdea || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/newsletters/ideas/${editIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim() || null,
          section: editSection,
        }),
      });
      if (res.ok) {
        const { idea } = await res.json();
        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? idea : i)));
        setEditIdea(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function assignToIssue(ideaId: string, issueId: string | null) {
    const res = await fetch(`/api/newsletters/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, status: issueId ? "USED" : "IDEA" }),
    });
    if (res.ok) {
      const { idea } = await res.json();
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? idea : i)));
      setAssignIdea(null);
    }
  }

  // ─── Issues ────────────────────────────────────────────

  async function createIssue() {
    const res = await fetch("/api/newsletters/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const { issue } = await res.json();
      router.push(`/dashboard/newsletters/${issue.id}`);
    }
  }

  // ─── Filtered ideas ───────────────────────────────────

  const filteredIdeas =
    sectionFilter === "ALL"
      ? ideas
      : ideas.filter((i) => i.section === sectionFilter);

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1a1a1a] tracking-tight"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk'), sans-serif" }}
          >
            Newsletter Manager
          </h1>
          <p className="text-sm text-[#888] mt-1">
            The Arrangement — Deke&apos;s monthly letter
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E4DD] rounded-lg">
            <Mail className="h-4 w-4 text-[#C05A3C]" />
            <span className="text-sm font-medium text-[#1a1a1a]">{subscriberCount}</span>
            <span className="text-xs text-[#888]">subscribers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ideas" className="w-full">
        <TabsList className="bg-white border border-[#E8E4DD] h-11">
          <TabsTrigger value="ideas" className="gap-2 data-[state=active]:text-[#C05A3C]">
            <Lightbulb className="h-4 w-4" />
            Ideas
            <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
              {ideas.filter((i) => i.status === "IDEA").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2 data-[state=active]:text-[#C05A3C]">
            <BookOpen className="h-4 w-4" />
            Issues
            <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
              {issues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2 data-[state=active]:text-[#C05A3C]">
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
        </TabsList>

        {/* ═══ IDEAS TAB ═══ */}
        <TabsContent value="ideas" className="mt-4 space-y-4">
          {/* Quick-add */}
          <Card className="border-[#E8E4DD] border-dashed bg-[#FEFDFB]">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Jot down an idea..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !showNotes) {
                        e.preventDefault();
                        addIdea();
                      }
                    }}
                    className="border-[#E8E4DD] bg-white h-10 text-sm placeholder:text-[#BBB]"
                  />
                  {showNotes ? (
                    <Textarea
                      placeholder="Notes, links, rough draft..."
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      rows={3}
                      className="border-[#E8E4DD] bg-white text-sm placeholder:text-[#BBB] resize-none"
                    />
                  ) : (
                    <button
                      onClick={() => setShowNotes(true)}
                      className="text-xs text-[#999] hover:text-[#666] transition-colors"
                    >
                      + Add notes
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Select
                    value={newSection}
                    onValueChange={(v) => setNewSection(v as Section)}
                  >
                    <SelectTrigger className="w-[140px] h-10 border-[#E8E4DD] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNCATEGORIZED">No section</SelectItem>
                      <SelectItem value="STORY">The Story</SelectItem>
                      <SelectItem value="CRAFT">The Craft</SelectItem>
                      <SelectItem value="COMMUNITY">The Community</SelectItem>
                      <SelectItem value="NOTE">The Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addIdea}
                    disabled={!newTitle.trim() || adding}
                    size="sm"
                    className="bg-[#C05A3C] hover:bg-[#A84D33] text-white h-10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {adding ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter bar */}
          <div className="flex items-center gap-2">
            {(["ALL", "STORY", "CRAFT", "COMMUNITY", "NOTE", "UNCATEGORIZED"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setSectionFilter(s)}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${
                      sectionFilter === s
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-white text-[#666] border border-[#E8E4DD] hover:border-[#CCC]"
                    }
                  `}
                >
                  {s === "ALL" ? "All" : s === "UNCATEGORIZED" ? "Uncategorized" : `The ${s.charAt(0) + s.slice(1).toLowerCase()}`}
                </button>
              )
            )}
          </div>

          {/* Idea cards */}
          {filteredIdeas.length === 0 ? (
            <div className="text-center py-16">
              <Lightbulb className="h-10 w-10 text-[#DDD] mx-auto mb-3" />
              <p className="text-sm text-[#999]">
                No ideas yet. Start collecting content for The Arrangement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredIdeas.map((idea) => {
                const colors = SECTION_COLORS[idea.section as Section] || SECTION_COLORS.UNCATEGORIZED;
                return (
                  <Card
                    key={idea.id}
                    className="border-[#E8E4DD] hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#1a1a1a] leading-snug truncate">
                            {idea.title}
                          </h3>
                          {idea.body && (
                            <p className="text-xs text-[#888] mt-1.5 line-clamp-2 leading-relaxed">
                              {idea.body}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#F5F3EF] rounded">
                              <MoreHorizontal className="h-4 w-4 text-[#999]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditIdea(idea);
                                setEditTitle(idea.title);
                                setEditBody(idea.body || "");
                                setEditSection(idea.section as Section);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {issues.length > 0 && (
                              <DropdownMenuItem onClick={() => setAssignIdea(idea)}>
                                <Link2 className="h-3.5 w-3.5 mr-2" />
                                Assign to Issue
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteIdea(idea.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}
                        >
                          {idea.section === "UNCATEGORIZED" ? "---" : idea.section}
                        </span>
                        {idea.issue && (
                          <span className="text-[10px] text-[#999]">
                            #{idea.issue.issueNumber}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══ ISSUES TAB ═══ */}
        <TabsContent value="issues" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#888]">
              {issues.length} {issues.length === 1 ? "issue" : "issues"}
            </p>
            <Button
              onClick={createIssue}
              size="sm"
              className="bg-[#C05A3C] hover:bg-[#A84D33] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Issue
            </Button>
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-10 w-10 text-[#DDD] mx-auto mb-3" />
              <p className="text-sm text-[#999]">
                No issues yet. Create your first issue of The Arrangement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="border-[#E8E4DD] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/newsletters/${issue.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F5F3EF] text-[#C05A3C] font-bold text-sm">
                        #{issue.issueNumber}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1a1a1a]">
                          {issue.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {issue.subject && issue.subject !== issue.title && (
                            <span className="text-xs text-[#888] truncate max-w-[200px]">
                              {issue.subject}
                            </span>
                          )}
                          <span className="text-xs text-[#BBB]">
                            {issue._count.ideas} {issue._count.ideas === 1 ? "idea" : "ideas"} linked
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {issue.status === "SENT" && issue.sentAt && (
                        <div className="flex items-center gap-1.5 text-xs text-[#999]">
                          <Send className="h-3 w-3" />
                          <span>
                            {new Date(issue.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {issue.subscriberCount !== null && (
                            <span className="text-[#BBB]">
                              ({issue.subscriberCount})
                            </span>
                          )}
                        </div>
                      )}
                      <Badge className={`${STATUS_COLORS[issue.status] || STATUS_COLORS.DRAFT} border-0 text-[10px] font-semibold`}>
                        {issue.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ SUBSCRIBERS TAB ═══ */}
        <TabsContent value="subscribers" className="mt-4 space-y-4">
          <SubscribersTab count={subscriberCount} />
        </TabsContent>
      </Tabs>

      {/* ─── Edit Idea Modal ─── */}
      <Dialog open={!!editIdea} onOpenChange={() => setEditIdea(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="border-[#E8E4DD]"
            />
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="Notes..."
              rows={4}
              className="border-[#E8E4DD] resize-none"
            />
            <Select value={editSection} onValueChange={(v) => setEditSection(v as Section)}>
              <SelectTrigger className="border-[#E8E4DD]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNCATEGORIZED">No section</SelectItem>
                <SelectItem value="STORY">The Story</SelectItem>
                <SelectItem value="CRAFT">The Craft</SelectItem>
                <SelectItem value="COMMUNITY">The Community</SelectItem>
                <SelectItem value="NOTE">The Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditIdea(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={saving || !editTitle.trim()}
              className="bg-[#C05A3C] hover:bg-[#A84D33] text-white"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Assign to Issue Modal ─── */}
      <Dialog open={!!assignIdea} onOpenChange={() => setAssignIdea(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign to Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {assignIdea?.issueId && (
              <button
                onClick={() => assignToIssue(assignIdea!.id, null)}
                className="w-full text-left px-3 py-2.5 rounded-md border border-[#E8E4DD] text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Remove from current issue
              </button>
            )}
            {issues
              .filter((i) => i.status !== "SENT")
              .map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => assignToIssue(assignIdea!.id, issue.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors text-sm ${
                    assignIdea?.issueId === issue.id
                      ? "border-[#C05A3C] bg-[#C05A3C]/5 text-[#C05A3C]"
                      : "border-[#E8E4DD] hover:border-[#CCC] text-[#1a1a1a]"
                  }`}
                >
                  <span className="font-medium">#{issue.issueNumber}</span>{" "}
                  {issue.title}
                  <Badge className={`ml-2 ${STATUS_COLORS[issue.status]} border-0 text-[9px]`}>
                    {issue.status}
                  </Badge>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Subscribers Sub-component ───────────────────────────

function SubscribersTab({ count }: { count: number }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletters/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-[#E8E4DD]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{count}</p>
              <p className="text-xs text-[#888]">Newsletter subscribers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load button / table */}
      {!loaded ? (
        <div className="text-center py-8">
          <Button
            onClick={loadSubscribers}
            variant="outline"
            disabled={loading}
            className="border-[#E8E4DD]"
          >
            {loading ? "Loading..." : "View Subscriber List"}
          </Button>
        </div>
      ) : (
        <Card className="border-[#E8E4DD]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E4DD] bg-[#FAFAF8]">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#888] tracking-wider uppercase">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#888] tracking-wider uppercase">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#888] tracking-wider uppercase">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#888] tracking-wider uppercase">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#888] tracking-wider uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-[#E8E4DD] last:border-0 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                      {sub.firstName}
                    </td>
                    <td className="px-4 py-3 text-[#666]">{sub.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[#888]">
                        <MapPin className="h-3 w-3" />
                        {sub.location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {sub.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#888]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
