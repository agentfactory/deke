'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ArrowUpDown, ChevronLeft, ChevronRight, X,
  MessageSquare, Clock, CheckCircle2, DollarSign, Send,
  Trash2, Eye, MoreHorizontal, ArrowRight, AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// --- Types & Constants ---

const STATUSES = ['PENDING', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const
const SERVICE_TYPES = ['ARRANGEMENT', 'GROUP_COACHING', 'INDIVIDUAL_COACHING', 'WORKSHOP', 'SPEAKING', 'MASTERCLASS', 'CONSULTATION'] as const

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  QUOTED: 'text-blue-700 bg-blue-50 border-blue-200',
  ACCEPTED: 'text-green-700 bg-green-50 border-green-200',
  DECLINED: 'text-red-700 bg-red-50 border-red-200',
  EXPIRED: 'text-gray-600 bg-gray-100 border-gray-200',
}

const STATUS_DOTS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  QUOTED: 'bg-blue-500',
  ACCEPTED: 'bg-green-500',
  DECLINED: 'bg-red-500',
  EXPIRED: 'bg-gray-400',
}

const PAGE_SIZE = 25

type InquiryLead = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organization: string | null
}

type InquiryBooking = {
  id: string
  serviceType: string
  status: string
} | null

type Inquiry = {
  id: string
  leadId: string
  lead: InquiryLead
  serviceType: string
  status: string
  details: string | null
  message: string | null
  quotedAmount: number | null
  quotedAt: string | null
  quoteExpiry: string | null
  createdAt: string
  updatedAt: string
  booking: InquiryBooking
}

type Stats = {
  total: number
  pending: number
  quoted: number
  accepted: number
}

type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low'

// --- Helpers ---

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
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

