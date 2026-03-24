import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { IssueComposer } from './issue-composer'

export const revalidate = 0

export default async function IssueEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [issue, allIdeas, subscriberCount] = await Promise.all([
    prisma.newsletterIssue.findUnique({
      where: { id },
      include: {
        ideas: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.newsletterIdea.findMany({
      where: {
        OR: [
          { issueId: id },
          { issueId: null, status: 'IDEA' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.emailSubscriber.count({
      where: { newsletterOptIn: true },
    }),
  ])

  if (!issue) notFound()

  return (
    <IssueComposer
      issue={issue}
      availableIdeas={allIdeas}
      subscriberCount={subscriberCount}
    />
  )
}
