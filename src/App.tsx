import { useEffect, useMemo, useState } from 'react'
import type { AppState, Food, MealEntry } from './types'
import { loadState, saveState } from './storage'
import { ageLabel } from './analysis'
import { Dashboard } from './views/Dashboard'
import { LogMeal } from './views/LogMeal'
import { History } from './views/History'
import { Foods } from './views/Foods'
import { Settings } from './views/Settings'

type Tab = 'dashboard' | 'log' | 'history' | 'foods' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: '概览' },
  { id: 'log', label: '记一餐' },
  { id: 'history', label: '历史' },
  { id: 'foods', label: '食物' },
  { id: 'settings', label: '设置' },
]

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    saveState(state)
  }, [state])

  const age = useMemo(() => ageLabel(state.baby.birthdate), [state.baby.birthdate])

  // ---- mutations shared across views ----
  const addEntry = (entry: MealEntry) =>
    setState((s) => ({ ...s, entries: [...s.entries, entry] }))

  const updateEntry = (entry: MealEntry) =>
    setState((s) => ({
      ...s,
      entries: s.entries.map((e) => (e.id === entry.id ? entry : e)),
    }))

  const deleteEntry = (id: string) =>
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }))

  const upsertFood = (food: Food) =>
    setState((s) => ({ ...s, foods: { ...s.foods, [food.name]: food } }))

  const deleteFood = (name: string) =>
    setState((s) => {
      const foods = { ...s.foods }
      delete foods[name]
      return { ...s, foods }
    })

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>🍼 {state.baby.name}的营养记录</h1>
          <div className="sub">
            {age ? `${age} · ` : ''}
            已记录 {state.entries.length} 餐
          </div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' && (
        <Dashboard state={state} onGoLog={() => setTab('log')} />
      )}
      {tab === 'log' && (
        <LogMeal state={state} addEntry={addEntry} upsertFood={upsertFood} />
      )}
      {tab === 'history' && (
        <History
          state={state}
          updateEntry={updateEntry}
          deleteEntry={deleteEntry}
          upsertFood={upsertFood}
        />
      )}
      {tab === 'foods' && (
        <Foods state={state} upsertFood={upsertFood} deleteFood={deleteFood} />
      )}
      {tab === 'settings' && <Settings state={state} setState={setState} />}
    </div>
  )
}
