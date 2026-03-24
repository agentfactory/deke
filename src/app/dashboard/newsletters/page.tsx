import { prisma } from '@/lib/db'
import { NewslettersClient } from './newsletters-client'

export const revalidate = 0

export default async function NewslettersPage() {
  let ideas: any[] = []
  let issues: any[] = []
  let subscriberCount = 0

  try {
    const [ideasData, issuesData, count] = await Promise.all([
      prisma.newsletterIdea.findMany({
        include: { issue: { select: { id: true, title: true, issueNumber: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterIssue.findMany({
        include: { _count: { select: { ideas: true } } },
        orderBy: { issueNumber: 'desc' },
      }),
      prisma.emailSubscriber.count({
        where: { newsletterOptIn: true },
      }),
    ])

    ideas = ideasData
    issues = issuesData
    subscriberCount = count
  } catch (error) {
    console.error('Error fetching newsletter data:', error)
  }

  return (
    <NewslettersClient
      initialIdeas={ideas}
      initialIssues={issues}
      subscriberCount={subscriberCount}
    />
  )
}
