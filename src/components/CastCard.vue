<template>
  <article class="card">
    <img class="poster" :src="cast.image || fallbackPosterUrl" :alt="cast.name" loading="lazy" />

    <div class="content">
      <h3 class="title">{{ cast.name }}</h3>
      <p v-if="cast.characterName" class="meta">{{ cast.characterName }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import fallbackPosterUrl from '@/assets/images/fallback.png'

import type { CastMember } from '@/models/cast.model'

defineProps<{ cast: CastMember }>()
</script>

<style scoped lang="scss">
.card {
  width: calc(var(--card-w) - 40px);
  min-width: calc(var(--card-w) - 40px);
  flex: 0 0 calc(var(--card-w) - 40px);
  background: transparent;
  border: 0;
}

.poster {
  width: 100%;
  height: calc(var(--card-h) - 60px);
  object-fit: cover;
  object-position: top;
  background: var(--bg-light);
  border-radius: calc(var(--radius) + 10px);
  border: 1px solid var(--border);
}

.content {
  padding: 10px 2px 0;
}

.title {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 6px;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  font-size: 14px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}
</style>
