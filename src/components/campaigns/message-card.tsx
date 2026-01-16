'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'

interface MessageCardProps {
  message: {
    id: string
    channel: string
    status: string
    sentAt: string | null
    openedAt: string | null
    clickedAt: string | null
    respondedAt: string | null
    errorMessage: string | null
    leadName: string
    leadEmail: string
  }
}

export function MessageCard({ message }: MessageCardProps) {
  const ChannelIcon = message.channel === 'EMAIL' ? Mail : Phone

  const statusColors: Record<string, string> = {
    SENT: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    OPENED: 'bg-purple-100 text-purple-800',
    CLICKED: 'bg-orange-100 text-orange-800',
    RESPONDED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    BOUNCED: 'bg-red-100 text-red-800',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ChannelIcon className="h-5 w-5 mt-1 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">{message.leadName}</p>
              <Badge className={statusColors[message.status]}>
                {message.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {message.leadEmail}
            </p>

            <div className="space-y-1 text-sm">
              {message.sentAt && (
                <div>Sent: {format(new Date(message.sentAt), 'PPp')}</div>
              )}
              {message.openedAt && (
                <div className="text-purple-600">
                  ✓ Opened: {format(new Date(message.openedAt), 'PPp')}
                </div>
              )}
              {message.clickedAt && (
                <div className="text-orange-600">
                  ✓ Clicked: {format(new Date(message.clickedAt), 'PPp')}
                </div>
              )}
              {message.respondedAt && (
                <div className="text-green-600">
                  ✓ Responded: {format(new Date(message.respondedAt), 'PPp')}
                </div>
              )}
              {message.errorMessage && (
                <div className="text-red-600">
                  ✗ Error: {message.errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
