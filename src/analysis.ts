import { CATEGORIES } from './types'
import type { AppState, Category, MealEntry } from './types'

export function todayStr(): string {
  return toDateStr(new Date())
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function lastNDates(n: number, end = new Date()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    out.push(toDateStr(d))
  }
  return out
}

export function ageLabel(birthdate: string): string | null {
  if (!birthdate) return null
  const b = new Date(birthdate)
  if (isNaN(b.getTime())) return null
  const now = new Date()
  let months =
    (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth())
  if (now.getDate() < b.getDate()) months -= 1
  if (months < 0) return null
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (years === 0) return `${months} 个月`
  return rem === 0 ? `${years} 岁` : `${years} 岁 ${rem} 个月`
}

// Count how many times each category appears across a set of entries.
// A category counts once per food portion that maps to it.
export function categoryCounts(
  entries: MealEntry[],
  foods: AppState['foods'],
): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
    Category,
    number
  >
  for (const e of entries) {
    for (const p of e.portions) {
      const food = foods[p.food]
      if (!food) continue
      for (const c of food.categories) counts[c] += 1
    }
  }
  return counts
}

export function entriesForDate(state: AppState, date: string): MealEntry[] {
  return state.entries.filter((e) => e.date === date)
}

export function entriesInRange(
  state: AppState,
  dates: string[],
): MealEntry[] {
  const set = new Set(dates)
  return state.entries.filter((e) => set.has(e.date))
}

// Distinct foods eaten across entries (for variety metric).
export function distinctFoods(entries: MealEntry[]): string[] {
  const set = new Set<string>()
  for (const e of entries) for (const p of e.portions) set.add(p.food)
  return [...set]
}

// Foods logged for the first time within `dates` (never seen before the range).
export function newFoodsInRange(
  state: AppState,
  dates: string[],
): { food: string; label: string; date: string }[] {
  const seenBefore = new Set<string>()
  const rangeSet = new Set(dates)
  const firstInRange = new Map<string, { label: string; date: string }>()

  // Sort chronologically to establish "first ever" reliably.
  const sorted = [...state.entries].sort((a, b) =>
    a.date === b.date ? a.createdAt - b.createdAt : a.date < b.date ? -1 : 1,
  )
  for (const e of sorted) {
    const inRange = rangeSet.has(e.date)
    for (const p of e.portions) {
      if (!inRange) {
        seenBefore.add(p.food)
      } else if (!seenBefore.has(p.food) && !firstInRange.has(p.food)) {
        firstInRange.set(p.food, { label: p.label, date: e.date })
      }
    }
  }
  return [...firstInRange.entries()].map(([food, v]) => ({
    food,
    label: v.label,
    date: v.date,
  }))
}
