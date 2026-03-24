'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Send, PenLine } from 'lucide-react'

interface EmailDraftEditorProps {
  draft: {
    id: string
    subject: string
    body: string
    status: string
    editedByUser: boolean
    lead: {
      firstName: string
      lastName: string
      email: string | null
      organization: string | null
    }
  }
  campaignId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function EmailDraftEditor({
  draft,
  campaignId,
  open,
  onOpenChange,
  onSave,
}: EmailDraftEditorProps) {
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSent = draft.status === 'SENT'
  const isEdited = draft.editedByUser
  const hasChanges = subject !== draft.subject || body !== draft.body

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/drafts/${draft.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, body }),
        }
      )
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save draft')
      }
      onSave()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    setIsSending(true)
    setError(null)
    try {
      // Save any pending changes first
      if (hasChanges) {
        const saveResponse = await fetch(
          `/api/campaigns/${campaignId}/drafts/${draft.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body }),
          }
        )
        if (!saveResponse.ok) {
          throw new Error('Failed to save changes before sending')
        }
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/drafts/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftIds: [draft.id] }),
        }
      )
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send email')
      }
      onSave()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const isProcessing = isSaving || isSending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>
              {draft.lead.firstName} {draft.lead.lastName}
            </DialogTitle>
            {isEdited && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                <PenLine className="h-3 w-3" />
                Edited
              </Badge>
            )}
            {isSent && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300"
              >
                Sent
              </Badge>
            )}
          </div>
          <DialogDescription>
            {draft.lead.email}
            {draft.lead.organization && ` - ${draft.lead.organization}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="draft-subject">Subject</Label>
            <Input
              id="draft-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSent || isProcessing}
              placeholder="Email subject line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="draft-body">Body</Label>
            <Textarea
              id="draft-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSent || isProcessing}
              rows={15}
              className="font-mono text-sm resize-none"
              placeholder="Email body content"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          {!isSent && (
            <>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isProcessing || !hasChanges}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button onClick={handleSend} disabled={isProcessing}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send This Email
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
