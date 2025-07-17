"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { backend } from "@/services/backend/backend"
import type { RecentEvaluation } from "@/services/backend/types"

export function RecentEvaluations() {
  const [evaluations, setEvaluations] = useState<RecentEvaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecentEvaluations = async () => {
      try {
        const recentEvals = await backend().getRecentEvaluations()
        setEvaluations(recentEvals)
      } catch (error) {
        console.error('Failed to load recent evaluations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentEvaluations()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="ml-4 space-y-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="ml-auto h-4 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {evaluations.map((evalItem, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${evalItem.fallback}`} alt="Avatar" data-ai-hint="person" />
            <AvatarFallback>{evalItem.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{evalItem.name}</p>
            <p className="text-sm text-muted-foreground">{evalItem.email}</p>
          </div>
          <div className="ml-auto font-medium">+{evalItem.score}</div>
        </div>
      ))}
    </div>
  )
}
