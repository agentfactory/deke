'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ArrowUpDown, ChevronLeft, ChevronRight,
  Package, Clock, CheckCircle2, Loader2, MoreHorizontal,
  Trash2, Eye, Music, DollarSign,
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

// --- Types & Constants ---

const STATUSES = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'REVISION', 'COMPLETED', 'DELIVERED', 'CANCELLED'] as const

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  IN_PROGRESS: 'text-blue-700 bg-blue-50 border-blue-200',
  REVIEW: 'text-purple-700 bg-purple-50 border-purple-200',
  REVISION: 'text-orange-700 bg-orange-50 border-orange-200',
  COMPLETED: 'text-green-700 bg-green-50 border-green-200',
  DELIVERED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  CANCELLED: 'text-red-700 bg-red-50 border-red-200',
}

const STATUS_DOTS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-purple-500',
  REVISION: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
}

const PAGE_SIZE = 25

type OrderContact = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organization: string | null
}

type Order = {
  id: string
  leadId: string
  contact: OrderContact
  orderNumber: string
  status: string
  songTitle: string | null
  songArtist: string | null
  voiceParts: number | null
  packageTier: string | null
  basePrice: number | null
  rushFee: number | null
  totalAmount: number | null
  dueDate: string | null
  deliveredAt: string | null
  downloadUrl: string | null
  revisionsUsed: number
  revisionsMax: number
  createdAt: string
  updatedAt: string
}

type Stats = { total: number; pending: number; inProgress: number; completed: number }
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'due_soon'

