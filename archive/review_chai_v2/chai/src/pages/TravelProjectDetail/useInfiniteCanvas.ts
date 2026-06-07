import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'
import { CANVAS_TRANSFORM_STORAGE_KEY } from './data'
import type { CanvasTransform } from './types'

export const MIN_SCALE = 0.5
export const MAX_SCALE = 2.2
export const SCALE_STEP = 0.1

const DEFAULT_TRANSFORM: CanvasTransform = { x: -330, y: -250, scale: 0.82 }

type PointerPoint = {
  clientX: number
  clientY: number
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

function getDistance(a: PointerPoint, b: PointerPoint) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

function getMidpoint(a: PointerPoint, b: PointerPoint) {
  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2,
  }
}

function loadInitialTransform(): CanvasTransform {
  if (typeof window === 'undefined') return DEFAULT_TRANSFORM

  try {
    const saved = window.localStorage.getItem(CANVAS_TRANSFORM_STORAGE_KEY)
    if (!saved) return DEFAULT_TRANSFORM

    const parsed = JSON.parse(saved) as CanvasTransform
    if (
      typeof parsed.x === 'number' &&
      typeof parsed.y === 'number' &&
      typeof parsed.scale === 'number'
    ) {
      return { ...parsed, scale: clampScale(parsed.scale) }
    }
  } catch {
    return DEFAULT_TRANSFORM
  }

  return DEFAULT_TRANSFORM
}

export function useInfiniteCanvas() {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const pointersRef = useRef(new Map<number, PointerPoint>())
  const panStartRef = useRef<{
    pointerId: number
    clientX: number
    clientY: number
    transform: CanvasTransform
  } | null>(null)
  const pinchStartRef = useRef<{
    distance: number
    midpoint: PointerPoint
    transform: CanvasTransform
  } | null>(null)
  const [transform, setTransform] = useState<CanvasTransform>(loadInitialTransform)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      window.localStorage.setItem(CANVAS_TRANSFORM_STORAGE_KEY, JSON.stringify(transform))
    }, 120)

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [transform])

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      return {
        x: (clientX - rect.left - transform.x) / transform.scale,
        y: (clientY - rect.top - transform.y) / transform.scale,
      }
    },
    [transform],
  )

  const zoomAt = useCallback((nextScale: number, clientX?: number, clientY?: number) => {
    setTransform((current) => {
      const rect = viewportRef.current?.getBoundingClientRect()
      const originX = clientX ?? (rect ? rect.left + rect.width / 2 : 0)
      const originY = clientY ?? (rect ? rect.top + rect.height / 2 : 0)
      const viewportLeft = rect?.left ?? 0
      const viewportTop = rect?.top ?? 0
      const clampedScale = clampScale(nextScale)
      const canvasX = (originX - viewportLeft - current.x) / current.scale
      const canvasY = (originY - viewportTop - current.y) / current.scale

      return {
        x: originX - viewportLeft - canvasX * clampedScale,
        y: originY - viewportTop - canvasY * clampedScale,
        scale: clampedScale,
      }
    })
  }, [])

  const zoomIn = useCallback(() => {
    zoomAt(transform.scale + SCALE_STEP)
  }, [transform.scale, zoomAt])

  const zoomOut = useCallback(() => {
    zoomAt(transform.scale - SCALE_STEP)
  }, [transform.scale, zoomAt])

  const resetView = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('[data-canvas-interactive="true"]')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    })

    const pointers = Array.from(pointersRef.current.values())
    if (pointers.length === 1) {
      panStartRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        transform,
      }
    }

    if (pointers.length === 2) {
      panStartRef.current = null
      pinchStartRef.current = {
        distance: getDistance(pointers[0], pointers[1]),
        midpoint: getMidpoint(pointers[0], pointers[1]),
        transform,
      }
    }
  }, [transform])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return

    pointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    })

    const pointers = Array.from(pointersRef.current.values())
    if (pointers.length === 2 && pinchStartRef.current) {
      const distance = getDistance(pointers[0], pointers[1])
      const midpoint = getMidpoint(pointers[0], pointers[1])
      const start = pinchStartRef.current
      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) return

      const nextScale = clampScale(start.transform.scale * (distance / start.distance))
      const canvasX = (start.midpoint.clientX - rect.left - start.transform.x) / start.transform.scale
      const canvasY = (start.midpoint.clientY - rect.top - start.transform.y) / start.transform.scale

      setTransform({
        x: midpoint.clientX - rect.left - canvasX * nextScale,
        y: midpoint.clientY - rect.top - canvasY * nextScale,
        scale: nextScale,
      })
      return
    }

    if (pointers.length === 1 && panStartRef.current?.pointerId === event.pointerId) {
      const start = panStartRef.current
      setTransform({
        ...start.transform,
        x: start.transform.x + event.clientX - start.clientX,
        y: start.transform.y + event.clientY - start.clientY,
      })
    }
  }, [])

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const pointers = Array.from(pointersRef.current.values())
    if (pointers.length < 2) pinchStartRef.current = null
    if (pointers.length === 1) {
      panStartRef.current = {
        pointerId: event.pointerId,
        clientX: pointers[0].clientX,
        clientY: pointers[0].clientY,
        transform,
      }
    } else {
      panStartRef.current = null
    }
  }, [transform])

  const handleWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? -1 : 1
    zoomAt(transform.scale + direction * SCALE_STEP, event.clientX, event.clientY)
  }, [transform.scale, zoomAt])

  return {
    viewportRef,
    transform,
    screenToCanvas,
    zoomAt,
    zoomIn,
    zoomOut,
    resetView,
    viewportHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onWheel: handleWheel,
    },
  }
}
