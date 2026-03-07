'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUpDown, UserMinus, UserPlus } from 'lucide-react'

interface CampaignLead {
  id: string
  score: number
  distance: number
  source: string
  status: string
  lead: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    organization: string | null
    status: string
    score: number
  }
  outreachLogs: Array<{
    id: string
    channel: string
    status: string
    sentAt: string | null
    openedAt: string | null
    clickedAt: string | null
    respondedAt: string | null
    errorMessage: string | null
  }>
}

interface LeadsTableSelectableProps {
  leads: CampaignLead[]
  campaignId?: string
  onSelectionChange: (selected: CampaignLead[]) => void
  onLeadStatusChange?: () => void
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  PAST_CLIENT: { label: 'Past Client', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  DORMANT: { label: 'Dormant', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  SIMILAR_ORG: { label: 'Similar Org', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  AI_RESEARCH: { label: 'AI Research', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  MANUAL_IMPORT: { label: 'Manual', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
}

export function LeadsTableSelectable({ leads, campaignId, onSelectionChange, onLeadStatusChange }: LeadsTableSelectableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)

  const handleToggleStatus = useCallback(async (leadId: string, currentStatus: string) => {
    if (!campaignId) return
    const newStatus = currentStatus === 'REMOVED' ? 'PENDING' : 'REMOVED'
    setUpdatingLeadId(leadId)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok && onLeadStatusChange) {
        onLeadStatusChange()
      }
    } catch (err) {
      console.error('Failed to update lead status:', err)
    } finally {
      setUpdatingLeadId(null)
    }
  }, [campaignId, onLeadStatusChange])

  const columns: ColumnDef<CampaignLead>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: 'lead.firstName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.lead.firstName} {row.original.lead.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.lead.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'lead.organization',
      header: 'Organization',
      cell: ({ row }) => row.original.lead.organization || '—',
    },
    {
      accessorKey: 'distance',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Distance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dist = row.original.distance
        return dist != null ? `${Math.round(dist)} mi` : '—'
      },
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right">{row.getValue('score')}</div>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => {
        const source = row.original.source
        const config = SOURCE_BADGE[source] || { label: source, className: 'bg-zinc-500/20 text-zinc-400' }
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('status')}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const isRemoved = row.original.status === 'REMOVED'
        const isUpdating = updatingLeadId === row.original.id
        return campaignId ? (
          <Button
            variant="ghost"
            size="icon"
            className={isRemoved ? 'text-emerald-500 hover:text-emerald-400' : 'text-destructive hover:text-destructive'}
            onClick={() => handleToggleStatus(row.original.id, row.original.status)}
            disabled={isUpdating}
          >
            {isRemoved ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
          </Button>
        ) : null
      },
    },
  ]

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
    enableRowSelection: true,
  })

  useEffect(() => {
    const selected = table.getFilteredSelectedRowModel().rows.map(r => r.original)
    onSelectionChange(selected)
  }, [rowSelection, onSelectionChange, table])

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            className={row.original.status === 'REMOVED' ? 'opacity-40' : ''}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
