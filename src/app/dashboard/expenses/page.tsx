import { prisma } from "@/lib/db"
import { ExpensesClient } from "./expenses-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ExpensesPage() {
  const expenses = await prisma.travelExpense.findMany({
    include: {
      booking: {
        select: {
          id: true,
          serviceType: true,
          startDate: true,
          location: true,
          lead: {
            select: {
              firstName: true,
              lastName: true,
              organization: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate summary totals
  const totals = {
    flights: expenses.reduce((sum, e) => sum + (e.flightCost ?? 0), 0),
    hotels: expenses.reduce((sum, e) => sum + (e.hotelCost ?? 0), 0),
    ground: expenses.reduce((sum, e) => sum + (e.groundTransportCost ?? 0), 0),
    total: expenses.reduce(
      (sum, e) => sum + (e.flightCost ?? 0) + (e.hotelCost ?? 0) + (e.groundTransportCost ?? 0),
      0
    ),
    dekePays: expenses.reduce((sum, e) => {
      const total = (e.flightCost ?? 0) + (e.hotelCost ?? 0) + (e.groundTransportCost ?? 0)
      if (e.paymentResponsibility === "DEKE") return sum + total
      if (e.paymentResponsibility === "SPLIT") return sum + total * ((e.dekePayPercent ?? 50) / 100)
      return sum
    }, 0),
  }

  // Serialize dates
  const serialized = expenses.map((e) => ({
    ...e,
    departureTime: e.departureTime?.toISOString() ?? null,
    arrivalTime: e.arrivalTime?.toISOString() ?? null,
    checkInDate: e.checkInDate?.toISOString() ?? null,
    checkOutDate: e.checkOutDate?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    booking: {
      ...e.booking,
      startDate: e.booking.startDate?.toISOString() ?? null,
    },
  }))

  return <ExpensesClient expenses={serialized} totals={totals} />
}
