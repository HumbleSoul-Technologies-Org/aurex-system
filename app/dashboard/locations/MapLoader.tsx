"use client"

import dynamic from 'next/dynamic'
import React from 'react'

const MapClient = dynamic(() => import('./MapClient'), { ssr: false })

export default function MapLoader() {
  return <MapClient />
}
