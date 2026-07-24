<template>
  <section ref="rootEl" class="show-list">
    <div class="head">
      <h2 v-if="!loading && title" class="title">{{ title }}</h2>
      <div v-else-if="loading" class="title-skeleton sk-shimmer" aria-hidden="true" />

      <RouterLink v-if="linkTo && !loading" class="head-link" :to="linkTo">
        {{ linkText }}
      </RouterLink>
      <div v-else-if="linkTo && loading" class="link-skeleton sk-shimmer" aria-hidden="true" />
    </div>

    <div v-if="loading" class="cards-skeleton" aria-hidden="true">
      <div v-for="i in CHUNK_SIZE" :key="i" class="card-skeleton">
        <div class="card-skeleton__poster sk-shimmer" />
        <div class="card-skeleton__title sk-shimmer" />
        <div class="card-skeleton__meta sk-shimmer" />
      </div>
    </div>

    <div v-else-if="isActive" ref="rowEl" class="row">
      <ShowCard v-for="item in visibleShows" :key="item.id" :show="item" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import ShowCard from '@/components/ShowCard.vue'
import isMobileDevice from '@/utils/isMobileDevice'
import type { Show } from '@/models/show.model'

const props = withDefaults(
  defineProps<{
    title?: string
    shows?: Show[]
    linkTo?: RouteLocationRaw
    linkText?: string
    lazy?: boolean
    loading?: boolean
  }>(),
  {
    shows: () => [],
    linkText: 'See all',
    lazy: true,
    loading: false,
  },
)

const CHUNK_SIZE = isMobileDevice() ? 4 : 12

const rootEl = ref<HTMLElement | null>(null)
const rowEl = ref<HTMLElement | null>(null)

const isActive = ref(!props.lazy)
const visibleCount = ref(CHUNK_SIZE)

const visibleShows = computed(() => props.shows.slice(0, visibleCount.value))

let observer: IntersectionObserver | null = null

function onRowScroll() {
  if (!rowEl.value) return

  const nearEnd = rowEl.value.scrollLeft + rowEl.value.clientWidth >= rowEl.value.scrollWidth - 120

  if (nearEnd && visibleCount.value < props.shows.length) {
    visibleCount.value = Math.min(visibleCount.value + CHUNK_SIZE, props.shows.length)
  }
}

function attachScroll() {
  rowEl.value?.addEventListener('scroll', onRowScroll, { passive: true })
}
function detachScroll() {
  rowEl.value?.removeEventListener('scroll', onRowScroll)
}

onMounted(() => {
  if (!props.lazy) {
    attachScroll()
    return
  }

  if (!props.shows.length || !rootEl.value) return

  observer = new IntersectionObserver(
    async ([entry]) => {
      if (!entry?.isIntersecting) return

      isActive.value = true

      observer?.disconnect()
      observer = null

      await nextTick()
      attachScroll()
    },
    { rootMargin: '300px 0px' },
  )

  observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  detachScroll()
})
</script>

<style scoped lang="scss">
.show-list {
  padding: 8px 0 18px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 10px;
}

.title {
  font-family: var(--font-display);
  color: var(--text);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
  text-transform: capitalize;

  &-skeleton {
    height: 22px;
    width: 160px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
}

.head-link {
  flex-shrink: 0;
  color: var(--text-dim);
  font-size: 13px;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--bg-light);
    color: var(--text);
  }
}

.link-skeleton {
  height: 28px;
  width: 72px;
  border-radius: 8px;
  border: 1px solid var(--border);
  opacity: 0.7;
}

.cards-skeleton {
  display: flex;
  gap: 16px;
  overflow: hidden;
  padding: 8px 0;
}

.card-skeleton {
  width: calc(var(--card-w) + 36px);
  min-width: calc(var(--card-w) + 36px);
  flex: 0 0 calc(var(--card-w) + 36px);
}
</style>
