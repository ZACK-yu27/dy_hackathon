import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CANVAS_NODE_GAP,
  CANVAS_NODE_HEIGHT,
  CANVAS_NODE_WIDTH,
  CANVAS_NODES_STORAGE_KEY,
  defaultCanvasNodes,
} from './data'
import type { CanvasRouteNode, TravelModule } from './types'

const SNAP_X_THRESHOLD = 40
const SNAP_Y_THRESHOLD = 44

function createNodeId(moduleId: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `node-${moduleId}-${crypto.randomUUID()}`
  }

  return `node-${moduleId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadInitialNodes(modules: TravelModule[]): CanvasRouteNode[] {
  if (typeof window === 'undefined') return defaultCanvasNodes

  try {
    const saved = window.localStorage.getItem(CANVAS_NODES_STORAGE_KEY)
    if (!saved) return defaultCanvasNodes

    const parsed = JSON.parse(saved) as CanvasRouteNode[]
    if (!Array.isArray(parsed)) return defaultCanvasNodes

    return parsed.filter(
      (node) =>
        node &&
        typeof node.id === 'string' &&
        typeof node.moduleId === 'string' &&
        typeof node.x === 'number' &&
        typeof node.y === 'number' &&
        modules.some((module) => module.id === node.moduleId),
    )
  } catch {
    return defaultCanvasNodes
  }
}

function snapNode(node: CanvasRouteNode, nodes: CanvasRouteNode[]): CanvasRouteNode {
  let best: { x: number; y: number; score: number } | null = null

  for (const other of nodes) {
    if (other.id === node.id) continue

    const candidates = [
      { x: other.x, y: other.y + CANVAS_NODE_HEIGHT + CANVAS_NODE_GAP },
      { x: other.x, y: other.y - CANVAS_NODE_HEIGHT - CANVAS_NODE_GAP },
    ]

    for (const candidate of candidates) {
      const dx = Math.abs(node.x - candidate.x)
      const dy = Math.abs(node.y - candidate.y)
      if (dx < SNAP_X_THRESHOLD && dy < SNAP_Y_THRESHOLD) {
        const score = dx + dy
        if (!best || score < best.score) {
          best = { ...candidate, score }
        }
      }
    }
  }

  return best ? { ...node, x: best.x, y: best.y } : node
}

export function useCanvasNodes(modules: TravelModule[]) {
  const [nodes, setNodes] = useState<CanvasRouteNode[]>(() => loadInitialNodes(modules))

  useEffect(() => {
    window.localStorage.setItem(CANVAS_NODES_STORAGE_KEY, JSON.stringify(nodes))
  }, [nodes])

  const modulesById = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules],
  )

  const addNode = useCallback((moduleId: string, x?: number, y?: number) => {
    setNodes((items) => {
      const fallbackIndex = items.length
      const nextNode: CanvasRouteNode = {
        id: createNodeId(moduleId),
        moduleId,
        x: x ?? 560,
        y: y ?? 360 + fallbackIndex * (CANVAS_NODE_HEIGHT + CANVAS_NODE_GAP),
        order: fallbackIndex,
      }

      const snapped = snapNode(nextNode, items)
      return [...items, snapped].map((node, index) => ({ ...node, order: index }))
    })
  }, [])

  const moveNode = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((items) => {
      const current = items.find((node) => node.id === nodeId)
      if (!current) return items

      const moved = snapNode({ ...current, x, y }, items)
      return items.map((node) => (node.id === nodeId ? moved : node))
    })
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((items) =>
      items
        .filter((node) => node.id !== nodeId)
        .map((node, index) => ({ ...node, order: index })),
    )
  }, [])

  const clearNodes = useCallback(() => {
    setNodes([])
  }, [])

  const getNode = useCallback((nodeId: string) => nodes.find((node) => node.id === nodeId), [nodes])

  const connections = useMemo(() => {
    const lines: Array<{ id: string; x: number; y1: number; y2: number }> = []
    const sorted = [...nodes].sort((a, b) => a.y - b.y)

    for (const upper of sorted) {
      const lower = sorted.find((node) => {
        if (node.id === upper.id) return false
        const sameColumn = Math.abs(node.x - upper.x) < 5
        const expectedY = upper.y + CANVAS_NODE_HEIGHT + CANVAS_NODE_GAP
        return sameColumn && Math.abs(node.y - expectedY) < 5
      })

      if (lower) {
        lines.push({
          id: `${upper.id}-${lower.id}`,
          x: upper.x + 56,
          y1: upper.y + CANVAS_NODE_HEIGHT,
          y2: lower.y,
        })
      }
    }

    return lines
  }, [nodes])

  return {
    nodes,
    modulesById,
    addNode,
    moveNode,
    removeNode,
    clearNodes,
    getNode,
    connections,
    nodeSize: {
      width: CANVAS_NODE_WIDTH,
      height: CANVAS_NODE_HEIGHT,
    },
  }
}
