'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Download, Plus, MoreHorizontal, Eye, Mail,
  Trash2, ArrowUpDown, ChevronLeft, ChevronRight, X, Phone,
  RefreshCw, ExternalLink, Pencil, Building2, Calendar, Target,
  Megaphone, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

// --- Types & Constants ---

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST', 'DORMANT'] as const
const SOURCES = ['website', 'website_booking_form', 'website_chat', 'referral', 'social', 'event', 'campaign', 'manual', 'other'] as const

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-indigo-500',
  QUALIFIED: 'bg-purple-500',
  PROPOSAL_SENT: 'bg-amber-500',
  NEGOTIATING: 'bg-orange-500',
  WON: 'bg-green-500',
  LOST: 'bg-red-500',
  DORMANT: 'bg-gray-400',
}

const STATUS_TEXT_COLORS: Record<string, string> = {
  NEW: 'text-blue-700 bg-blue-50 border border-blue-200',
  CONTACTED: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
  QUALIFIED: 'text-purple-700 bg-purple-50 border border-purple-200',
  PROPOSAL_SENT: 'text-amber-700 bg-amber-50 border border-amber-200',
  NEGOTIATING: 'text-orange-700 bg-orange-50 border border-orange-200',
  WON: 'text-green-700 bg-green-50 border border-green-200',
  LOST: 'text-red-700 bg-red-50 border border-red-200',
  DORMANT: 'text-gray-600 bg-gray-100 border border-gray-200',
}

const PAGE_SIZE = 25

type Lead = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organization: string | null
  source: string | null
  status: string
  score: number
  createdAt: string
  lastContactedAt: string | null
  _count: { bookings: number; campaignLeads: number }
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'score_high' | 'score_low'

// --- Helpers ---

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