function formatServiceType(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

// --- Component ---

export default function InquiriesClient({
  initialInquiries,
  stats,
}: {
  initialInquiries: Inquiry[]
  stats: Stats
}) {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // Detail sheet
  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null)

  // Convert dialog
  const [convertTarget, setConvertTarget] = useState<Inquiry | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Quote edit
  const [editingQuote, setEditingQuote] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ amount: '', status: '' })
  const [isSavingQuote, setIsSavingQuote] = useState(false)

  // --- Filtered & sorted ---
  const filtered = useMemo(() => {
    let result = [...inquiries]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(inq =>
        `${inq.lead.firstName} ${inq.lead.lastName}`.toLowerCase().includes(q) ||
        inq.lead.email.toLowerCase().includes(q) ||
        (inq.lead.organization || '').toLowerCase().includes(q) ||
        inq.serviceType.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') result = result.filter(inq => inq.status === statusFilter)
    if (serviceFilter !== 'all') result = result.filter(inq => inq.serviceType === serviceFilter)

    result.sort((a, b) => {
      switch (sortField) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount_high': return (b.quotedAmount || 0) - (a.quotedAmount || 0)
        case 'amount_low': return (a.quotedAmount || 0) - (b.quotedAmount || 0)
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [inquiries, searchQuery, statusFilter, serviceFilter, sortField])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const updateFilter = useCallback((setter: (v: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }, [])

  // --- Actions ---

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))
      if (detailInquiry?.id === id) {
        setDetailInquiry(prev => prev ? { ...prev, status } : null)
      }
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  const saveQuote = async () => {
    if (!detailInquiry) return
    setIsSavingQuote(true)
    try {
      const amount = quoteForm.amount ? parseFloat(quoteForm.amount) : null
      const body: Record<string, unknown> = {}
      if (amount !== null) {
        body.quotedAmount = amount
        body.quotedAt = new Date().toISOString()
        body.status = 'QUOTED'
      }
      if (quoteForm.status) body.status = quoteForm.status

      const res = await fetch(`/api/inquiries/${detailInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save quote')
      const updated = await res.json()
      const serialized = {
        ...updated,
        createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : detailInquiry.createdAt,
        updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : detailInquiry.updatedAt,
        quotedAt: updated.quotedAt ? new Date(updated.quotedAt).toISOString() : null,
        quoteExpiry: updated.quoteExpiry ? new Date(updated.quoteExpiry).toISOString() : null,
        booking: detailInquiry.booking,
      }
      setInquiries(prev => prev.map(inq => inq.id === detailInquiry.id ? { ...inq, ...serialized } : inq))
      setDetailInquiry(prev => prev ? { ...prev, ...serialized } : null)
      setEditingQuote(false)
    } catch (err) {
      console.error('Save quote failed:', err)
    } finally {
      setIsSavingQuote(false)
    }
  }

  const convertToBooking = async () => {
    if (!convertTarget) return
    setIsConverting(true)
    try {
      // Create booking from inquiry data
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: convertTarget.leadId,
          inquiryId: convertTarget.id,
          serviceType: convertTarget.serviceType,
          amount: convertTarget.quotedAmount,
        }),
      })
      if (!bookingRes.ok) {
        const data = await bookingRes.json()
        alert(data.message || 'Failed to create booking')
        return
      }

      // Update inquiry status to ACCEPTED
      await fetch(`/api/inquiries/${convertTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })

      setInquiries(prev => prev.map(inq =>
        inq.id === convertTarget.id ? { ...inq, status: 'ACCEPTED' } : inq
      ))
      setConvertTarget(null)
      if (detailInquiry?.id === convertTarget.id) {
        setDetailInquiry(prev => prev ? { ...prev, status: 'ACCEPTED' } : null)
      }
      router.refresh()
    } catch (err) {
      console.error('Convert to booking failed:', err)
    } finally {
      setIsConverting(false)
    }
  }

  const deleteInquiry = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/inquiries/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to delete inquiry')
        return
      }
      setInquiries(prev => prev.filter(inq => inq.id !== deleteTarget.id))
      if (detailInquiry?.id === deleteTarget.id) {
        setDetailInquiry(null)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const openDetail = (inq: Inquiry) => {
    setDetailInquiry(inq)
    setEditingQuote(false)
  }

  const startQuoteEdit = () => {
    if (!detailInquiry) return
    setQuoteForm({
      amount: detailInquiry.quotedAmount?.toString() || '',
      status: detailInquiry.status,
    })
    setEditingQuote(true)
  }

  // --- Render ---

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage incoming service requests and convert them to bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<MessageSquare className="h-5 w-5 text-stone-500" />} label="Total" value={stats.total} />
          <StatCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending" value={stats.pending} highlight="yellow" />
          <StatCard icon={<DollarSign className="h-5 w-5 text-blue-500" />} label="Quoted" value={stats.quoted} highlight="blue" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Accepted" value={stats.accepted} highlight="green" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search name, email, service..."
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
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOTS[s]}`} />
                    {s}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={v => updateFilter(setServiceFilter, v)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {SERVICE_TYPES.map(s => (
                <SelectItem key={s} value={s}>{formatServiceType(s)}</SelectItem>
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
              <SelectItem value="amount_high">Amount High</SelectItem>
              <SelectItem value="amount_low">Amount Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-10 w-10 text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">No inquiries match your filters.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-200 dark:border-stone-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 dark:bg-stone-900">
                  <TableHead className="font-semibold">Lead</TableHead>
                  <TableHead className="font-semibold">Service</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Quote</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                  <TableHead className="font-semibold w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(inq => (
                  <TableRow
                    key={inq.id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
                    onClick={() => openDetail(inq)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-white">
                          {inq.lead.firstName} {inq.lead.lastName}
                        </p>
                        <p className="text-xs text-stone-500 truncate max-w-[200px]">
                          {inq.lead.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {formatServiceType(inq.serviceType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[inq.status] || ''}`}>
                        {inq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {inq.quotedAmount ? (
                        <span className="font-medium text-stone-900 dark:text-white">
                          {formatCurrency(inq.quotedAmount)}
                        </span>
                      ) : (
                        <span className="text-stone-400">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-stone-500 whitespace-nowrap">
                      {relativeTime(inq.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openDetail(inq)}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {STATUSES.map(s => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => updateStatus(inq.id, s)}
                              disabled={inq.status === s}
                            >
                              <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_DOTS[s]}`} />
                              Mark {s}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {inq.status !== 'ACCEPTED' && !inq.booking && (
                            <DropdownMenuItem onClick={() => setConvertTarget(inq)}>
                              <ArrowRight className="h-4 w-4 mr-2" /> Convert to Booking
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteTarget(inq)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-stone-500">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">{currentPage} / {totalPages}</span>
              <Button
                variant="outline" size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailInquiry} onOpenChange={open => { if (!open) setDetailInquiry(null) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Inquiry Details</SheetTitle>
            <SheetDescription>
              {detailInquiry && `${detailInquiry.lead.firstName} ${detailInquiry.lead.lastName} — ${formatServiceType(detailInquiry.serviceType)}`}
            </SheetDescription>
          </SheetHeader>

          {detailInquiry && (
            <div className="mt-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-sm px-3 py-1 ${STATUS_STYLES[detailInquiry.status] || ''}`}>
                  {detailInquiry.status}
                </Badge>
                {detailInquiry.booking && (
                  <Link href={`/dashboard/bookings`}>
                    <Badge variant="default" className="bg-green-600 cursor-pointer">
                      Has Booking
                    </Badge>
                  </Link>
                )}
              </div>

              {/* Lead Info */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Contact</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <Link href={`/dashboard/leads/${detailInquiry.lead.id}`} className="text-blue-600 hover:underline font-medium">
                      {detailInquiry.lead.firstName} {detailInquiry.lead.lastName}
                    </Link>
                  </p>
                  <p className="text-stone-500">{detailInquiry.lead.email}</p>
                  {detailInquiry.lead.phone && <p className="text-stone-500">{detailInquiry.lead.phone}</p>}
                  {detailInquiry.lead.organization && <p className="text-stone-500">{detailInquiry.lead.organization}</p>}
                </div>
              </div>

              {/* Service & Message */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Service Request</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-stone-500">Type:</span> {formatServiceType(detailInquiry.serviceType)}</p>
                  <p><span className="text-stone-500">Received:</span> {formatDate(detailInquiry.createdAt)}</p>
                  {detailInquiry.message && (
                    <div className="mt-2">
                      <p className="text-stone-500 mb-1">Message:</p>
                      <p className="bg-stone-50 dark:bg-stone-900 rounded p-3 text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                        {detailInquiry.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Section */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Quote</h3>
                  <Button variant="ghost" size="sm" onClick={startQuoteEdit}>
                    Edit
                  </Button>
                </div>

                {editingQuote ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="quote-amount" className="text-xs">Amount ($)</Label>
                      <Input
                        id="quote-amount"
                        type="number"
                        value={quoteForm.amount}
                        onChange={e => setQuoteForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quote-status" className="text-xs">Status</Label>
                      <Select value={quoteForm.status} onValueChange={v => setQuoteForm(prev => ({ ...prev, status: v }))}>
                        <SelectTrigger id="quote-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveQuote} disabled={isSavingQuote}>
                        {isSavingQuote ? 'Saving...' : 'Save Quote'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingQuote(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-stone-500">Amount:</span>{' '}
                      {detailInquiry.quotedAmount ? (
                        <span className="font-semibold text-stone-900 dark:text-white">
                          {formatCurrency(detailInquiry.quotedAmount)}
                        </span>
                      ) : (
                        <span className="text-stone-400">Not quoted</span>
                      )}
                    </p>
                    {detailInquiry.quotedAt && (
                      <p><span className="text-stone-500">Quoted on:</span> {formatDate(detailInquiry.quotedAt)}</p>
                    )}
                    {detailInquiry.quoteExpiry && (
                      <p><span className="text-stone-500">Expires:</span> {formatDate(detailInquiry.quoteExpiry)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {detailInquiry.status !== 'ACCEPTED' && !detailInquiry.booking && (
                  <Button onClick={() => setConvertTarget(detailInquiry)} className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" /> Convert to Booking
                  </Button>
                )}
                <div className="flex gap-2">
                  {STATUSES.filter(s => s !== detailInquiry.status).map(s => (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => updateStatus(detailInquiry.id, s)}
                    >
                      <span className={`h-2 w-2 rounded-full mr-1 ${STATUS_DOTS[s]}`} />
                      {s}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setDeleteTarget(detailInquiry)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Inquiry
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Convert to Booking Dialog */}
      <Dialog open={!!convertTarget} onOpenChange={open => { if (!open) setConvertTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Booking</DialogTitle>
            <DialogDescription>
              This will create a new booking for{' '}
              <strong>{convertTarget?.lead.firstName} {convertTarget?.lead.lastName}</strong>{' '}
              and mark this inquiry as Accepted.
            </DialogDescription>
          </DialogHeader>
          {convertTarget && (
            <div className="space-y-2 text-sm">
              <p><span className="text-stone-500">Service:</span> {formatServiceType(convertTarget.serviceType)}</p>
              {convertTarget.quotedAmount && (
                <p><span className="text-stone-500">Amount:</span> {formatCurrency(convertTarget.quotedAmount)}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertTarget(null)} disabled={isConverting}>
              Cancel
            </Button>
            <Button onClick={convertToBooking} disabled={isConverting}>
              {isConverting ? 'Converting...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inquiry from{' '}
              <strong>{deleteTarget?.lead.firstName} {deleteTarget?.lead.lastName}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteInquiry} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Stat Card ---

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number
  highlight?: 'yellow' | 'blue' | 'green'
}) {
  const highlightBorder = highlight === 'yellow'
    ? 'border-l-yellow-400'
    : highlight === 'blue'
      ? 'border-l-blue-400'
      : highlight === 'green'
        ? 'border-l-green-400'
        : 'border-l-stone-200'

  return (
    <div className={`rounded-lg border border-stone-200 dark:border-stone-800 border-l-4 ${highlightBorder} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-stone-900 dark:text-white">{value}</p>
    </div>
  )
}
