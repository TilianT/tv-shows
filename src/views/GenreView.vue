<template>
  <section class="page-grid">
    <div v-if="isLoadingNextPage && shows.length === 0" class="skeleton" aria-hidden="true">
      <div class="title-skeleton sk-shimmer" />
      <div class="grid-skeleton">
        <div v-for="i in 12" :key="i" class="card-skeleton">
          <div class="card-skeleton__poster sk-shimmer" />
          <div class="card-skeleton__title sk-shimmer" />
          <div class="card-skeleton__meta sk-shimmer" />
        </div>
      </div>
    </div>

    <ShowGrid v-else :title="`${genre} Shows`" :shows="visibleShows" />

    <div ref="loadMoreEl" style="height: 1px" />

    <div v-if="isLoadingNextPage" class="loader" aria-live="polite" aria-label="Loading more shows">
      <span class="loader__dot" />
      <span class="loader__dot" />
      <span class="loader__dot" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import isMobileDevice from '@/utils/isMobileDevice'

import { useShowsStore } from '@/store/shows'

import ShowGrid from '@/components/ShowGrid.vue'

const route = useRoute()
const { hasMore, isLoadingNextPage } = storeToRefs(useShowsStore())
const { getShowsByGenre, loadMoreShows } = useShowsStore()

const CHUNK_SIZE = isMobileDevice() ? 4 : 12

const loadMoreEl = ref<HTMLElement | null>(null)
const visibleCount = ref(CHUNK_SIZE)

let observer: IntersectionObserver | null = null

const genre = computed(() => route.params.genre as string)
const shows = computed(() => getShowsByGenre(genre.value))
const visibleShows = computed(() => shows.value.slice(0, visibleCount.value))

function restartObserver(): void {
  if (!observer || !loadMoreEl.value) return
  observer.unobserve(loadMoreEl.value)
  observer.observe(loadMoreEl.value)
}

async function handleLoadMore() {
  if (isLoadingNextPage.value) return

  try {
    if (visibleCount.value < shows.value.length) {
      visibleCount.value += CHUNK_SIZE
    } else if (hasMore.value) {
      await nextTick()
      await loadMoreShows()

      visibleCount.value += CHUNK_SIZE
    }
  } finally {
    restartObserver()
  }
}

function attachObserver(): void {
  if (observer || !loadMoreEl.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) void handleLoadMore()
    },
    { rootMargin: '600px 0px', threshold: 0 },
  )

  observer.observe(loadMoreEl.value)
}

watch(genre, () => {
  visibleCount.value = CHUNK_SIZE
  window.scrollTo({ top: 0, behavior: 'instant' })
  attachObserver()
})

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  attachObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped lang="scss">
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 32px 0;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim, #888);
    animation: loader-pulse 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes loader-pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.75);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
