import type { FoodPortion } from './types'

export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

// 把自由文本的一餐拆成若干「食物 + 份量」。
// 例如：
//   "牛奶(200ml), 鸡蛋(1个)"   -> [{牛奶, 200ml}, {鸡蛋, 1个}]
//   "香蕉（半个）、燕麦"        -> [{香蕉, 半个}, {燕麦, ''}]
// 分隔符：英文/中文逗号、分号、顿号、加号，或英文的 "and"。
// 括号：支持半角 () [] 与全角（）【】。
export function parsePortions(input: string): FoodPortion[] {
  if (!input.trim()) return []
  const parts = input
    .split(/[,;+，；、]|\band\b/gi)
    .map((p) => p.trim())
    .filter(Boolean)

  const portions: FoodPortion[] = []
  for (const part of parts) {
    const match = part.match(/^(.*?)[\(\[（【]([^)\]）】]*)[\)\]）】]\s*$/)
    let label: string
    let amount = ''
    if (match) {
      label = match[1].trim()
      amount = match[2].trim()
    } else {
      label = part.trim()
    }
    if (!label) continue
    portions.push({
      food: normalizeName(label),
      label,
      amount,
    })
  }
  return portions
}

export function portionToText(p: FoodPortion): string {
  return p.amount ? `${p.label}(${p.amount})` : p.label
}

export function portionsToText(portions: FoodPortion[]): string {
  return portions.map(portionToText).join('，')
}
