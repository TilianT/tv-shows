import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getListByQuery } from '@/api'

import { sortShowsByRating } from './shows.helpers'

import type { Show } from '@/models/show.model'

export const useShowsSearchStore = defineStore('shows-search', () => {
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const searchList = ref<Show[]>([])

  async function findShowsByQuery(query: string): Promise<void> {
    const trimmed = query.trim()
    error.value = null

    if (!trimmed) {
      isLoading.value = false
      searchList.value = []

      return
    }

    try {
      isLoading.value = true
      searchList.value = sortShowsByRating(await getListByQuery(trimmed))
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      searchList.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    error,
    findShowsByQuery,
    isLoading,
    searchList,
  }
})
