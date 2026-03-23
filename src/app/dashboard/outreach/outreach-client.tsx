'use client'

import { useState } from 'react'
import {
  Plus, Mail, Clock, CheckCircle, Pencil, Trash2, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'

const CHANNELS = ['EMAIL', 'SMS', 'LINKEDIN'] as const
const SERVICE_TYPES = ['ARRANGEMENT', 'FESTIVAL', 'GROUP_COACHING', 'INDIVIDUAL_COACHING', 'WORKSHOP', 'SPEAKING', 'MASTERCLASS', 'CONSULTATION'] as const

type Template = {
  id: string
  name: string
  subject: string | null
  body: string
  channel: string
  serviceType: string | null
  variables: string | null
  createdAt: string
  updatedAt: string
}

type Stats = {
  totalSent: number
  openRate: number
  clickRate: number
}

const emptyForm = {
  name: '',
  subject: '',
  body: '',
  channel: 'EMAIL',
  serviceType: '',
}

function formatServiceType(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export default function OutreachClient({
  initialTemplates,
  stats,
}: {
  initialTemplates: Template[]
  stats: Stats
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (t: Template) => {
    setEditingId(t.id)
    setForm({
      name: t.name,
      subject: t.subject || '',
      body: t.body,
      channel: t.channel,
      serviceType: t.serviceType || '',
    })
    setDialogOpen(true)
  }

  const saveTemplate = async () => {
    setIsSaving(true)
    try {
      const payload = {
        name: form.name,
        subject: form.subject || null,
        body: form.body,
        channel: form.channel,
        serviceType: form.serviceType || null,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/templates/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to save template')
        return
      }

      const saved = await res.json()
      const serialized: Template = {
        ...saved,
        createdAt: new Date(saved.createdAt).toISOString(),
        updatedAt: new Date(saved.updatedAt).toISOString(),
      }

      if (editingId) {
        setTemplates(prev => prev.map(t => t.id === editingId ? serialized : t))
      } else {
        setTemplates(prev => [serialized, ...prev])
      }

      setDialogOpen(false)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteTemplate = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/templates/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to delete template')
        return
      }
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id))
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
              Outreach & Templates
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Manage email sequences and message templates
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalSent}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.openRate}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.clickRate}%</div></CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pre-configured email and SMS templates for outreach
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No message templates yet. Create your first template to get started.
                </p>
              ) : (
                templates.map(template => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.channel} &middot; {template.serviceType ? formatServiceType(template.serviceType) : 'General'}
                      </p>
                      {template.subject && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Subject: {template.subject}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">{template.channel}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(template)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteTarget(template)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the template details below.' : 'Create a new message template for outreach.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tpl-name">Name</Label>
              <Input id="tpl-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Workshop Follow-up" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service Type</Label>
                <Select value={form.serviceType || 'none'} onValueChange={v => setForm(p => ({ ...p, serviceType: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General</SelectItem>
                    {SERVICE_TYPES.map(s => (<SelectItem key={s} value={s}>{formatServiceType(s)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.channel === 'EMAIL' && (
              <div>
                <Label htmlFor="tpl-subject">Subject Line</Label>
                <Input id="tpl-subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject" />
              </div>
            )}
            <div>
              <Label htmlFor="tpl-body">Body</Label>
              <Textarea id="tpl-body" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Template body text..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveTemplate} disabled={isSaving || !form.name || !form.body}>
              {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={deleteTemplate} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
