import { useState, useReducer, useRef, useEffect, useLayoutEffect } from 'react'
import observeRect from '@reach/observe-rect'

export interface Rect {
  width: number
  height: number
}

export default function useRect(
  nodeRef: React.RefObject<HTMLElement>,
  initialRect = { width: 0, height: 0 }
) {
  const [element, setElement] = useState(nodeRef.current)
  const [rect, dispatch] = useReducer(rectReducer, initialRect)
  const initialRectSet = useRef(false)

  useLayoutEffect(() => {
    if (nodeRef.current !== element) {
      setElement(nodeRef.current)
    }
  }, [nodeRef.current])

  useLayoutEffect(() => {
    if (element && !initialRectSet.current) {
      initialRectSet.current = true
      const rect = element.getBoundingClientRect()
      dispatch({ rect })
    }
  }, [element])

  useEffect(() => {
    if (!element) {
      return
    }

    const observer = observeRect(element, (rect) => {
      dispatch({ rect })
    })

    observer.observe()

    return () => {
      observer.unobserve()
    }
  }, [element])

  return rect
}

function rectReducer(state: Rect, action: { rect: Rect }) {
  const rect = action.rect
  if (state.height !== rect.height || state.width !== rect.width) {
    return rect
  }
  return state
}
