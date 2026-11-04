/** 大屏内部复用的视图类型 */

export type PillTone = 'danger' | 'warning' | 'info' | 'success' | 'violet' | 'neutral'

export type PanelAccent = 'cyan' | 'amber' | 'rose' | 'emerald' | 'violet' | 'indigo'

export interface DataColumn {
  key: string
  label: string
  /** CSS grid 轨道尺寸，默认等分 */
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DonutItem {
  name: string
  value: number
  color: string
}

export interface DeckConfig {
  key: string
  title: string
}