// --- Helpers ---

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 0) return `in ${Math.abs(days)}d`
  if (days === 0) return 'today'
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatStatus(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// --- Component ---

export default function OrdersClient({
  initialOrders,
  stats,
}: {
  initialOrders: Order[]
  stats: Stats
}) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Status edit in sheet
  const [editingStatus, setEditingStatus] = useState(false)
  const [statusForm, setStatusForm] = useState('')
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  // --- Filtered & sorted ---
  const filtered = useMemo(() => {
    let result = [...orders]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(o =>
        `${o.contact?.firstName ?? ''} ${o.contact?.lastName ?? ''}`.toLowerCase().includes(q) ||
        (o.contact?.email ?? '').toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        (o.songTitle || '').toLowerCase().includes(q) ||
        (o.songArtist || '').toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)

    result.sort((a, b) => {
      switch (sortField) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount_high': return (b.totalAmount || 0) - (a.totalAmount || 0)
        case 'due_soon': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          return aDate - bDate
        }
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [orders, searchQuery, statusFilter, sortField])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const updateFilter = useCallback((setter: (v: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }, [])

  // --- Actions ---

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (detailOrder?.id === id) setDetailOrder(prev => prev ? { ...prev, status } : null)
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  const saveStatus = async () => {
    if (!detailOrder) return
    setIsSavingStatus(true)
    await updateStatus(detailOrder.id, statusForm)
    setIsSavingStatus(false)
    setEditingStatus(false)
  }

  const deleteOrder = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to delete order')
        return
      }
      setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
      if (detailOrder?.id === deleteTarget.id) setDetailOrder(null)
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Orders
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Arrangement orders and delivery tracking
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Package className="h-5 w-5 text-stone-500" />} label="Total" value={stats.total} />
          <StatCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending" value={stats.pending} highlight="yellow" />
          <StatCard icon={<Loader2 className="h-5 w-5 text-blue-500" />} label="In Progress" value={stats.inProgress} highlight="blue" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completed" value={stats.completed} highlight="green" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search order #, name, song..."
              value={searchQuery}
              onChange={e => updateFilter(setSearchQuery, e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={v => updateFilter(setStatusFilter, v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOTS[s]}`} />
                    {formatStatus(s)}
                  </span>
                </SelectItem>
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
              <SelectItem value="due_soon">Due Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-10 w-10 text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">No orders match your filters.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-200 dark:border-stone-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 dark:bg-stone-900">
                  <TableHead className="font-semibold">Order #</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Song</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Due</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(order => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
                    onClick={() => { setDetailOrder(order); setEditingStatus(false) }}
                  >
                    <TableCell className="font-mono text-xs text-stone-600">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-stone-900 dark:text-white text-sm">
                        {order.contact?.firstName ?? 'Unknown'} {order.contact?.lastName ?? ''}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-stone-600">
                      {order.songTitle ? (
                        <span>{order.songTitle}{order.songArtist ? ` — ${order.songArtist}` : ''}</span>
                      ) : (
                        <span className="text-stone-400">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[order.status] || ''}`}>
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {order.totalAmount ? formatCurrency(order.totalAmount) : <span className="text-stone-400">&mdash;</span>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-stone-500 whitespace-nowrap">
                      {order.dueDate ? relativeTime(order.dueDate) : <span className="text-stone-400">&mdash;</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => { setDetailOrder(order); setEditingStatus(false) }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {STATUSES.map(s => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus(order.id, s)} disabled={order.status === s}>
                              <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_DOTS[s]}`} />
                              {formatStatus(s)}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(order)}>
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
            <span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailOrder} onOpenChange={open => { if (!open) setDetailOrder(null) }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              {detailOrder && `${detailOrder.orderNumber}`}
            </SheetDescription>
          </SheetHeader>

          {detailOrder && (
            <div className="mt-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-sm px-3 py-1 ${STATUS_STYLES[detailOrder.status] || ''}`}>
                  {formatStatus(detailOrder.status)}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => { setStatusForm(detailOrder.status); setEditingStatus(true) }}>
                  Change Status
                </Button>
              </div>

              {editingStatus && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">New Status</Label>
                    <Select value={statusForm} onValueChange={setStatusForm}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => (<SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={saveStatus} disabled={isSavingStatus}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingStatus(false)}>Cancel</Button>
                </div>
              )}

              {/* Client */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Client</h3>
                <div className="text-sm space-y-1">
                  <p>
                    {detailOrder.contact ? (
                      <Link href={`/dashboard/leads/${detailOrder.contact.id}`} className="text-blue-600 hover:underline font-medium">
                        {detailOrder.contact.firstName} {detailOrder.contact.lastName}
                      </Link>
                    ) : 'Unknown Contact'}
                  </p>
                  <p className="text-stone-500">{detailOrder.contact?.email ?? ''}</p>
                  {detailOrder.contact?.phone && <p className="text-stone-500">{detailOrder.contact?.phone}</p>}
                </div>
              </div>

              {/* Song Details */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <Music className="h-4 w-4" /> Arrangement
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-stone-500">Song:</span> {detailOrder.songTitle || '—'}</p>
                  <p><span className="text-stone-500">Artist:</span> {detailOrder.songArtist || '—'}</p>
                  <p><span className="text-stone-500">Voice Parts:</span> {detailOrder.voiceParts || '—'}</p>
                  <p><span className="text-stone-500">Package:</span> {detailOrder.packageTier || '—'}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Pricing
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-stone-500">Base:</span> {detailOrder.basePrice ? formatCurrency(detailOrder.basePrice) : '—'}</p>
                  <p><span className="text-stone-500">Rush Fee:</span> {detailOrder.rushFee ? formatCurrency(detailOrder.rushFee) : '—'}</p>
                  <p className="font-semibold"><span className="text-stone-500">Total:</span> {detailOrder.totalAmount ? formatCurrency(detailOrder.totalAmount) : '—'}</p>
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Delivery</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-stone-500">Due:</span> {detailOrder.dueDate ? formatDate(detailOrder.dueDate) : '—'}</p>
                  <p><span className="text-stone-500">Delivered:</span> {detailOrder.deliveredAt ? formatDate(detailOrder.deliveredAt) : '—'}</p>
                  <p><span className="text-stone-500">Revisions:</span> {detailOrder.revisionsUsed} / {detailOrder.revisionsMax}</p>
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700"
                onClick={() => setDeleteTarget(detailOrder)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Order
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order <strong>{deleteTarget?.orderNumber}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={deleteOrder} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: string }) {
  const border = highlight === 'yellow' ? 'border-l-yellow-400' : highlight === 'blue' ? 'border-l-blue-400' : highlight === 'green' ? 'border-l-green-400' : 'border-l-stone-200'
  return (
    <div className={`rounded-lg border border-stone-200 dark:border-stone-800 border-l-4 ${border} p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</span></div>
      <p className="text-2xl font-bold text-stone-900 dark:text-white">{value}</p>
    </div>
  )
}
