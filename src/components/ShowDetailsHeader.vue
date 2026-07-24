<template>
  <section class="header">
    <div class="poster-wrap">
      <img class="poster" :src="posterSrc" :alt="show.title" />
    </div>

    <div class="info">
      <div class="chips">
        <span v-for="g in show.genres.slice(0, 3)" :key="g" class="chip">{{ g }}</span>
      </div>

      <h1 class="title">{{ show.title }}</h1>

      <div class="meta-row">
        <span v-if="ratingText" class="rating">
          <span class="star" aria-hidden="true">★</span>
          {{ ratingText }}
        </span>
        <span v-else class="meta-dim">No rating</span>

        <span v-if="statusText" class="status-pill">{{ statusText }}</span>

        <span v-if="networkText" class="meta-item">{{ networkText }}</span>
        <span v-if="startYearText" class="meta-item">{{ startYearText }}</span>
      </div>

      <button class="my-list" :class="{ active: isFav }" type="button" @click="onToggle">
        <span class="my-list-icon" aria-hidden="true">{{ isFav ? '♥' : '♡' }}</span>
        {{ isFav ? 'In My List' : 'Add to My List' }}
      </button>

      <p class="desc">{{ summaryText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import fallbackPosterUrl from '@/assets/images/fallback.png'

import type { Show } from '@/models/show.model'
import { useShowsStore } from '@/store/shows'

const props = defineProps<{ show: Show }>()

const { isShowInFavourites, toggleShowToFavourites } = useShowsStore()

const isFav = computed(() => isShowInFavourites(props.show.id))
const posterSrc = computed(() => props.show.image?.default ?? fallbackPosterUrl)
const summaryText = computed(() => props.show.description || 'No description yet.')
const statusText = computed(() => props.show.status?.trim() || '')
const networkText = computed(() => props.show?.network || '')
const ratingText = computed(() => {
  const r = props.show?.rating || 0
  if (r <= 0) return ''

  return r.toFixed(1)
})
const startYearText = computed(() => {
  const premiered = props.show.premiered || ''
  const year = premiered.trim().slice(0, 4)

  return /^\d{4}$/.test(year) ? year : ''
})

async function onToggle() {
  await toggleShowToFavourites(props.show.id)
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.poster {
  width: 200px;
  height: 290px;
  object-fit: cover;
  border-radius: 12px;
  background: var(--bg-light);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);

  &-wrap {
    flex-shrink: 0;
  }
}

.info {
  flex: 1;
  min-width: 280px;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.chip {
  border: 1px solid var(--green);
  color: var(--green);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &-status {
    border-color: var(--border);
    color: var(--text-dim);
    background: rgba(30, 35, 48, 0.6);
  }
}

.title {
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0 0 16px;
  text-wrap: balance;
}

.meta {
  &-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 14px;
    align-items: center;
  }

  &-item {
    font-size: 14px;
    color: var(--text-dim);
    font-weight: 600;
    font-family: var(--font-body);
  }

  &-dim {
    font-size: 13px;
    color: var(--text-dim);
  }
}

.status-pill {
  border: 1px solid var(--border);
  background: rgba(30, 35, 48, 0.6);
  color: var(--text-dim);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body);
  text-transform: capitalize;
}

.my-list {
  border: 1px solid var(--border);
  background: rgba(30, 35, 48, 0.35);
  color: rgba(240, 242, 245, 0.95);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  &.active {
    background: var(--green);
    color: #000;
    border-color: rgba(0, 0, 0, 0.18);
  }

  &-icon {
    line-height: 1;
    font-size: 16px;
  }
}

.rating {
  background: var(--green);
  color: #000;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.star {
  line-height: 1;
}

.desc {
  font-size: 15px;
  color: rgba(240, 242, 245, 0.8);
  line-height: 1.7;
  max-width: 70ch;
  margin: 0;
  text-wrap: pretty;
}

@media (max-width: 700px) {
  .poster {
    width: 180px;
    height: 260px;
  }

  .title {
    font-size: 34px;
  }
}
</style>
