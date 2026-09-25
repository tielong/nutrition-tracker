import type { AppState } from './types'
import { buildSeedFoods } from './foodData'

const KEY = 'baby-nutrition-tracker'
const VERSION = 1

export function defaultState(): AppState {
  return {
    version: VERSION,
    baby: { name: '宝宝', birthdate: '' },
    foods: buildSeedFoods(),
    entries: [],
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as AppState
    // Merge in any seed foods not present (keeps user edits).
    const seed = buildSeedFoods()
    parsed.foods = { ...seed, ...parsed.foods }
    if (!parsed.baby) parsed.baby = defaultState().baby
    if (!Array.isArray(parsed.entries)) parsed.entries = []
    return parsed
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage may be unavailable (private mode); fail quietly.
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importState(json: string): AppState {
  const parsed = JSON.parse(json) as AppState
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file')
  const base = defaultState()
  return {
    version: VERSION,
    baby: parsed.baby ?? base.baby,
    foods: { ...base.foods, ...(parsed.foods ?? {}) },
    entries: Array.isArray(parsed.entries) ? parsed.entries : [],
  }
}
