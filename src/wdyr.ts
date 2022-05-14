/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react'

if (import.meta.env.MODE === 'development') {
  const { default: whyDidYouRender } = await import(
    '@welldone-software/why-did-you-render'
  )
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}
