import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppState } from '../types'
import { CATEGORIES } from '../types'
import { CATEGORY_COLORS } from '../foodData'
import {
  categoryCounts,
  distinctFoods,
  entriesForDate,
  entriesInRange,
  lastNDates,
  newFoodsInRange,
  todayStr,
} from '../analysis'
import { MealCard } from './History'

interface Props {
  state: AppState
  onGoLog: () => void
}

export function Dashboard({ state, onGoLog }: Props) {
  const today = todayStr()
  const todayEntries = useMemo(
    () =>
      entriesForDate(state, today).sort((a, b) => a.createdAt - b.createdAt),
    [state, today],
  )

  const week = useMemo(() => lastNDates(7), [])
  const weekEntries = useMemo(
    () => entriesInRange(state, week),
    [state, week],
  )
  const weekCounts = useMemo(
    () => categoryCounts(weekEntries, state.foods),
    [weekEntries, state.foods],
  )
  const maxCount = Math.max(1, ...Object.values(weekCounts))

  const chartData = useMemo(
    () =>
      week.map((d) => {
        const dayEntries = entriesForDate(state, d)
        const counts = categoryCounts(dayEntries, state.foods)
        const label = new Date(d + 'T00:00:00').toLocaleDateString('zh-CN', {
          weekday: 'short',
        })
        return { day: label, ...counts }
      }),
    [week, state],
  )

  const variety = distinctFoods(weekEntries).length
  const newFoods = useMemo(() => newFoodsInRange(state, week), [state, week])
  const coveredToday = new Set(
    Object.entries(categoryCounts(todayEntries, state.foods))
      .filter(([, v]) => v > 0)
      .map(([k]) => k),
  )

  return (
    <>
      <div className="card">
        <h2>
          今天 · {new Date(today + 'T00:00:00').toLocaleDateString('zh-CN')}
        </h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="num">{todayEntries.length}</div>
            <div className="lbl">已记录餐数</div>
          </div>
          <div className="stat">
            <div className="num">
              {coveredToday.size}/{CATEGORIES.length}
            </div>
            <div className="lbl">覆盖的分类</div>
          </div>
          <div className="stat">
            <div className="num">{distinctFoods(todayEntries).length}</div>
            <div className="lbl">不同食物</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="primary" onClick={onGoLog}>
            + 记一餐
          </button>
        </div>
      </div>

      <div className="card">
        <h2>本周 — 各分类均衡</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          最近 7 天里各营养分类出现的次数。
        </p>
        {CATEGORIES.map((c) => {
          const v = weekCounts[c]
          return (
            <div className="coverage-row" key={c}>
              <span className="cname">{c}</span>
              <span className="bar">
                <span
                  className="fill"
                  style={{
                    width: `${(v / maxCount) * 100}%`,
                    background: CATEGORY_COLORS[c],
                  }}
                />
              </span>
              <span className="cval">{v}</span>
            </div>
          )
        })}
        {weekEntries.length === 0 && (
          <p className="muted">最近 7 天没有记录。</p>
        )}
      </div>

      <div className="card">
        <h2>每日趋势</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CATEGORIES.map((c) => (
                <Bar
                  key={c}
                  dataKey={c}
                  stackId="a"
                  fill={CATEGORY_COLORS[c]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <h2>丰富度</h2>
          <div className="stat">
            <div className="num">{variety}</div>
            <div className="lbl">本周不同食物</div>
          </div>
        </div>
        <div className="card" style={{ flex: 2, minWidth: 240 }}>
          <h2>本周新尝试</h2>
          {newFoods.length === 0 ? (
            <p className="muted">最近 7 天没有新食物。</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {newFoods.map((f) => (
                <li key={f.food} className="small">
                  <strong>{f.label}</strong> —{' '}
                  {new Date(f.date + 'T00:00:00').toLocaleDateString('zh-CN')}
                </li>
              ))}
            </ul>
          )}
          <p className="small muted" style={{ marginTop: 8 }}>
            方便记录首次添加的辅食 — 留意是否有过敏反应。
          </p>
        </div>
      </div>

      {todayEntries.length > 0 && (
        <div className="card">
          <h2>今天的记录</h2>
          {todayEntries.map((e) => (
            <MealCard key={e.id} entry={e} foods={state.foods} />
          ))}
        </div>
      )}

      <p className="disclaimer">
        本工具仅用于记录食物分类的多样性，供家长自行参考，不构成任何医疗或膳食建议。
        关于宝宝营养的具体问题，请咨询儿科医生。
      </p>
    </>
  )
}
