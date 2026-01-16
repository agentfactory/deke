'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Pause, Play } from 'lucide-react'

interface BulkActionsToolbarProps {
  selectedCount: number
  selectedLeadIds: string[]
  campaignId: string
  onActionComplete: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  selectedLeadIds,
  campaignId,
  onActionComplete,
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendEmail = async () => {
    if (!confirm(`Send email to ${selectedCount} selected leads?`)) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'EMAIL',
          leadIds: selectedLeadIds,
        }),
      })

      if (!response.ok) throw new Error('Failed to send emails')

      const result = await response.json()
      alert(`Sent ${result.sent} emails successfully`)
      onActionComplete()
    } catch (error) {
      alert('Failed to send emails')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendSMS = async () => {
    if (!confirm(`Send SMS to ${selectedCount} selected leads?`)) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'SMS',
          leadIds: selectedLeadIds,
        }),
      })

      if (!response.ok) throw new Error('Failed to send SMS')

      const result = await response.json()
      alert(`Sent ${result.sent} SMS successfully`)
      onActionComplete()
    } catch (error) {
      alert('Failed to send SMS')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePauseFollowUps = async () => {
    setIsProcessing(true)
    try {
      await Promise.all(
        selectedLeadIds.map(leadId =>
          fetch(`/api/campaigns/${campaignId}/leads/${leadId}/pause`, {
            method: 'POST',
          })
        )
      )
      alert(`Paused follow-ups for ${selectedCount} leads`)
      onActionComplete()
    } catch (error) {
      alert('Failed to pause follow-ups')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResumeFollowUps = async () => {
    setIsProcessing(true)
    try {
      await Promise.all(
        selectedLeadIds.map(leadId =>
          fetch(`/api/campaigns/${campaignId}/leads/${leadId}/resume`, {
            method: 'POST',
          })
        )
      )
      alert(`Resumed follow-ups for ${selectedCount} leads`)
      onActionComplete()
    } catch (error) {
      alert('Failed to resume follow-ups')
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <p className="text-sm font-medium">{selectedCount} leads selected</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendEmail}
          disabled={isProcessing}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendSMS}
          disabled={isProcessing}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send SMS
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePauseFollowUps}
          disabled={isProcessing}
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause Follow-ups
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResumeFollowUps}
          disabled={isProcessing}
        >
          <Play className="h-4 w-4 mr-2" />
          Resume
        </Button>
      </div>
    </div>
  )
}
