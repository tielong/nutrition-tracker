// 营养分类（保持简单，追踪各类别的均衡情况）。
export const CATEGORIES = [
  '碳水',
  '蛋白质',
  '纤维',
  '维生素',
  '乳制品',
  '脂肪',
] as const

export type Category = (typeof CATEGORIES)[number]

export const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐'] as const
export type MealType = (typeof MEAL_TYPES)[number]

// 应用可识别并分类的食物。
export interface Food {
  name: string // 规范化后的键（去空格、小写）
  label: string // 显示名称
  categories: Category[]
}

// 一餐中吃的某种食物，例如 牛奶(200ml)。
export interface FoodPortion {
  food: string // 规范化名称，对应 Food.name
  label: string // 输入 / 显示用
  amount: string // 自由文本的份量，例如 "200ml"、"1个"、"半个"
}

// 一条用餐记录。
export interface MealEntry {
  id: string
  date: string // YYYY-MM-DD
  meal: MealType
  portions: FoodPortion[]
  notes?: string
  createdAt: number
}

export interface BabyProfile {
  name: string
  birthdate: string // YYYY-MM-DD，可选
}

export interface AppState {
  version: number
  baby: BabyProfile
  foods: Record<string, Food> // 以规范化名称为键
  entries: MealEntry[]
}
