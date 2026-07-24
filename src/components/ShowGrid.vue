<template>
  <div>
    <div class="title">
      <h1>{{ title }}</h1>
    </div>
    <slot name="action" />
  </div>

  <div v-if="shows.length > 0" class="grid">
    <ShowCard v-for="show in shows" :key="show.id" :show="show" />
    <slot />
  </div>

  <div v-else class="empty">
    <p class="empty-title">The list is empty</p>
  </div>
</template>

<script setup lang="ts">
import ShowCard from '@/components/ShowCard.vue'
import type { Show } from '@/models/show.model'

defineProps<{ title: string; shows: Show[] }>()
</script>

<style scoped lang="scss">
.title {
  padding-bottom: 12px;
  text-transform: capitalize;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(var(--card-w) + 60px), 1fr));
  gap: 22px 18px;
  align-items: start;
}

.empty {
  min-height: calc(100vh - 220px);
  display: grid;
  place-content: center;
  text-align: center;
  gap: 10px;

  &-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
}

@media (max-width: 700px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--card-w) + 36px), 1fr));
    gap: 18px 12px;
  }
}

@media (max-width: 420px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .grid :deep(.link) {
    width: 100%;
  }

  .grid :deep(.card) {
    width: 100%;
    min-width: 0;
    flex: initial;
  }

  .grid :deep(.poster) {
    height: auto;
    aspect-ratio: 2 / 3;
  }
}
</style>
