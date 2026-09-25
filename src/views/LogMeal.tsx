import type { AppState, Food, MealEntry } from '../types'
import { MealForm } from '../components/MealForm'
import { entriesForDate, todayStr } from '../analysis'
import { MealCard } from './History'

interface Props {
  state: AppState
  addEntry: (entry: MealEntry) => void
  upsertFood: (food: Food) => void
}

export function LogMeal({ state, addEntry, upsertFood }: Props) {
  const today = entriesForDate(state, todayStr()).sort(
    (a, b) => a.createdAt - b.createdAt,
  )

  return (
    <>
      <div className="card">
        <h2>记一餐</h2>
        <MealForm
          state={state}
          submitLabel="添加记录"
          onSave={addEntry}
          upsertFood={upsertFood}
        />
      </div>

      <div className="card">
        <h2>今天的记录</h2>
        {today.length === 0 ? (
          <p className="muted">今天还没有记录。</p>
        ) : (
          today.map((e) => (
            <MealCard key={e.id} entry={e} foods={state.foods} />
          ))
        )}
      </div>
    </>
  )
}
