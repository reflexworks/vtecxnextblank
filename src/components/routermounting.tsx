"use client"

import React, { useEffect } from "react"

interface IProp {
  children: React.ReactNode
}

export const RouterMounting = ({ children }: IProp) => {
  const [mounted, setMounted] = React.useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return <>{children}</>
}
