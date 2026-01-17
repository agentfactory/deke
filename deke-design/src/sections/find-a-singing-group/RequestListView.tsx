import data from '@/../product/sections/find-a-singing-group/data.json'
import type { GroupRequest, Venue } from '@/../product/sections/find-a-singing-group/types'
import { RequestList } from './components/RequestList'

export default function RequestListPreview() {
  return (
    <RequestList
      groupRequests={data.groupRequests as GroupRequest[]}
      venues={data.venues as Venue[]}
      onViewRequest={(id) => console.log('View request:', id)}
      onMarkInProgress={(id) => console.log('Mark in progress:', id)}
      onMarkMatched={(id) => console.log('Mark matched:', id)}
      onMarkResponded={(id) => console.log('Mark responded:', id)}
      onRespond={(id) => console.log('Respond to request:', id)}
      onViewSuggestedVenues={(id) => console.log('View suggested venues for request:', id)}
      onArchive={(id) => console.log('Archive request:', id)}
    />
  )
}
