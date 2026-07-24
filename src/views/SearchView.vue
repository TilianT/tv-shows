<template>
  <section class="page-grid">
    <div v-if="isLoading" class="skeleton" aria-hidden="true">
      <div class="title-skeleton sk-shimmer" />
      <div class="grid-skeleton">
        <div v-for="i in 12" :key="i" class="card-skeleton">
          <div class="card-skeleton__poster sk-shimmer" />
          <div class="card-skeleton__title sk-shimmer" />
          <div class="card-skeleton__meta sk-shimmer" />
        </div>
      </div>
    </div>
    <ShowGrid v-else title="Search Results" :shows="searchList" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useShowsSearchStore } from '@/store/shows.search'
import ShowGrid from '@/components/ShowGrid.vue'

const { searchList, isLoading } = storeToRefs(useShowsSearchStore())
</script>
