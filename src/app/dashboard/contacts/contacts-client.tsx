'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Download, Plus, MoreHorizontal, Eye, Mail,
  Trash2, ArrowUpDown, ChevronLeft, ChevronRight, X, Phone,
  ExternalLink, Pencil, Building2, Calendar, Target,
  Clock, Briefcase
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
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

// --- Types & Constants ---

const SOURCES = ['website', 'website_booking_form', 'website_chat', 'referral', 'social', 'event', 'campaign', 'manual', 'other'] as const

const PAGE_SIZE = 25

type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  organization: string | null
  source: string | null
  contactTitle: string | null
  leadId: string | null
  createdAt: string
  updatedAt: string
  _count: { bookings: number }
}

type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'bookings_high'

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

function toCSV(contacts: Contact[]): string {
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Organization', 'Title', 'Source', 'Bookings', 'Created']
  const rows = contacts.map(c => [
    c.firstName, c.lastName, c.email || '', c.phone || '', c.organization || '',
    c.contactTitle || '', c.source || '', String(c._count.bookings), formatDate(c.createdAt),
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

export default function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail sheet
  const [detailContact, setDetailContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', organization: '',
    source: '', contactTitle: '',
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', organization: '',
    source: 'manual' as string, contactTitle: '',
  })

  // --- Filtered & sorted contacts ---
  const filtered = useMemo(() => {
    let result = [...contacts]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.organization || '').toLowerCase().includes(q) ||
        (c.contactTitle || '').toLowerCase().includes(q)
      )
    }

    // Filters
    if (sourceFilter !== 'all') result = result.filter(c => c.source === sourceFilter)

    // Sort
    result.sort((a, b) => {
      switch (sortField) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name_asc': return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'name_desc': return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        case 'bookings_high': return b._count.bookings - a._count.bookings
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [contacts, searchQuery, sourceFilter, sortField])

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
      setSelectedIds(new Set(paginated.map(c => c.id)))
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to delete contact')
        return
      }
      setContacts(prev => prev.filter(c => c.id !== id))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      // Close detail sheet if deleting the viewed contact
      if (detailContact?.id === id) {
        setDetailContact(null)
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setDeleteTarget(null)
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected contact(s)?`)) return
    const ids = Array.from(selectedIds)
    await Promise.all(ids.map(id => deleteContact(id)))
    setSelectedIds(new Set())
  }

  const addContact = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          organization: form.organization || null,
          source: form.source,
          contactTitle: form.contactTitle || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to create contact')
        return
      }
      const newContact = await res.json()
      setContacts(prev => [{
        ...newContact,
        createdAt: newContact.createdAt || new Date().toISOString(),
        updatedAt: newContact.updatedAt || new Date().toISOString(),
        _count: { bookings: 0 },
      }, ...prev])
      setIsAddOpen(false)
      setForm({ firstName: '', lastName: '', email: '', phone: '', organization: '', source: 'manual', contactTitle: '' })
    } catch (err) {
      console.error('Add contact failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportCSV = (subset?: Contact[]) => {
    const data = subset || filtered
    downloadCSV(toCSV(data), `contacts-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // --- Detail Sheet ---

  const openDetail = (contact: Contact) => {
    setDetailContact(contact)
    setIsEditing(false)
  }

  const startEditing = () => {
    if (!detailContact) return
    setEditForm({
      firstName: detailContact.firstName,
      lastName: detailContact.lastName,
      email: detailContact.email || '',
      phone: detailContact.phone || '',
      organization: detailContact.organization || '',
      source: detailContact.source || 'manual',
      contactTitle: detailContact.contactTitle || '',
    })
    setIsEditing(true)
  }

  const saveEdit = async () => {
    if (!detailContact) return
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/contacts/${detailContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email || null,
          phone: editForm.phone || null,
          organization: editForm.organization || null,
          source: editForm.source,
          contactTitle: editForm.contactTitle || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to update contact')
        return
      }
      const updated = {
        ...detailContact,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || null,
        organization: editForm.organization || null,
        source: editForm.source,
        contactTitle: editForm.contactTitle || null,
      }
      setContacts(prev => prev.map(c => c.id === detailContact.id ? updated : c))
      setDetailContact(updated)
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
            placeholder="Search name, email, org, title..."
            value={searchQuery}
            onChange={e => updateFilter(setSearchQuery, e.target.value)}
            className="pl-9"
          />
        </div>

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
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="name_desc">Name Z-A</SelectItem>
            <SelectItem value="bookings_high">Most Bookings</SelectItem>
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

          <Button variant="outline" size="sm" onClick={() => {
            const subset = contacts.filter(c => selectedIds.has(c.id))
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
          <p className="mt-3 text-sm text-[#666666]">No contacts match your filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#E8E4DD] overflow-x-auto bg-white">
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
                <TableHead className="font-semibold text-[#1a1a1a]">Name</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a]">Email</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] hidden lg:table-cell">Organization</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] hidden lg:table-cell">Title</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] hidden md:table-cell">Source</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] text-center hidden sm:table-cell">Bookings</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] hidden md:table-cell">Added</TableHead>
                <TableHead className="font-semibold text-[#1a1a1a] w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(contact => (
                <TableRow
                  key={contact.id}
                  className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('input[type="checkbox"]') || target.closest('[data-slot="dropdown-menu"]') || target.closest('button')) return
                    openDetail(contact)
                  }}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="rounded border-[#E8E4DD]"
                    />
                  </TableCell>
                  {/* Name */}
                  <TableCell>
                    <span className="font-medium text-[#1a1a1a] whitespace-nowrap">
                      {contact.firstName} {contact.lastName}
                    </span>
                  </TableCell>
                  {/* Email */}
                  <TableCell className="text-[#666666] max-w-[200px] truncate">
                    {contact.email || '\u2014'}
                  </TableCell>
                  {/* Organization */}
                  <TableCell className="text-[#666666] hidden lg:table-cell">
                    {contact.organization || '\u2014'}
                  </TableCell>
                  {/* Title */}
                  <TableCell className="hidden lg:table-cell">
                    {contact.contactTitle ? (
                      <Badge variant="outline" className="text-xs border-[#E8E4DD] text-[#666666]">
                        {contact.contactTitle}
                      </Badge>
                    ) : (
                      <span className="text-[#999999]">{'\u2014'}</span>
                    )}
                  </TableCell>
                  {/* Source */}
                  <TableCell className="hidden md:table-cell">
                    {contact.source ? (
                      <Badge variant="outline" className="text-xs capitalize border-[#E8E4DD] text-[#666666]">
                        {contact.source.replace(/_/g, ' ')}
                      </Badge>
                    ) : (
                      <span className="text-[#999999]">{'\u2014'}</span>
                    )}
                  </TableCell>
                  {/* Bookings */}
                  <TableCell className="text-center hidden sm:table-cell">
                    <span className="text-sm text-[#1a1a1a]">{contact._count.bookings}</span>
                  </TableCell>
                  {/* Added */}
                  <TableCell className="text-sm whitespace-nowrap hidden md:table-cell">
                    <span className="text-[#666666]">{relativeTime(contact.createdAt)}</span>
                  </TableCell>
                  {/* Actions */}
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(contact)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" /> Open Full Page
                        </DropdownMenuItem>
                        {contact.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${contact.email}`}>
                              <Mail className="h-4 w-4 mr-2" /> Send Email
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          disabled={contact._count.bookings > 0}
                          onClick={() => setDeleteTarget(contact)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                          {contact._count.bookings > 0 && <span className="text-xs ml-1">(has bookings)</span>}
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
      <Sheet open={!!detailContact} onOpenChange={(open) => { if (!open) { setDetailContact(null); setIsEditing(false) } }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {detailContact && !isEditing && (
            <>
              <SheetHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 pr-8">
                  <div>
                    <SheetTitle className="text-lg">
                      {detailContact.firstName} {detailContact.lastName}
                    </SheetTitle>
                    <SheetDescription className="mt-0.5">
                      {detailContact.contactTitle ? (
                        <span className="text-sm text-[#666666]">{detailContact.contactTitle}</span>
                      ) : (
                        <span className="text-sm text-[#999999]">Contact</span>
                      )}
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
                  <Link href={`/dashboard/contacts/${detailContact.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Full Page
                  </Link>
                </Button>
                {detailContact.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${detailContact.email}`}>
                      <Mail className="h-3.5 w-3.5 mr-1" /> Email
                    </a>
                  </Button>
                )}
              </div>

              {/* Contact info */}
              <div className="px-4 space-y-4">
                <div className="rounded-lg border border-[#E8E4DD] divide-y divide-[#E8E4DD]">
                  <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                    <a href={`mailto:${detailContact.email}`} className="text-blue-600 hover:underline text-sm">
                      {detailContact.email}
                    </a>
                  </DetailRow>
                  <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
                    {detailContact.phone ? (
                      <a href={`tel:${detailContact.phone}`} className="text-blue-600 hover:underline text-sm">
                        {detailContact.phone}
                      </a>
                    ) : (
                      <span className="text-[#999999] text-sm">{'\u2014'}</span>
                    )}
                  </DetailRow>
                  <DetailRow icon={<Building2 className="h-4 w-4" />} label="Organization">
                    <span className="text-sm">{detailContact.organization || '\u2014'}</span>
                  </DetailRow>
                  <DetailRow icon={<Briefcase className="h-4 w-4" />} label="Title">
                    <span className="text-sm">{detailContact.contactTitle || '\u2014'}</span>
                  </DetailRow>
                </div>

                {/* Details */}
                <div className="rounded-lg border border-[#E8E4DD] divide-y divide-[#E8E4DD]">
                  <DetailRow icon={<Target className="h-4 w-4" />} label="Source">
                    {detailContact.source ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {detailContact.source.replace(/_/g, ' ')}
                      </Badge>
                    ) : (
                      <span className="text-[#999999] text-sm">{'\u2014'}</span>
                    )}
                  </DetailRow>
                  <DetailRow icon={<Calendar className="h-4 w-4" />} label="Bookings">
                    <span className="text-sm">{detailContact._count.bookings}</span>
                  </DetailRow>
                  {detailContact.leadId && (
                    <DetailRow icon={<ExternalLink className="h-4 w-4" />} label="Original Lead">
                      <Link
                        href={`/dashboard/leads/${detailContact.leadId}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Lead
                      </Link>
                    </DetailRow>
                  )}
                  <DetailRow icon={<Clock className="h-4 w-4" />} label="Added">
                    <span className="text-sm">{formatDate(detailContact.createdAt)}</span>
                  </DetailRow>
                  <DetailRow icon={<Clock className="h-4 w-4" />} label="Updated">
                    <span className="text-sm">{relativeTime(detailContact.updatedAt)}</span>
                  </DetailRow>
                </div>

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 w-full"
                  disabled={detailContact._count.bookings > 0}
                  onClick={() => setDeleteTarget(detailContact)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Contact
                  {detailContact._count.bookings > 0 && <span className="text-xs ml-1">(has bookings)</span>}
                </Button>
              </div>
            </>
          )}

          {/* Edit mode */}
          {detailContact && isEditing && (
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
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    placeholder="e.g. Music Director, President"
                    value={editForm.contactTitle}
                    onChange={e => setEditForm(f => ({ ...f, contactTitle: e.target.value }))}
                  />
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
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={saveEdit}
                    disabled={isSavingEdit || !editForm.firstName || !editForm.lastName}
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
            <DialogDescription>Create a new bookable contact.</DialogDescription>
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
              <label className="text-sm font-medium mb-1 block">Email</label>
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
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                placeholder="e.g. Music Director, President"
                value={form.contactTitle}
                onChange={e => setForm(f => ({ ...f, contactTitle: e.target.value }))}
              />
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button
              onClick={addContact}
              disabled={isSubmitting || !form.firstName || !form.lastName}
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
            <Button variant="destructive" onClick={() => deleteTarget && deleteContact(deleteTarget.id)}>
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
