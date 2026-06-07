import { useCallback, useEffect, useMemo, useState } from 'react'
import { ROUTE_STORAGE_KEY } from './data'
import type { RouteItem, TravelModule } from './types'

function createRouteId(moduleId: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `route-${moduleId}-${crypto.randomUUID()}`
  }

  return `route-${moduleId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadInitialRouteItems(modules: TravelModule[]): RouteItem[] {
  if (typeof window === 'undefined') return []

  const saved = window.localStorage.getItem(ROUTE_STORAGE_KEY)
  if (!saved) return []

  try {
    const parsed = JSON.parse(saved) as RouteItem[]
    if (!Array.isArray(parsed)) return []

    const usedModuleIds = new Set<string>()
    return parsed.filter(
      (item) => {
        const isValid =
          item &&
          typeof item.id === 'string' &&
          typeof item.moduleId === 'string' &&
          modules.some((module) => module.id === item.moduleId) &&
          !usedModuleIds.has(item.moduleId)

        if (isValid) usedModuleIds.add(item.moduleId)
        return isValid
      },
    )
  } catch {
    return []
  }
}

export function useRouteBuilder(modules: TravelModule[]) {
  const [routeItems, setRouteItems] = useState<RouteItem[]>(() => loadInitialRouteItems(modules))

  useEffect(() => {
    window.localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routeItems))
  }, [routeItems])

  const routeModulesById = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules],
  )

  const usedModuleIds = useMemo(
    () => new Set(routeItems.map((item) => item.moduleId)),
    [routeItems],
  )

  const availableModules = useMemo(
    () => modules.filter((module) => !usedModuleIds.has(module.id)),
    [modules, usedModuleIds],
  )

  const addModuleToRoute = useCallback((moduleId: string, insertIndex?: number) => {
    setRouteItems((items) => {
      if (items.some((item) => item.moduleId === moduleId)) return items

      const nextItem = { id: createRouteId(moduleId), moduleId }
      const safeIndex =
        typeof insertIndex === 'number'
          ? Math.min(Math.max(insertIndex, 0), items.length)
          : items.length

      return [...items.slice(0, safeIndex), nextItem, ...items.slice(safeIndex)]
    })
  }, [])

  const removeRouteItem = useCallback((routeItemId: string) => {
    setRouteItems((items) => items.filter((item) => item.id !== routeItemId))
  }, [])

  const moveRouteItem = useCallback((activeId: string, insertIndex: number) => {
    setRouteItems((items) => {
      const activeIndex = items.findIndex((item) => item.id === activeId)
      if (activeIndex < 0) return items

      const activeItem = items[activeIndex]
      const withoutActive = items.filter((item) => item.id !== activeId)
      const adjustedIndex = activeIndex < insertIndex ? insertIndex - 1 : insertIndex
      const safeIndex = Math.min(Math.max(adjustedIndex, 0), withoutActive.length)

      return [
        ...withoutActive.slice(0, safeIndex),
        activeItem,
        ...withoutActive.slice(safeIndex),
      ]
    })
  }, [])

  const clearRouteItems = useCallback(() => setRouteItems([]), [])

  return {
    routeItems,
    routeModulesById,
    availableModules,
    addModuleToRoute,
    removeRouteItem,
    moveRouteItem,
    clearRouteItems,
  }
}
