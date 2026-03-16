"use client"

import { createContext, useContext, useState } from "react"

interface Slot {
  day: string
  period: string
  subject?: any
}

interface TimetableContextType {
  slots: Slot[]
  assignSubject: (day: string, period: string, subject: any) => void
}

const TimetableContext = createContext<TimetableContextType | null>(null)

export function TimetableProvider({ children }: any) {
  const [slots, setSlots] = useState<Slot[]>([])

  function assignSubject(day: string, period: string, subject: any) {
    setSlots((prev) => [
      ...prev.filter((s) => !(s.day === day && s.period === period)),
      { day, period, subject },
    ])
  }

  return (
    <TimetableContext.Provider value={{ slots, assignSubject }}>
      {children}
    </TimetableContext.Provider>
  )
}

export function useTimetable() {
  const ctx = useContext(TimetableContext)
  if (!ctx) throw new Error("useTimetable must be used inside provider")
  return ctx
}