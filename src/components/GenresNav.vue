<template>
  <h2 class="title" v-if="genreList.length">Browse by Genre</h2>
  <div class="row">
    <RouterLink
      v-for="item in genreList"
      :key="item"
      :to="{ name: 'genre', params: { genre: item } }"
      class="chip"
    >
      {{ item }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useShowsStore } from '@/store/shows'

const { genreList } = storeToRefs(useShowsStore())
</script>

<style scoped lang="scss">
.title {
  font-family: var(--font-display);
  font-size: 16px;
  line-height: 1.15;
  margin: 0 0 6px;
  overflow: hidden;
}

.row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  width: 100%;
  padding: 8px 0;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
  & :deep(> *) {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg-light);
  white-space: nowrap;
  transition:
    background 0.12s ease,
    color 0.12s ease,
    border-color 0.12s ease;
  text-transform: capitalize;

  &:hover,
  &:focus-visible {
    background: var(--surface);
    color: var(--text);
  }

  &.router-link-active,
  &.router-link-exact-active {
    background: var(--green-dim);
    border-color: var(--green);
    color: var(--green);
  }
}
</style>
