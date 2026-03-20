'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  MapPin,
} from 'lucide-react';

interface EmailDraft {
  id: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    organization: string | null;
  };
  campaign: {
    id: string;
    name: string;
    baseLocation: string;
  };
}

type FilterTab = 'all' | 'DRAFT' | 'SENT' | 'FAILED';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  DRAFT: { bg: 'bg-amber-100', text: 'text-amber-800', icon: FileText },
  APPROVED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
  SENT: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2 },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
};

export default function OutreachPage() {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await fetch(`/api/email-drafts?limit=100${statusParam}`);
      if (!res.ok) throw new Error('Failed to load email drafts');
      const data = await res.json();
      setDrafts(data.drafts);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Selection helpers
  const draftOnlyItems = drafts.filter(d => d.status === 'DRAFT' || d.status === 'APPROVED');
  const allDraftSelected = draftOnlyItems.length > 0 && draftOnlyItems.every(d => selected.has(d.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allDraftSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(draftOnlyItems.map(d => d.id)));
    }
  };

  const handleSendSelected = async () => {
    if (selected.size === 0) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/email-drafts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftIds: Array.from(selected) }),
      });
      if (!res.ok) throw new Error('Failed to send emails');
      const result = await res.json();
      setSendResult(result);
      setSelected(new Set());
      await fetchDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setIsSending(false);
    }
  };

  // Stats
  const draftCount = drafts.filter(d => d.status === 'DRAFT' || d.status === 'APPROVED').length;
  const sentCount = drafts.filter(d => d.status === 'SENT').length;
  const failedCount = drafts.filter(d => d.status === 'FAILED').length;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: total },
    { key: 'DRAFT', label: 'Drafts', count: draftCount },
    { key: 'SENT', label: 'Sent', count: sentCount },
    { key: 'FAILED', label: 'Failed', count: failedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Outreach</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and send AI-generated outreach emails across all campaigns
          </p>
        </div>
        {selected.size > 0 && (
          <Button
            onClick={handleSendSelected}
            disabled={isSending}
            className="bg-[#C05A3C] hover:bg-[#a84d33]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending {selected.size}...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send {selected.size} Selected
              </>
            )}
          </Button>
        )}
      </div>

      {/* Send result banner */}
      {sendResult && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm">
            <span className="font-medium">{sendResult.sent} emails sent</span>
            {sendResult.failed > 0 && (
              <span className="text-red-600 ml-2">({sendResult.failed} failed)</span>
            )}
          </p>
          <button
            onClick={() => setSendResult(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelected(new Set()); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#C05A3C] text-[#C05A3C]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading drafts...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-red-600">{error}</p>
          <Button onClick={fetchDrafts} variant="outline" className="mt-3">
            Try again
          </Button>
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mail className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">No email drafts yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Create a campaign from a booking to discover leads, then generate AI-powered outreach emails.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select all row */}
          {draftOnlyItems.length > 0 && (activeTab === 'all' || activeTab === 'DRAFT') && (
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
              <Checkbox
                checked={allDraftSelected}
                onCheckedChange={toggleSelectAll}
              />
              <span>Select all drafts ({draftOnlyItems.length})</span>
            </div>
          )}

          {/* Draft rows */}
          {drafts.map(draft => {
            const style = STATUS_STYLES[draft.status] || STATUS_STYLES.DRAFT;
            const StatusIcon = style.icon;
            const isSendable = draft.status === 'DRAFT' || draft.status === 'APPROVED';

            return (
              <div
                key={draft.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:bg-muted/30 transition-colors"
              >
                {/* Checkbox */}
                {isSendable && (
                  <Checkbox
                    checked={selected.has(draft.id)}
                    onCheckedChange={() => toggleSelect(draft.id)}
                  />
                )}
                {!isSendable && <div className="w-4" />}

                {/* Status icon */}
                <StatusIcon className={`h-4 w-4 shrink-0 ${style.text}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {draft.lead.firstName} {draft.lead.lastName}
                    </p>
                    {draft.lead.organization && (
                      <span className="text-xs text-muted-foreground truncate">
                        ({draft.lead.organization})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {draft.subject}
                  </p>
                </div>

                {/* Campaign info */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{draft.campaign.baseLocation}</span>
                </div>

                {/* Status badge */}
                <Badge className={`shrink-0 ${style.bg} ${style.text} border-0`}>
                  {draft.status}
                </Badge>

                {/* View in campaign link */}
                <Link
                  href={`/dashboard/campaigns/${draft.campaign.id}`}
                  className="text-xs text-[#C05A3C] hover:underline shrink-0"
                >
                  View
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
