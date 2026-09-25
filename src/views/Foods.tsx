import { useMemo, useState } from 'react'
import type { AppState, Category, Food } from '../types'
import { CATEGORIES } from '../types'
import { CATEGORY_COLORS } from '../foodData'
import { normalizeName } from '../parser'

interface Props {
  state: AppState
  upsertFood: (food: Food) => void
  deleteFood: (name: string) => void
}

export function Foods({ state, upsertFood, deleteFood }: Props) {
  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')

  const foods = useMemo(
    () =>
      Object.values(state.foods)
        .filter((f) => f.label.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [state.foods, query],
  )

  function toggle(food: Food, cat: Category) {
    const categories = food.categories.includes(cat)
      ? food.categories.filter((c) => c !== cat)
      : [...food.categories, cat]
    upsertFood({ ...food, categories })
  }

  function addFood() {
    const label = newName.trim()
    if (!label) return
    const name = normalizeName(label)
    if (!state.foods[name]) {
      upsertFood({ name, label, categories: [] })
    }
    setNewName('')
    setQuery(label)
  }

  return (
    <>
      <div className="card">
        <h2>食物分类</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          点击分类可为食物切换标签，这些映射用于概览页的分析。
        </p>
        <div className="row">
          <div style={{ flex: 3 }}>
            <label>添加食物</label>
            <input
              value={newName}
              placeholder="例如 芒果"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFood()}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
            <button className="primary" onClick={addFood}>
              添加
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>搜索</label>
          <input
            value={query}
            placeholder="筛选食物…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h2>共 {foods.length} 种食物</h2>
        <div className="food-list">
          {foods.map((food) => (
            <div className="food-item" key={food.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="fname">{food.label}</span>
                <button
                  className="link"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    if (confirm(`删除「${food.label}」？`)) deleteFood(food.name)
                  }}
                >
                  ✕
                </button>
              </div>
              <div>
                {CATEGORIES.map((c) => {
                  const on = food.categories.includes(c)
                  return (
                    <span
                      key={c}
                      className="cat-toggle"
                      onClick={() => toggle(food, c)}
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
        </div>
      </div>
    </>
  )
}
