export type ModuleType = 'scenic' | 'food' | 'transport' | 'hotel' | 'risk'

export interface TravelModule {
  id: string
  type: ModuleType
  title: string
  subtitle?: string
  time?: string
  tag?: string
  icon?: string
  riskTags?: string[]
  color?: string
  tagColor?: string
}

export type CustomModuleType = Exclude<ModuleType, 'risk'>

export interface CustomModuleInput {
  type: CustomModuleType
  title: string
  subtitle?: string
  riskTag?: string
}

export interface RouteItem {
  id: string
  moduleId: string
}

export interface CanvasRouteNode {
  id: string
  moduleId: string
  x: number
  y: number
  order: number
}

export interface CanvasTransform {
  x: number
  y: number
  scale: number
}

export type InsertPosition = 'before' | 'after'

export type InsertPreview = {
  overId: string | null
  position: InsertPosition
} | null
