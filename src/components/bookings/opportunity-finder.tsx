'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

interface CampaignLead {
  id: string
  score: number
  distance: number | null
  source: string
  status: string
  recommendedServices: string | null
  recommendationReason: string | null
  recommendationScore: number | null
  lead: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    organization: string | null
    website: string | null
    emailVerified?: boolean
    needsEnrichment?: boolean
    contactTitle: string | null
    editorialSummary: string | null
    googleRating: number | null
  }
}

interface DiscoveryResponse {
  campaignId: string
  readyToContact: CampaignLead[]
  needsResearch: CampaignLead[]
  discoveryResult: {
    total: number
    needsResearch: number
    filteredOut: number
    bySource: Record<string, number>
    duration: number
    warnings: string[]
    errors: string[]
  }
}

interface ExistingCampaign {
  id: string
  name: string
  status: string
  _count?: { leads: number; outreachLogs: number }
  leads?: CampaignLead[]
}

interface OpportunityFinderProps {
  bookingId: string
  bookingLocation: string | null
  availabilityBefore?: number | null
  availabilityAfter?: number | null
  existingCampaigns: ExistingCampaign[]
  onCampaignCreated?: () => void
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  PAST_CLIENT: { label: 'Past Client', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  DORMANT: { label: 'Dormant', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  SIMILAR_ORG: { label: 'Similar Org', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  AI_RESEARCH: { label: 'Discovered', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

function parseRecommendedServices(json: string | null): string[] {
  if (!json) return []
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

function formatServiceType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function OpportunityCard({ lead, campaignId }: { lead: CampaignLead; campaignId: string | null }) {
  const services = parseRecommendedServices(lead.recommendedServices)
  const isPlaceholder = lead.lead.email.includes('@placeholder.local')
  const source = SOURCE_LABELS[lead.source] || { label: lead.source, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Org name + source */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-base truncate">
              {lead.lead.organization || `${lead.lead.firstName} ${lead.lead.lastName}`}
            </h4>
            <Badge variant="outline" className={`text-xs ${source.color}`}>
              {source.label}
            </Badge>
          </div>

          {/* Contact info */}
          <div className="mt-1.5 space-y-0.5">
            {!isPlaceholder && lead.lead.firstName !== 'Contact' && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {lead.lead.firstName} {lead.lead.lastName}
                {lead.lead.contactTitle && (
                  <span className="text-xs">({lead.lead.contactTitle})</span>
                )}
              </p>
            )}
            {!isPlaceholder ? (
              <p className="text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{lead.lead.email}</span>
                {lead.lead.emailVerified && (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </p>
            ) : (
              <p className="text-sm text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                No contact email found
              </p>
            )}
            {lead.lead.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {lead.lead.phone}
              </p>
            )}
          </div>

          {/* Recommended services */}
          {services.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
              <div>
                <div className="flex gap-1.5 flex-wrap">
                  {services.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {formatServiceType(s)}
                    </Badge>
                  ))}
                </div>
                {lead.recommendationReason && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lead.recommendationReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editorial summary from Google */}
          {lead.lead.editorialSummary && (
            <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">
              {lead.lead.editorialSummary}
            </p>
          )}
        </div>

        {/* Right side: distance + score + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {lead.distance != null && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {Math.round(lead.distance)} mi
            </div>
          )}
          {lead.lead.googleRating != null && lead.lead.googleRating > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {lead.lead.googleRating.toFixed(1)}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Score: {lead.score}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 mt-1">
            {lead.lead.website && (
              <a
                href={lead.lead.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                </Button>
              </a>
            )}
            {!isPlaceholder && campaignId && (
              <Link href={`/dashboard/campaigns/${campaignId}?tab=drafts`}>
                <Button variant="default" size="sm" className="h-7 text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Draft Email
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function OpportunityFinder({
  bookingId,
  bookingLocation,
  availabilityBefore,
  availabilityAfter,
  existingCampaigns,
  onCampaignCreated,
}: OpportunityFinderProps) {
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [result, setResult] = useState<DiscoveryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNeedsResearch, setShowNeedsResearch] = useState(false)
  const [sortBy, setSortBy] = useState<'score' | 'distance'>('score')

  // Check if we already have leads from existing campaigns
  const existingLeads = existingCampaigns.flatMap((c) => c.leads || [])
  const hasExistingLeads = existingLeads.length > 0
  const existingCampaignId = existingCampaigns[0]?.id || null

  // Use existing leads if available and no fresh discovery has been done
  const readyToContact = result?.readyToContact || (hasExistingLeads
    ? existingLeads.filter((l) => l.status !== 'NEEDS_RESEARCH' && l.status !== 'REMOVED')
    : [])
  const needsResearch = result?.needsResearch || (hasExistingLeads
    ? existingLeads.filter((l) => l.status === 'NEEDS_RESEARCH')
    : [])
  const campaignId = result?.campaignId || existingCampaignId

  // Sort leads
  const sortedReady = [...readyToContact].sort((a, b) => {
    if (sortBy === 'distance') {
      if (a.distance == null) return 1
      if (b.distance == null) return -1
      return a.distance - b.distance
    }
    return b.score - a.score
  })

  const sortedResearch = [...needsResearch].sort((a, b) => {
    if (sortBy === 'distance') {
      if (a.distance == null) return 1
      if (b.distance == null) return -1
      return a.distance - b.distance
    }
    return b.score - a.score
  })

  const handleDiscover = async () => {
    setIsDiscovering(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.message || 'Discovery failed')
      }

      const data: DiscoveryResponse = await response.json()
      setResult(data)
      onCampaignCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover opportunities')
    } finally {
      setIsDiscovering(false)
    }
  }

  const totalFound = sortedReady.length + sortedResearch.length
  const hasResults = totalFound > 0

  return (
    <div className="space-y-4">
      {/* Discovery trigger */}
      {!hasResults && !isDiscovering && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Find Nearby Opportunities</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Scan for coaching opportunities near {bookingLocation || 'this booking'}
            </p>
            {(availabilityBefore || availabilityAfter) && (
              <p className="text-xs text-muted-foreground mb-4">
                {availabilityBefore ? `${availabilityBefore} days before` : ''}
                {availabilityBefore && availabilityAfter ? ' & ' : ''}
                {availabilityAfter ? `${availabilityAfter} days after` : ''}
                {' '}the booking
              </p>
            )}
            <Button
              onClick={handleDiscover}
              disabled={!bookingLocation}
              size="lg"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Opportunities
            </Button>
            {!bookingLocation && (
              <p className="text-xs text-amber-600 mt-2">
                Add a location to this booking first
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isDiscovering && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-1">Searching for opportunities...</h3>
            <p className="text-sm text-muted-foreground">
              Checking past clients, dormant leads, similar organizations, and discovering new ones
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
            <Button onClick={handleDiscover} variant="outline" size="sm">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasResults && (
        <>
          {/* Summary bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">
                {sortedReady.length} Opportunit{sortedReady.length === 1 ? 'y' : 'ies'}
              </h3>
              {sortedResearch.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{sortedResearch.length} need research
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Button
                variant={sortBy === 'score' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSortBy('score')}
              >
                Best Match
              </Button>
              <Button
                variant={sortBy === 'distance' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSortBy('distance')}
              >
                Nearest
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs ml-2"
                onClick={handleDiscover}
                disabled={isDiscovering}
              >
                {isDiscovering ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <><Search className="h-3 w-3 mr-1" />Re-scan</>
                )}
              </Button>
            </div>
          </div>

          {/* Discovery summary (compact) */}
          {result?.discoveryResult && (
            <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
              {Object.entries(result.discoveryResult.bySource).map(([source, count]) => (
                count > 0 && (
                  <span key={source} className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${SOURCE_LABELS[source]?.color.split(' ')[0] || 'bg-gray-200'}`} />
                    {SOURCE_LABELS[source]?.label || source}: {count}
                  </span>
                )
              ))}
              {result.discoveryResult.warnings.length > 0 && (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {result.discoveryResult.warnings.length} warning{result.discoveryResult.warnings.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Ready to Contact */}
          {sortedReady.length > 0 && (
            <div className="space-y-2">
              {sortedReady.map((lead) => (
                <OpportunityCard key={lead.id} lead={lead} campaignId={campaignId} />
              ))}
            </div>
          )}

          {sortedReady.length === 0 && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                No leads with contact info found yet. Check the "Needs Research" section below.
              </CardContent>
            </Card>
          )}

          {/* Needs Research (collapsible) */}
          {sortedResearch.length > 0 && (
            <div className="border rounded-lg">
              <button
                onClick={() => setShowNeedsResearch(!showNeedsResearch)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-sm">
                    Needs Research ({sortedResearch.length})
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Organizations found, but no contact email
                  </span>
                </div>
                {showNeedsResearch ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showNeedsResearch && (
                <div className="border-t p-2 space-y-2">
                  {sortedResearch.map((lead) => (
                    <OpportunityCard key={lead.id} lead={lead} campaignId={campaignId} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link to full campaign */}
          {campaignId && (
            <div className="text-center pt-2">
              <Link href={`/dashboard/campaigns/${campaignId}`}>
                <Button variant="link" size="sm" className="text-xs">
                  View full campaign details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
