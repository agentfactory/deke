"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plane, Building2, Car, DollarSign } from "lucide-react"

interface ExpenseBooking {
  id: string
  serviceType: string
  startDate: string | null
  location: string | null
  lead: {
    firstName: string
    lastName: string
    organization: string | null
  }
}

interface SerializedExpense {
  id: string
  bookingId: string
  flightCarrier: string | null
  flightNumber: string | null
  departureAirport: string | null
  arrivalAirport: string | null
  departureTime: string | null
  arrivalTime: string | null
  flightCost: number | null
  hotelName: string | null
  hotelAddress: string | null
  checkInDate: string | null
  checkOutDate: string | null
  confirmationNumber: string | null
  hotelCost: number | null
  groundTransport: string | null
  groundTransportDetails: string | null
  groundTransportCost: number | null
  paymentResponsibility: string
  clientPayPercent: number | null
  dekePayPercent: number | null
  createdAt: string
  updatedAt: string
  booking: ExpenseBooking
}

interface Totals {
  flights: number
  hotels: number
  ground: number
  total: number
  dekePays: number
}

interface ExpensesClientProps {
  expenses: SerializedExpense[]
  totals: Totals
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

const formatServiceType = (type: string) =>
  type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const RESPONSIBILITY_STYLES: Record<string, string> = {
  CLIENT: "bg-green-100 text-green-800 border-green-200",
  DEKE: "bg-[#C05A3C]/10 text-[#C05A3C] border-[#C05A3C]/20",
  SPLIT: "bg-amber-100 text-amber-800 border-amber-200",
}

export function ExpensesClient({ expenses, totals }: ExpensesClientProps) {
  const [responsibilityFilter, setResponsibilityFilter] = useState("ALL")

  const filtered = expenses.filter((e) => {
    if (responsibilityFilter === "ALL") return true
    return e.paymentResponsibility === responsibilityFilter
  })

  const summaryCards = [
    {
      label: "Flights",
      value: totals.flights,
      icon: Plane,
    },
    {
      label: "Hotels",
      value: totals.hotels,
      icon: Building2,
    },
    {
      label: "Ground Transport",
      value: totals.ground,
      icon: Car,
    },
    {
      label: "Deke's Total",
      value: totals.dekePays,
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-[#1a1a1a]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Expenses
        </h1>
        <p className="text-[#666666] mt-1">Travel costs across all bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-[#E8E4DD] bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{card.label}</p>
                  <p
                    className="text-2xl font-bold text-[#1a1a1a] mt-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-[#C05A3C]/10 flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-[#C05A3C]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <Select value={responsibilityFilter} onValueChange={setResponsibilityFilter}>
          <SelectTrigger className="w-[180px] border-[#E8E4DD]">
            <SelectValue placeholder="Payment responsibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="CLIENT">Client Pays</SelectItem>
            <SelectItem value="DEKE">Deke Pays</SelectItem>
            <SelectItem value="SPLIT">Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-[#E8E4DD] bg-white">
          <CardContent className="p-12 text-center">
            <p className="text-[#999999]">No travel expenses recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E8E4DD] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E4DD]">
                  <TableHead className="text-[#666666]">Booking</TableHead>
                  <TableHead className="text-[#666666]">Location</TableHead>
                  <TableHead className="text-[#666666]">Date</TableHead>
                  <TableHead className="text-[#666666]">Flight</TableHead>
                  <TableHead className="text-[#666666] text-right">Flight Cost</TableHead>
                  <TableHead className="text-[#666666]">Hotel</TableHead>
                  <TableHead className="text-[#666666] text-right">Hotel Cost</TableHead>
                  <TableHead className="text-[#666666]">Ground</TableHead>
                  <TableHead className="text-[#666666] text-right">Ground Cost</TableHead>
                  <TableHead className="text-[#666666]">Responsibility</TableHead>
                  <TableHead className="text-[#666666] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense) => {
                  const expenseTotal =
                    (expense.flightCost ?? 0) +
                    (expense.hotelCost ?? 0) +
                    (expense.groundTransportCost ?? 0)

                  const flightRoute =
                    expense.departureAirport && expense.arrivalAirport
                      ? `${expense.departureAirport}\u2192${expense.arrivalAirport}`
                      : null

                  const flightLabel = expense.flightCarrier
                    ? `${expense.flightCarrier}${flightRoute ? ` ${flightRoute}` : ""}`
                    : flightRoute ?? null

                  return (
                    <TableRow
                      key={expense.id}
                      className="border-[#E8E4DD] hover:bg-[#FAFAF8]"
                    >
                      <TableCell>
                        <Link
                          href={`/dashboard/bookings/${expense.booking.id}`}
                          className="text-[#1a1a1a] hover:text-[#C05A3C] font-medium"
                        >
                          {formatServiceType(expense.booking.serviceType)} —{" "}
                          {expense.booking.lead.firstName} {expense.booking.lead.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[#666666]">
                        {expense.booking.location ?? "—"}
                      </TableCell>
                      <TableCell className="text-[#666666]">
                        {formatDate(expense.booking.startDate)}
                      </TableCell>
                      <TableCell className="text-[#1a1a1a]">
                        {flightLabel ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-[#1a1a1a]">
                        {expense.flightCost != null
                          ? formatCurrency(expense.flightCost)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-[#1a1a1a]">
                        {expense.hotelName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-[#1a1a1a]">
                        {expense.hotelCost != null
                          ? formatCurrency(expense.hotelCost)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-[#1a1a1a]">
                        {expense.groundTransport
                          ? formatServiceType(expense.groundTransport)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-[#1a1a1a]">
                        {expense.groundTransportCost != null
                          ? formatCurrency(expense.groundTransportCost)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            RESPONSIBILITY_STYLES[expense.paymentResponsibility] ?? ""
                          }
                        >
                          {expense.paymentResponsibility === "SPLIT"
                            ? `Split ${expense.clientPayPercent ?? 50}/${expense.dekePayPercent ?? 50}`
                            : expense.paymentResponsibility}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#1a1a1a]">
                        {formatCurrency(expenseTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
