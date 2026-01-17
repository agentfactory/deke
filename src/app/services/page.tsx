import { ServiceList } from '@/components/services/ServiceList'
import serviceData from '@/data/service-offerings.json'
import type { ServiceOffering } from '@/types/service-offerings'

export default async function ServicesPage() {
  const serviceOfferings = serviceData.serviceOfferings as ServiceOffering[]

  return <ServiceList serviceOfferings={serviceOfferings} />
}
