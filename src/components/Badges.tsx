import type { Category } from '../types'
import { CATEGORY_COLORS } from '../foodData'

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="badge" style={{ background: CATEGORY_COLORS[category] }}>
      {category}
    </span>
  )
}

export function CategoryBadges({ categories }: { categories: Category[] }) {
  if (!categories.length)
    return <span className="muted small">uncategorized</span>
  return (
    <span className="badges">
      {categories.map((c) => (
        <CategoryBadge key={c} category={c} />
      ))}
    </span>
  )
}
