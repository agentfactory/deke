import data from '@/../product/sections/outreach-and-automation/data.json'
import { SequenceList } from './components/SequenceList'

export default function SequenceListPreview() {
  return (
    <SequenceList
      emailSequences={data.emailSequences}
      messages={data.messages}
      templates={data.templates}
      contacts={data.contacts}
      leads={data.leads}
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
