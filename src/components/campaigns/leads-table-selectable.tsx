'use client'

import { useState, useEffect } from 'react'
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
import { ArrowUpDown } from 'lucide-react'

interface CampaignLead {
  id: string
  score: number
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
  onSelectionChange: (selected: CampaignLead[]) => void
}

export function LeadsTableSelectable({ leads, onSelectionChange }: LeadsTableSelectableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])

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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('status')}</Badge>
      ),
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
      accessorKey: 'lead.phone',
      header: 'Phone',
      cell: ({ row }) => row.original.lead.phone || '—',
    },
    {
      accessorKey: 'lead.organization',
      header: 'Organization',
      cell: ({ row }) => row.original.lead.organization || '—',
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
          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
