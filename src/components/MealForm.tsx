import { useMemo, useState } from 'react'
import type { AppState, Category, Food, MealEntry, MealType } from '../types'
import { CATEGORIES, MEAL_TYPES } from '../types'
import { CATEGORY_COLORS } from '../foodData'
import { parsePortions, portionsToText } from '../parser'
import { todayStr } from '../analysis'

interface Props {
  state: AppState
  initial?: MealEntry
  submitLabel: string
  onSave: (entry: MealEntry) => void
  onCancel?: () => void
  upsertFood: (food: Food) => void
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function MealForm({
  state,
  initial,
  submitLabel,
  onSave,
  onCancel,
  upsertFood,
}: Props) {
  const [date, setDate] = useState(initial?.date ?? todayStr())
  const [meal, setMeal] = useState<MealType>(initial?.meal ?? '早餐')
  const [text, setText] = useState(
    initial ? portionsToText(initial.portions) : '',
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  // Draft categories for unknown foods encountered on submit.
  const [pendingCats, setPendingCats] = useState<Record<string, Category[]>>({})
  const [needsCats, setNeedsCats] = useState(false)

  const portions = useMemo(() => parsePortions(text), [text])
  const unknownFoods = useMemo(
    () =>
      [...new Set(portions.map((p) => p.food))].filter(
        (f) => !state.foods[f],
      ),
    [portions, state.foods],
  )

  function toggleCat(food: string, cat: Category) {
    setPendingCats((prev) => {
      const cur = prev[food] ?? []
      return {
        ...prev,
        [food]: cur.includes(cat)
          ? cur.filter((c) => c !== cat)
          : [...cur, cat],
      }
    })
  }

  function handleSubmit() {
    if (!portions.length) return
    if (unknownFoods.length && !needsCats) {
      // First submit with unknowns -> ask for their categories.
      const seed: Record<string, Category[]> = {}
      for (const f of unknownFoods) seed[f] = pendingCats[f] ?? []
      setPendingCats(seed)
      setNeedsCats(true)
      return
    }

    // Persist any newly categorized foods.
    for (const f of unknownFoods) {
      const label =
        portions.find((p) => p.food === f)?.label ?? f
      upsertFood({
        name: f,
        label,
        categories: pendingCats[f] ?? [],
      })
    }

    const entry: MealEntry = {
      id: initial?.id ?? newId(),
      date,
      meal,
      portions,
      notes: notes.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    }
    onSave(entry)

    // Reset if this was a fresh add (no initial).
    if (!initial) {
      setText('')
      setNotes('')
      setPendingCats({})
    }
    setNeedsCats(false)
  }

  return (
    <div>
      <div className="row">
        <div>
          <label>日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label>餐次</label>
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value as MealType)}
          >
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>食物 — 例如「牛奶(200ml)，鸡蛋(1个)」</label>
        <textarea
          value={text}
          placeholder="牛奶(200ml)，香蕉(半个)，燕麦"
          onChange={(e) => {
            setText(e.target.value)
            setNeedsCats(false)
          }}
        />
        {portions.length > 0 && (
          <div className="small muted" style={{ marginTop: 6 }}>
            已识别 {portions.length} 项：{' '}
            {portions
              .map((p) => (p.amount ? `${p.label}（${p.amount}）` : p.label))
              .join('，')}
          </div>
        )}
      </div>

      {needsCats && unknownFoods.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>新食物 — 点选对应的分类</h3>
          {unknownFoods.map((f) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <div className="fname" style={{ marginBottom: 4 }}>
                {portions.find((p) => p.food === f)?.label ?? f}
              </div>
              <div>
                {CATEGORIES.map((c) => {
                  const on = (pendingCats[f] ?? []).includes(c)
                  return (
                    <span
                      key={c}
                      className="cat-toggle"
                      onClick={() => toggleCat(f, c)}
                      style={
                        on
                          ? {
                              background: CATEGORY_COLORS[c],
                              color: '#fff',
                              borderColor: CATEGORY_COLORS[c],
                            }
                          : undefined
                      }
                    >
                      {c}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="small muted">
            也可以先不分类，之后在「食物」页面再补充。
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label>备注（可选）— 例如「不爱吃」「第一次吃」、过敏反应等</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ minHeight: 44 }}
        />
      </div>

      <div className="actions">
        {onCancel && (
          <button className="ghost" onClick={onCancel}>
            取消
          </button>
        )}
        <button
          className="primary"
          onClick={handleSubmit}
          disabled={!portions.length}
        >
          {needsCats && unknownFoods.length ? '确认分类并保存' : submitLabel}
        </button>
      </div>
    </div>
  )
}
