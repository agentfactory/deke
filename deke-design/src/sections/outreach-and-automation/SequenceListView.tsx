import data from '@/../product/sections/outreach-and-automation/data.json'
import type { EmailSequence, Message, Template, Contact, Lead } from '@/../product/sections/outreach-and-automation/types'
import { SequenceList } from './components/SequenceList'

export default function SequenceListPreview() {
  return (
    <SequenceList
      emailSequences={data.emailSequences as EmailSequence[]}
      messages={data.messages as Message[]}
      templates={data.templates as Template[]}
      contacts={data.contacts as Contact[]}
      leads={data.leads as Lead[]}
      onViewSequence={(id) => console.log('View sequence:', id)}
      onCreateSequence={() => console.log('Create new sequence')}
      onEditSequence={(id) => console.log('Edit sequence:', id)}
      onDeleteSequence={(id) => console.log('Delete sequence:', id)}
      onToggleSequence={(id) => console.log('Toggle sequence:', id)}
      onViewTemplate={(id) => console.log('View template:', id)}
      onCreateTemplate={() => console.log('Create new template')}
      onEditTemplate={(id) => console.log('Edit template:', id)}
      onDeleteTemplate={(id) => console.log('Delete template:', id)}
      onViewMessage={(id) => console.log('View message:', id)}
      onViewAnalytics={(id) => console.log('View analytics for sequence:', id)}
    />
  )
}