function toCSV(leads: Lead[]): string {
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Organization', 'Source', 'Status', 'Score', 'Created']
  const rows = leads.map(l => [
    l.firstName, l.lastName, l.email, l.phone || '', l.organization || '',
    l.source || '', l.status, String(l.score), formatDate(l.createdAt),
  ])
  return [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// --- Component ---

export default function ContactsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail sheet
  const [detailLead, setDetailLead] = useState<Lead | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', organization: '',
    source: '', status: '',
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', organization: '',
    source: 'website' as string, status: 'NEW' as string,
  })

  // --- Filtered & sorted leads ---
  const filtered = useMemo(() => {
    let result = [...leads]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l =>
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.organization || '').toLowerCase().includes(q)
      )
    }

    // Filters
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    if (sourceFilter !== 'all') result = result.filter(l => l.source === sourceFilter)

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name_asc': return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'score_high': return b.score - a.score
        case 'score_low': return a.score - b.score
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [leads, searchQuery, statusFilter, sourceFilter, sortField])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset page when filters change
  const updateFilter = useCallback((setter: (v: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }, [])

  // --- Actions ---

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map(l => l.id)))
    }
  }

  const changeStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      // Update detail sheet if open for this lead
      if (detailLead?.id === id) {
        setDetailLead(prev => prev ? { ...prev, status } : null)
      }
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  const bulkChangeStatus = async (status: string) => {
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map(id => changeStatus(id, status)))
    setSelectedIds(new Set())
  }

  const deleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to delete lead')
        return
      }
      setLeads(prev => prev.filter(l => l.id !== id))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      // Close detail sheet if deleting the viewed lead
      if (detailLead?.id === id) {
        setDetailLead(null)
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setDeleteTarget(null)
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected lead(s)?`)) return
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map(id => deleteLead(id)))
    setSelectedIds(new Set())
  }

  const addLead = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to create lead')
        return
      }
      const newLead = await res.json()
      setLeads(prev => [{
        ...newLead,
        createdAt: newLead.createdAt || new Date().toISOString(),
        _count: { bookings: 0, campaignLeads: 0 },
      }, ...prev])
      setIsAddOpen(false)
      setForm({ firstName: '', lastName: '', email: '', phone: '', organization: '', source: 'website', status: 'NEW' })
    } catch (err) {
      console.error('Add lead failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportCSV = (subset?: Lead[]) => {
    const data = subset || filtered
    downloadCSV(toCSV(data), `contacts-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // --- Detail Sheet ---

  const openDetail = (lead: Lead) => {
    setDetailLead(lead)
    setIsEditing(false)
  }

  const startEditing = () => {
    if (!detailLead) return
    setEditForm({
      firstName: detailLead.firstName,
      lastName: detailLead.lastName,
      email: detailLead.email,
      phone: detailLead.phone || '',
      organization: detailLead.organization || '',
      source: detailLead.source || 'website',
      status: detailLead.status,
    })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    if (!detailLead) return
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/leads/${detailLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone || null,
          organization: editForm.organization || null,
          source: editForm.source,
          status: editForm.status,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to update contact')
        return
      }
      const updated = {
        ...detailLead,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || null,
        organization: editForm.organization || null,
        source: editForm.source,
        status: editForm.status,
      }
      setLeads(prev => prev.map(l => l.id === detailLead.id ? updated : l))
      setDetailLead(updated)
      setIsEditing(false)
    } catch (err) {
      console.error('Edit failed:', err)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // --- Render ---

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
          <Input
            placeholder="Search name, email, org..."
            value={searchQuery}
            onChange={e => updateFilter(setSearchQuery, e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={v => updateFilter(setStatusFilter, v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[s]}`} />
                  {s}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={v => updateFilter(setSourceFilter, v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={v => setSortField(v as SortOption)}>
          <SelectTrigger className="w-[140px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="score_high">Score High</SelectItem>
            <SelectItem value="score_low">Score Low</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => exportCSV()}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>

        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Contact
        </Button>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUSES.map(s => (
                <DropdownMenuItem key={s} onClick={() => bulkChangeStatus(s)}>
                  <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_COLORS[s]}`} />
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => {
            const subset = leads.filter(l => selectedIds.has(l.id))
            exportCSV(subset)
          }}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export Selected
          </Button>

          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={bulkDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Compact Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-10 w-10 text-[#999999]" />
          <p className="mt-3 text-sm text-[#666666]">No leads match your filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#E8E4DD]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAFAF8]">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#E8E4DD]"
                  />
                </TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Score</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                <TableHead className="font-semibold w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(lead => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  onClick={(e) => {
                    // Don't open sheet if clicking checkbox or actions
                    const target = e.target as HTMLElement
                    if (target.closest('input[type="checkbox"]') || target.closest('[data-slot="dropdown-menu"]') || target.closest('button')) return
                    openDetail(lead)
                  }}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="rounded border-[#E8E4DD]"
                    />
                  </TableCell>
                  {/* Contact: name + email stacked, org as subtitle */}
                  <TableCell>
                    <div className="min-w-0">
                      <div className="font-medium text-[#1a1a1a] truncate">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-[#666666] truncate">
                        {lead.email}
                      </div>
                      {lead.organization && (
                        <div className="text-xs text-[#999999] truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {lead.organization}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {/* Status: colored badge */}
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_TEXT_COLORS[lead.status] || 'text-gray-600 bg-gray-100'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_COLORS[lead.status] || 'bg-gray-400'}`} />
                      {formatStatusLabel(lead.status)}
                    </span>
                  </TableCell>
                  {/* Score: number + mini bar */}
                  <TableCell className="text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span className="text-sm font-medium text-[#1a1a1a]">{lead.score}</span>
                      <div className="w-8 h-1 rounded-full bg-[#E8E4DD] overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(lead.score, 100)}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  {/* Date */}
                  <TableCell className="text-[#666666] text-sm whitespace-nowrap hidden sm:table-cell">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  {/* Actions ellipsis */}
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(lead)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" /> Open Full Page
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <RefreshCw className="h-4 w-4 mr-2" /> Change Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {STATUSES.map(s => (
                              <DropdownMenuItem key={s} onClick={() => changeStatus(lead.id, s)}>
                                <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_COLORS[s]}`} />
                                {s}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {lead.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${lead.email}`}>
                              <Mail className="h-4 w-4 mr-2" /> Send Email
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          disabled={lead._count.bookings > 0}
                          onClick={() => setDeleteTarget(lead)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                          {lead._count.bookings > 0 && <span className="text-xs ml-1">(has bookings)</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-[#666666]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm text-[#666666]">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline" size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail / Edit Sheet */}
      <Sheet open={!!detailLead} onOpenChange={(open) => { if (!open) { setDetailLead(null); setIsEditing(false) } }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {detailLead && !isEditing && (
            <>
              <SheetHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 pr-8">
                  <div>
                    <SheetTitle className="text-lg">
                      {detailLead.firstName} {detailLead.lastName}
                    </SheetTitle>
                    <SheetDescription className="mt-0.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_TEXT_COLORS[detailLead.status] || 'text-gray-600 bg-gray-100'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[detailLead.status] || 'bg-gray-400'}`} />
                        {formatStatusLabel(detailLead.status)}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick actions */}
              <div className="flex gap-2 px-4 pb-4">
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/leads/${detailLead.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Full Page
                  </Link>
                </Button>
                {detailLead.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${detailLead.email}`}>
                      <Mail className="h-3.5 w-3.5 mr-1" /> Email
                    </a>
                  </Button>
                )}
              </div>

              {/* Contact info */}
              <div className="px-4 space-y-4">
                <div className="rounded-lg border border-[#E8E4DD] divide-y divide-[#E8E4DD]">
                  <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                    <a href={`mailto:${detailLead.email}`} className="text-blue-600 hover:underline text-sm">
                      {detailLead.email}
                    </a>
                  </DetailRow>
                  <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
                    {detailLead.phone ? (
                      <a href={`tel:${detailLead.phone}`} className="text-blue-600 hover:underline text-sm">
                        {detailLead.phone}
                      </a>
                    ) : (
                      <span className="text-[#999999] text-sm">{'\u2014'}</span>
                    )}
                  </DetailRow>
                  <DetailRow icon={<Building2 className="h-4 w-4" />} label="Organization">
                    <span className="text-sm">{detailLead.organization || '\u2014'}</span>
                  </DetailRow>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-[#E8E4DD] divide-y divide-[#E8E4DD]">
                  <DetailRow icon={<Target className="h-4 w-4" />} label="Source">
                    {detailLead.source ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {detailLead.source.replace(/_/g, ' ')}
                      </Badge>
                    ) : (
                      <span className="text-[#999999] text-sm">{'\u2014'}</span>
                    )}
                  </DetailRow>
                  <DetailRow icon={<ArrowUpDown className="h-4 w-4" />} label="Score">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{detailLead.score}</span>
                      <div className="w-16 h-1.5 rounded-full bg-[#E8E4DD] overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(detailLead.score, 100)}%` }} />
                      </div>
                    </div>
                  </DetailRow>
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Bookings">
                    <span className="text-sm">{detailLead._count.bookings}</span>
                  </DetailRow>
                  <DetailRow icon={<Megaphone className="h-4 w-4" />} label="Campaigns">
                    <span className="text-sm">{detailLead._count.campaignLeads}</span>
                  </DetailRow>
                  <DetailRow icon={<Clock className="h-4 w-4" />} label="Last Contact">
                    <span className="text-sm">
                      {detailLead.lastContactedAt ? relativeTime(detailLead.lastContactedAt) : '\u2014'}
                    </span>
                  </DetailRow>
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Created">
                    <span className="text-sm">{formatDate(detailLead.createdAt)}</span>
                  </DetailRow>
                </div>

                {/* Status change */}
                <div>
                  <label className="text-xs text-[#666666] mb-1.5 block">Quick Status Change</label>
                  <Select value={detailLead.status} onValueChange={v => changeStatus(detailLead.id, v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[s]}`} />
                            {formatStatusLabel(s)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 w-full"
                  disabled={detailLead._count.bookings > 0}
                  onClick={() => setDeleteTarget(detailLead)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Contact
                  {detailLead._count.bookings > 0 && <span className="text-xs ml-1">(has bookings)</span>}
                </Button>
              </div>
            </>
          )}

          {/* Edit mode */}
          {detailLead && isEditing && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Contact</SheetTitle>
                <SheetDescription>Update contact information</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">First Name</label>
                    <Input value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Last Name</label>
                    <Input value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Organization</label>
                  <Input value={editForm.organization} onChange={e => setEditForm(f => ({ ...f, organization: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Source</label>
                  <Select value={editForm.source} onValueChange={v => setEditForm(f => ({ ...f, source: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{formatStatusLabel(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={saveEdit}
                    disabled={isSavingEdit || !editForm.firstName || !editForm.lastName || !editForm.email}
                    className="flex-1"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Contact Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Create a new lead in your CRM.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name *</label>
                <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name *</label>
                <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Organization</label>
              <Input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Source</label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button
              onClick={addLead}
              disabled={isSubmitting || !form.firstName || !form.lastName || !form.email}
            >
              {isSubmitting ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTarget?.firstName} {deleteTarget?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteLead(deleteTarget.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Detail Row helper ---

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex items-center gap-2 text-[#666666]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-[#1a1a1a]">
        {children}
      </div>
    </div>
  )
}
