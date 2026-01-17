import data from '@/../product/sections/dashboard-and-trip-management/data.json'
import { TripList } from './components/TripList'

export default function TripListPreview() {
  return (
    <TripList
      trips={data.trips}
      bookings={data.bookings}
      expenses={data.expenses}
      participants={data.participants}
      venues={data.venues}
      onViewTrip={(id) => console.log('View trip:', id)}
      onCreateTrip={() => console.log('Create new trip')}
      onEditTrip={(id) => console.log('Edit trip:', id)}
      onDeleteTrip={(id) => console.log('Delete trip:', id)}
      onAddBooking={(tripId) => console.log('Add booking to trip:', tripId)}
      onEditBooking={(id) => console.log('Edit booking:', id)}
      onDeleteBooking={(id) => console.log('Delete booking:', id)}
      onAddExpense={(tripId) => console.log('Add expense to trip:', tripId)}
      onEditExpense={(id) => console.log('Edit expense:', id)}
      onDeleteExpense={(id) => console.log('Delete expense:', id)}
      onViewProfitability={(tripId) => console.log('View profitability for trip:', tripId)}
    />
  )
}
