// lib/hooks/useLoginPromptTimer.ts
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useLoginPromptTimer(callback: () => void, timeoutMs = 1 * 60 * 1000) {
  useEffect(() => {
    let timer: NodeJS.Timeout

    const checkAndStart = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        timer = setTimeout(() => {
          callback()
        }, timeoutMs)
      }
    }

    checkAndStart()
    return () => clearTimeout(timer)
  }, [callback, timeoutMs])
}
