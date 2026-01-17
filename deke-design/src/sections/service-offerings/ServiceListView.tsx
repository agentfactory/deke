import data from '@/../product/sections/service-offerings/data.json'
import { ServiceList } from './components/ServiceList'

export default function ServiceListPreview() {
  return (
    <ServiceList
      serviceOfferings={data.serviceOfferings}
      onViewService={(id) => console.log('View service:', id)}
      onRequestBooking={(id) => console.log('Request booking for service:', id)}
      onContactAboutService={(id) => console.log('Contact about service:', id)}
      onFilterByType={(type) => console.log('Filter by type:', type)}
    />
  )
}
