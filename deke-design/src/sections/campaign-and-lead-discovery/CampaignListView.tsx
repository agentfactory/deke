import data from '@/../product/sections/campaign-and-lead-discovery/data.json'
import type { Campaign, Lead, Venue, Contact } from '@/../product/sections/campaign-and-lead-discovery/types'
import { CampaignList } from './components/CampaignList'

export default function CampaignListPreview() {
  return (
    <CampaignList
      campaigns={data.campaigns as Campaign[]}
      leads={data.leads as Lead[]}
      venues={data.venues as Venue[]}
      contacts={data.contacts as Contact[]}
      onViewCampaign={(id) => console.log('View campaign:', id)}
      onCreateCampaign={() => console.log('Create new campaign')}
      onEditCampaign={(id) => console.log('Edit campaign:', id)}
      onDeleteCampaign={(id) => console.log('Delete campaign:', id)}
      onViewLead={(id) => console.log('View lead:', id)}
      onContactLead={(id) => console.log('Contact lead:', id)}
      onConvertLead={(id) => console.log('Convert lead to booking:', id)}
      onDisqualifyLead={(id) => console.log('Disqualify lead:', id)}
      onFilterByScore={(min, max) => console.log('Filter by score:', min, max)}
      onFilterBySource={(source) => console.log('Filter by source:', source)}
      onFilterByStatus={(status) => console.log('Filter by status:', status)}
    />
  )
}
