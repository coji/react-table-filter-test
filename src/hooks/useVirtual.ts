import React, { useLayoutEffect } from 'react'
import useRect, { Rect } from './useRect'

type Key = number | string

export type VirtualItem = {
  key: Key
  index: number
  start: number
  end: number
  size: number
  measureRef: (el: HTMLElement | null) => void
}

export interface Range {
  start: number
  end: number
  overscan: number
  size: number
}

interface Measurement {
  scrollOffset: number
  measurements: any[]
  outerSize: number
  totalSize: number
}

const defaultEstimateSize = () => 50

const defaultMeasureSize = (el: HTMLElement) => {
  return el.offsetHeight
}

export const defaultRangeExtractor = (range: Range) => {
  const start = Math.max(range.start - range.overscan, 0)
  const end = Math.min(range.end + range.overscan, range.size - 1)

  const arr = []

  for (let i = start; i <= end; i++) {
    arr.push(i)
  }

  return arr
}

export function useVirtual({
  size = 0,
  estimateSize = defaultEstimateSize,
  overscan = 1,
  paddingStart = 0,
  paddingEnd = 0,
  parentRef,
  scrollToFn,
  initialRect,
}: {
  size: number
  estimateSize?: (index: number) => number
  overscan?: number
  paddingStart?: number
  paddingEnd?: number
  parentRef: React.RefObject<HTMLElement>
  scrollToFn?: (
    offset: number,
    defaultScrollToFn?: (offset: number) => void
  ) => void
  initialRect?: Rect
}) {
  const latestRef = React.useRef<Measurement>({
    scrollOffset: 0,
    measurements: [],
    outerSize: 0,
    totalSize: 0,
  })

  const [scrollOffset, setScrollOffset] = React.useState(0)
  latestRef.current.scrollOffset = scrollOffset

  const { height: outerSize } = useRect(parentRef, initialRect)

  latestRef.current.outerSize = outerSize

  const defaultScrollToFn = React.useCallback(
    (offset: number) => {
      if (parentRef.current) {
        parentRef.current.scrollTop = offset
      }
    },
    [parentRef]
  )

  const [measuredCache, setMeasuredCache] = React.useState<{ [key: Key]: any }>(
    {}
  )

  const measure = React.useCallback(() => setMeasuredCache({}), [])

  const pendingMeasuredCacheIndexesRef = React.useRef<number[]>([])

  const measurements = React.useMemo(() => {
    const min =
      pendingMeasuredCacheIndexesRef.current.length > 0
        ? Math.min(...pendingMeasuredCacheIndexesRef.current)
        : 0
    pendingMeasuredCacheIndexesRef.current = []

    const measurements = latestRef.current.measurements.slice(0, min)

    for (let i = min; i < size; i++) {
      const key = i
      const measuredSize = measuredCache[key]
      const start = measurements[i - 1] ? measurements[i - 1].end : paddingStart
      const size =
        typeof measuredSize === 'number' ? measuredSize : estimateSize(i)
      const end = start + size
      measurements[i] = { index: i, start, size, end, key }
    }
    return measurements
  }, [estimateSize, measuredCache, paddingStart, size])

  const totalSize = (measurements[size - 1]?.end || paddingStart) + paddingEnd

  latestRef.current.measurements = measurements
  latestRef.current.totalSize = totalSize

  const element = parentRef.current

  useLayoutEffect(() => {
    if (!element) {
      setScrollOffset(0)
      return
    }

    const onScroll = (event: Event) => {
      setScrollOffset(element.scrollTop)
    }

    element.addEventListener('scroll', onScroll, {
      capture: false,
      passive: true,
    })

    return () => {
      element.removeEventListener('scroll', onScroll)
    }
  }, [element])

  const { start, end } = calculateRange(latestRef.current)

  const indexes = React.useMemo(() => {
    return defaultRangeExtractor({
      start,
      end,
      overscan,
      size: measurements.length,
    })
  }, [start, end, overscan, measurements.length])

  const virtualItems = React.useMemo(() => {
    const virtualItems = []

    for (let k = 0, len = indexes.length; k < len; k++) {
      const i = indexes[k]
      const measurement = measurements[i]

      const item = {
        ...measurement,
        measureRef: (el: HTMLElement) => {
          if (el) {
            const measuredSize = defaultMeasureSize(el)

            if (measuredSize !== item.size) {
              const { scrollOffset } = latestRef.current

              if (item.start < scrollOffset) {
                defaultScrollToFn(scrollOffset + (measuredSize - item.size))
              }

              pendingMeasuredCacheIndexesRef.current.push(i)

              setMeasuredCache((old) => ({
                ...old,
                [item.key]: measuredSize,
              }))
            }
          }
        },
      }

      virtualItems.push(item)
    }

    return virtualItems
  }, [indexes, measurements])

  const mountedRef = React.useRef(false)

  useLayoutEffect(() => {
    if (mountedRef.current) {
      setMeasuredCache({})
    }
    mountedRef.current = true
  }, [estimateSize])

  return {
    virtualItems,
    totalSize,
    measure,
  }
}

const findNearestBinarySearch = (
  low: number,
  high: number,
  getCurrentValue: (index: number) => any,
  value: number
) => {
  while (low <= high) {
    let middle = ((low + high) / 2) | 0
    let currentValue = getCurrentValue(middle)

    if (currentValue < value) {
      low = middle + 1
    } else if (currentValue > value) {
      high = middle - 1
    } else {
      return middle
    }
  }

  if (low > 0) {
    return low - 1
  } else {
    return 0
  }
}

function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
}: {
  measurements: VirtualItem[]
  outerSize: number
  scrollOffset: number
}) {
  const size = measurements.length - 1
  const getOffset = (index: number) => measurements[index].start

  let start = findNearestBinarySearch(0, size, getOffset, scrollOffset)
  let end = start

  while (end < size && measurements[end].end < scrollOffset + outerSize) {
    end++
  }

  return { start, end }
}
