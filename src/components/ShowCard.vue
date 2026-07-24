<template>
  <RouterLink
    class="link"
    :to="{ name: 'details', params: { id: show.id } }"
    @pointerenter="prefetchDetails"
    @focus="prefetchDetails"
    @mouseleave="cancelPrefetch"
  >
    <article class="card">
      <div class="media">
        <img class="poster" :src="posterSrc" :alt="show.title" loading="lazy" />
        <span v-if="ratingText" class="rating" aria-label="Rating">
          <span class="star" aria-hidden="true">★</span>
          {{ ratingText }}
        </span>

        <button
          class="fav"
          :class="{ active: isFav }"
          type="button"
          :aria-label="isFav ? 'Remove from My List' : 'Add to My List'"
          @click.prevent.stop="onToggleFav"
        >
          <span class="fav-icon" aria-hidden="true">{{ isFav ? '♥' : '♡' }}</span>
        </button>

        <p v-if="descriptionText" class="desc">
          {{ descriptionText }}
        </p>
      </div>

      <div class="content">
        <h3 class="title">{{ show.title }}</h3>
        <p v-if="genresText" class="meta">{{ genresText }}</p>
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

import fallbackPosterUrl from '@/assets/images/fallback.png'

import type { Show } from '@/models/show.model'
import { useShowsStore } from '@/store/shows'

const props = defineProps<{ show: Show }>()

const { isShowInFavourites, toggleShowToFavourites, getShowDetails } = useShowsStore()

const hoverTimer = ref<number | null>(null)

const isFav = computed(() => isShowInFavourites(props.show.id))
const posterSrc = computed(() => props.show.image.default ?? fallbackPosterUrl)
const genresText = computed(() => props.show.genres.slice(0, 2).join(' • '))
const ratingText = computed(() => {
  const r = props.show?.rating || 0
  if (r <= 0) return ''

  return r.toFixed(1)
})
const descriptionText = computed(() => {
  const MAX = 140
  const description = props.show.description || ''

  if (description.length <= MAX) return description
  return `${description.slice(0, MAX)}…`
})

async function onToggleFav() {
  await toggleShowToFavourites(props.show.id)
}

function prefetchDetails() {
  hoverTimer.value = window.setTimeout(() => getShowDetails(props.show.id), 300)
}

function cancelPrefetch() {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
}

onBeforeUnmount(cancelPrefetch)
</script>

<style scoped lang="scss">
.link {
  text-decoration: none;
  color: inherit;
  outline: none;
  position: relative;
  display: block;
}

.card {
  width: calc(var(--card-w) + 36px);
  min-width: calc(var(--card-w) + 36px);
  flex: 0 0 calc(var(--card-w) + 36px);
  background: transparent;
  border: 0;
}

.media {
  position: relative;
  border-radius: calc(var(--radius) + 10px);
  overflow: hidden;
  background: var(--bg-light);
}

.poster {
  width: 100%;
  height: calc(var(--card-h) + 36px);
  object-fit: cover;
  background: var(--bg-light);
  transition: filter 0.15s ease;
}

.link:hover .poster,
.link:focus-visible .poster {
  filter: brightness(0.75);
}

.desc {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 12px 12px 10px;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(240, 242, 245, 0.92);
  background: linear-gradient(
    to top,
    rgba(10, 12, 15, 0.98) 0%,
    rgba(10, 12, 15, 0.76) 55%,
    rgba(10, 12, 15, 0) 100%
  );
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  pointer-events: none;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 5;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.link:hover .desc,
.link:focus-visible .desc {
  opacity: 1;
  transform: translateY(0);
}

.rating {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 10px;
  background: var(--green);
  color: #000;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.fav {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(10, 12, 15, 0.55);
  color: rgba(240, 242, 245, 0.95);
  cursor: pointer;
  backdrop-filter: blur(8px);

  &.active {
    background: var(--green);
    color: #000;
    border-color: rgba(0, 0, 0, 0.18);
  }

  &-icon {
    font-size: 16px;
    line-height: 1;
  }
}

.star {
  font-size: 13px;
  line-height: 1;
}

.content {
  padding: 8px 2px 0;
}

.title {
  font-family: var(--font-display);
  font-size: 16px;
  line-height: 1.15;
  margin: 0 0 6px;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  font-size: 13px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}
</style>
