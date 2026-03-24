'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MapPin, Mail, Music, Clock, User, Calendar } from 'lucide-react'

interface GroupRequest {
  id: string
  name: string
  email: string | null
  location: string
  message: string
  status: string
  details?: string | null
  createdAt: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'NEW':
      return <Badge variant="default" className="bg-blue-500">New</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'IN_PROGRESS':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">In Progress</Badge>
    case 'RESPONDED':
    case 'COMPLETED':
      return <Badge variant="outline" className="border-green-500 text-green-600">Responded</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDateLong(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

const experienceLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  professional: 'Professional',
}

const commitmentLabels: Record<string, string> = {
  casual: 'Casual (once a month or less)',
  regular: 'Regular (weekly)',
  intensive: 'Intensive (multiple times/week)',
  flexible: 'Flexible',
}

export function GroupRequestList({ requests }: { requests: GroupRequest[] }) {
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null)

  const parsedDetails = selectedRequest?.details
    ? (() => { try { return JSON.parse(selectedRequest.details!) } catch { return null } })()
    : null

  return (
    <>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-start justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-medium text-stone-900 dark:text-white truncate">
                  {request.name}
                </h4>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-stone-500 mb-2">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {request.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {request.location}
                </span>
              </div>
              {request.message && (
                <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                  {request.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <span className="text-xs text-stone-400">
                {formatDate(request.createdAt)}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300"
                onClick={() => setSelectedRequest(request)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedRequest?.name}</span>
              {selectedRequest && getStatusBadge(selectedRequest.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5 mt-2">
              {/* Contact Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Contact</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span>{selectedRequest.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-stone-400" />
                    <span>{formatDateLong(selectedRequest.createdAt)}</span>
                  </div>
                  {parsedDetails?.age && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-stone-400" />
                      <span>Age: {parsedDetails.age}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              {parsedDetails && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Preferences</h3>
                  <div className="grid gap-2 text-sm">
                    {parsedDetails.experience && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-stone-400" />
                        <span><strong>Experience:</strong> {experienceLabels[parsedDetails.experience] || parsedDetails.experience}</span>
                      </div>
                    )}
                    {parsedDetails.commitment && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-stone-400" />
                        <span><strong>Commitment:</strong> {commitmentLabels[parsedDetails.commitment] || parsedDetails.commitment}</span>
                      </div>
                    )}
                    {parsedDetails.genres?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Music className="h-4 w-4 text-stone-400 mt-0.5" />
                        <div>
                          <strong>Genres:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {parsedDetails.genres.map((genre: string) => (
                              <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {parsedDetails.performanceInterest !== undefined && (
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-stone-400" />
                        <span><strong>Performance:</strong> {parsedDetails.performanceInterest ? 'Interested' : 'Not interested'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedRequest.message && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Message</h3>
                  <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>
              )}

              {/* Reply action */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                <Button asChild className="w-full">
                  <a href={`mailto:${selectedRequest.email}?subject=Re: Find a Singing Group Request`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
