'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CampaignLead {
  id: string
  source: string
  status: string
  score: number
}

interface SourceStatsProps {
  leads: CampaignLead[]
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; badgeClass: string }> = {
  PAST_CLIENT: {
    label: 'Past Clients',
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  DORMANT: {
    label: 'Dormant',
    color: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  SIMILAR_ORG: {
    label: 'Similar Orgs',
    color: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  AI_RESEARCH: {
    label: 'AI Research',
    color: 'text-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  MANUAL_IMPORT: {
    label: 'Manual Import',
    color: 'text-zinc-400',
    badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  },
}

export function SourceStats({ leads }: SourceStatsProps) {
  // Count leads by source
  const sourceCounts: Record<string, number> = {}
  for (const lead of leads) {
    const src = lead.source || 'UNKNOWN'
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  }

  // Calculate avg score per source
  const sourceScores: Record<string, number[]> = {}
  for (const lead of leads) {
    const src = lead.source || 'UNKNOWN'
    if (!sourceScores[src]) sourceScores[src] = []
    sourceScores[src].push(lead.score)
  }

  const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])

  if (sources.length === 0) return null

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {sources.map(([source, count]) => {
        const config = SOURCE_CONFIG[source] || {
          label: source,
          color: 'text-zinc-400',
          badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        }
        const scores = sourceScores[source] || []
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0

        return (
          <Card key={source} className="border-zinc-800">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={config.badgeClass}>
                  {config.label}
                </Badge>
              </div>
              <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg score: {avgScore}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
