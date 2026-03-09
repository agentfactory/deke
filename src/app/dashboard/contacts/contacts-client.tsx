'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Download, Plus, MoreHorizontal, Eye, Mail,
  Trash2, ArrowUpDown, ChevronLeft, ChevronRight, X, Phone,
  RefreshCw
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

// --- Types & Constants ---

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'WON', 'LOST', 'DORMANT'] as const
const SOURCES = ['website', 'website_booking_form', 'website_chat', 'referral', 'social', 'event', 'campaign', 'other'] as const

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-yellow-500',
  QUALIFIED: 'bg-green-500',
  PROPOSAL_SENT: 'bg-purple-500',
  NEGOTIATING: 'bg-orange-500',
  WON: 'bg-emerald-500',
  LOST: 'bg-red-500',
  DORMANT: 'bg-gray-400',
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
      // Add with default _count
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

  // --- Render ---

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
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
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-10 w-10 text-stone-300" />
          <p className="mt-3 text-sm text-stone-500">No leads match your filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 dark:bg-stone-900">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="rounded border-stone-300"
                  />
                </TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Phone</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Organization</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Score</TableHead>
                <TableHead className="font-semibold text-center hidden sm:table-cell">Bookings</TableHead>
                <TableHead className="font-semibold text-center hidden lg:table-cell">Campaigns</TableHead>
                <TableHead className="font-semibold hidden xl:table-cell">Last Contact</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                <TableHead className="font-semibold w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(lead => (
                <TableRow key={lead.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="rounded border-stone-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="font-medium text-stone-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-stone-600 dark:text-stone-400 max-w-[180px] truncate">
                    {lead.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-stone-600 dark:text-stone-400">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-600 inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-stone-400">{'\u2014'}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stone-600 dark:text-stone-400">
                    {lead.organization || '\u2014'}
                  </TableCell>
                  <TableCell>
                    {lead.source ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {lead.source.replace(/_/g, ' ')}
                      </Badge>
                    ) : (
                      <span className="text-stone-400">{'\u2014'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[lead.status] || 'bg-gray-400'}`} />
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span className="text-sm font-medium text-stone-900 dark:text-white">{lead.score}</span>
                      <div className="w-8 h-1 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(lead.score, 100)}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-stone-600 dark:text-stone-400 hidden sm:table-cell">
                    {lead._count.bookings}
                  </TableCell>
                  <TableCell className="text-center text-stone-600 dark:text-stone-400 hidden lg:table-cell">
                    {lead._count.campaignLeads}
                  </TableCell>
                  <TableCell className="text-stone-500 dark:text-stone-400 text-sm whitespace-nowrap hidden xl:table-cell">
                    {lead.lastContactedAt ? relativeTime(lead.lastContactedAt) : '\u2014'}
                  </TableCell>
                  <TableCell className="text-stone-500 dark:text-stone-400 text-sm whitespace-nowrap hidden sm:table-cell">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
                          <Eye className="h-4 w-4 mr-2" /> View Profile
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
          <span className="text-sm text-stone-500">
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
            <span className="text-sm text-stone-600">
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
