<template>
  <div class="search">
    <span class="icon" aria-hidden="true">⌕</span>
    <input
      :value="query"
      @input="onInput"
      class="input"
      name="search"
      placeholder="Search shows…"
      ref="inputEl"
      type="text"
    />

    <span v-if="isLoading" class="spinner" aria-label="Searching" role="status" />

    <button
      v-if="query.length"
      @click="clear"
      aria-label="Clear search"
      class="clear"
      type="button"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import debounce from '@/utils/debounce'

import { useShowsSearchStore } from '@/store/shows.search'

const route = useRoute()
const router = useRouter()

const { findShowsByQuery } = useShowsSearchStore()
const { isLoading } = storeToRefs(useShowsSearchStore())

const query = ref('')
const searchOriginFullPath = ref<string | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const isSearchRoute = computed(() => route.name === 'search')

function setSearchRoute(trimmedQuery: string) {
  const to = { name: 'search', query: { q: trimmedQuery } }
  if (isSearchRoute.value) router.replace(to)
  else router.push(to)
}

const setSearchRouteDebounced = debounce(setSearchRoute, 500)

function clearSearch() {
  setSearchRouteDebounced.cancel()
  findShowsByQuery('')

  if (!isSearchRoute.value) return

  const origin = searchOriginFullPath.value
  searchOriginFullPath.value = null

  if (origin) {
    router.push(origin)
    return
  }

  if (route.query.q) {
    router.replace({ name: 'search', query: {} })
  }
}

function onInput(e: Event) {
  const target = e.target
  if (!(target instanceof HTMLInputElement)) return

  const nextQuery = target.value
  query.value = nextQuery

  const trimmed = nextQuery.trim()

  if (trimmed.length === 0) {
    clearSearch()
    return
  }

  if (!isSearchRoute.value && !searchOriginFullPath.value) {
    searchOriginFullPath.value = route.fullPath
  }

  setSearchRouteDebounced(trimmed)
}

function clear() {
  query.value = ''
  clearSearch()

  inputEl.value?.focus()
}

watch(
  () => route.query.q,
  (q) => {
    const nextFromRoute = typeof q === 'string' ? q : ''
    const isInputFocused = document.activeElement === inputEl.value

    if (!isInputFocused || query.value.trim() !== nextFromRoute) {
      query.value = nextFromRoute
    }

    if (route.name === 'search') {
      findShowsByQuery(query.value)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.search {
  width: 100%;
  max-width: 440px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 14px;
  transition:
    background 0.2s,
    border-color 0.2s;

  &:focus-within {
    background: var(--surface);
    border-color: var(--green);
  }
}

.icon {
  color: var(--text-dim);
  font-size: 28px;
}

.input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--text);
  font-size: 13px;
  padding: 10px 0;
}

.spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(240, 242, 245, 0.18);
  border-top-color: var(--green);
  animation: spin 0.8s linear infinite;
  flex: 0 0 auto;
}

.clear {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 28px;
  line-height: 0;
  border: none;
  background: transparent;
  color: rgba(240, 242, 245, 0.9);
  cursor: pointer;
  flex: 0 0 auto;

  &:hover {
    background: var(--surface);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .search {
    max-width: none;
  }
}
</style>
