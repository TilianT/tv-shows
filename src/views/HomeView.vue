<template>
  <div>
    <HeroShow :entries="entries" :is-loading="isLoading" />

    <GenresNav />

    <ShowSection
      v-if="recentlyViewedShowList.length"
      title="Recently Viewed"
      :shows="recentlyViewedShowList"
    />

    <template v-if="isLoading && entries.length === 0">
      <ShowSection :loading="true" />
      <ShowSection :loading="true" />
      <ShowSection :loading="true" />
    </template>

    <ShowSection
      v-for="[genre, shows] in visibleEntries"
      :key="genre"
      :title="genre"
      :shows="shows"
      :link-to="{ name: 'genre', params: { genre } }"
    />

    <div ref="loadMoreEl" :style="{ height: '1px' }" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'

import isMobileDevice from '@/utils/isMobileDevice'

import { useShowsStore } from '@/store/shows'

import ShowSection from '@/components/ShowSection.vue'
import GenresNav from '@/components/GenresNav.vue'
import HeroShow from '@/components/HeroShow.vue'

const CHUNK_SIZE = isMobileDevice() ? 2 : 4

const { isLoading, recentlyViewedShowList, genreMap } = storeToRefs(useShowsStore())
const { loadMoreShows } = useShowsStore()

const entries = computed(() => Array.from(genreMap.value))
const visibleCount = ref(CHUNK_SIZE)
const visibleEntries = computed(() => entries.value.slice(0, visibleCount.value))

const loadMoreEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function forceScrollTop(): void {
  window.scrollTo({ left: 0, top: 0 })
}

function detachObserver(): void {
  observer?.disconnect()
  observer = null
}

function attachObserver(): void {
  if (observer) return
  if (!loadMoreEl.value) return
  if (entries.value.length > 0 && visibleCount.value >= entries.value.length) return

  observer = new IntersectionObserver(
    (obsEntries) => {
      const entry = obsEntries[0]
      if (!entry?.isIntersecting) return

      if (entries.value.length === 0) return

      visibleCount.value = Math.min(visibleCount.value + CHUNK_SIZE, entries.value.length)

      if (visibleCount.value >= entries.value.length) {
        detachObserver()
      }
    },
    { root: null, rootMargin: '600px 0px', threshold: 0 },
  )

  observer.observe(loadMoreEl.value)
}

onMounted(() => {
  if (genreMap.value.size === 0) loadMoreShows()
  attachObserver()
  requestAnimationFrame(() => forceScrollTop())
})

onActivated(() => attachObserver())
onDeactivated(() => detachObserver())
onBeforeUnmount(() => detachObserver())
</script>
