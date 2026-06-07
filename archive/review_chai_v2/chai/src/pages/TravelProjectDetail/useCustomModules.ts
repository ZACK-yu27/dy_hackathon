import { useCallback, useEffect, useState } from 'react'
import {
  CUSTOM_MODULES_STORAGE_KEY,
  moduleTypeLabels,
  moduleVisuals,
} from './data'
import type { CustomModuleInput, TravelModule } from './types'

function createCustomModuleId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `custom-${crypto.randomUUID()}`
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadCustomModules(): TravelModule[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(CUSTOM_MODULES_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved) as TravelModule[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (module) =>
        module &&
        typeof module.id === 'string' &&
        typeof module.title === 'string' &&
        ['scenic', 'transport', 'food', 'hotel'].includes(module.type),
    )
  } catch {
    return []
  }
}

export function useCustomModules() {
  const [customModules, setCustomModules] = useState<TravelModule[]>(loadCustomModules)

  useEffect(() => {
    window.localStorage.setItem(CUSTOM_MODULES_STORAGE_KEY, JSON.stringify(customModules))
  }, [customModules])

  const addCustomModule = useCallback((input: CustomModuleInput) => {
    const visuals = moduleVisuals[input.type]
    const module: TravelModule = {
      id: createCustomModuleId(),
      type: input.type,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || '自定义模块',
      time: input.subtitle?.trim() || '自由安排',
      tag: moduleTypeLabels[input.type],
      icon: visuals.icon,
      riskTags: input.riskTag?.trim() ? [input.riskTag.trim()] : undefined,
      color: visuals.color,
      tagColor: visuals.tagColor,
    }

    setCustomModules((items) => [...items, module])
    return module
  }, [])

  return {
    customModules,
    addCustomModule,
  }
}
