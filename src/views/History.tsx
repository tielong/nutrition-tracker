import { useMemo, useState } from 'react'
import type { AppState, Category, Food, MealEntry } from '../types'
import { CategoryBadge } from '../components/Badges'
import { MealForm } from '../components/MealForm'
import { portionToText } from '../parser'

// Read-only display of one meal entry, reused across views.
export function MealCard({
  entry,
  foods,
  onEdit,
  onDelete,
}: {
  entry: MealEntry
  foods: AppState['foods']
  onEdit?: () => void
  onDelete?: () => void
}) {
  const cats = new Set<Category>()
  for (const p of entry.portions) {
    const f = foods[p.food]
    if (f) for (const c of f.categories) cats.add(c)
  }
  return (
    <div className="meal-entry">
      <div className="head">
        <span className="meal-type">{entry.meal}</span>
        <span className="badges">
          {[...cats].map((c) => (
            <CategoryBadge key={c} category={c} />
          ))}
        </span>
      </div>
      <div className="foods">
        {entry.portions.map((p) => portionToText(p)).join(', ')}
      </div>
      {entry.notes && <div className="notes">“{entry.notes}”</div>}
      {(onEdit || onDelete) && (
        <div className="actions" style={{ marginTop: 8 }}>
          {onEdit && (
            <button className="link" onClick={onEdit}>
              编辑
            </button>
          )}
          {onDelete && (
            <button className="link" onClick={onDelete} style={{ color: '#ef4444' }}>
              删除
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  state: AppState
  updateEntry: (entry: MealEntry) => void
  deleteEntry: (id: string) => void
  upsertFood: (food: Food) => void
}

export function History({ state, updateEntry, deleteEntry, upsertFood }: Props) {
  const [editing, setEditing] = useState<string | null>(null)

  // Group entries by date, newest first.
  const byDate = useMemo(() => {
    const map = new Map<string, MealEntry[]>()
    for (const e of state.entries) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.createdAt - b.createdAt)
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [state.entries])

  if (state.entries.length === 0) {
    return (
      <div className="card">
        <h2>历史</h2>
        <p className="muted">还没有任何记录，去「记一餐」添加吧。</p>
      </div>
    )
  }

  return (
    <>
      {byDate.map(([date, entries]) => (
        <div className="card" key={date}>
          <h2>{formatDate(date)}</h2>
          {entries.map((e) =>
            editing === e.id ? (
              <div className="meal-entry" key={e.id}>
                <MealForm
                  state={state}
                  initial={e}
                  submitLabel="保存修改"
                  onSave={(updated) => {
                    updateEntry(updated)
                    setEditing(null)
                  }}
                  onCancel={() => setEditing(null)}
                  upsertFood={upsertFood}
                />
              </div>
            ) : (
              <MealCard
                key={e.id}
                entry={e}
                foods={state.foods}
                onEdit={() => setEditing(e.id)}
                onDelete={() => {
                  if (confirm('确定删除这条记录吗？')) deleteEntry(e.id)
                }}
              />
            ),
          )}
        </div>
      ))}
    </>
  )
}

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('zh-CN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
