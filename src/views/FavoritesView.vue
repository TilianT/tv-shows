<template>
  <section class="page-grid">
    <ShowGrid title="My List" :shows="favouritesShowList" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useShowsStore } from '@/store/shows'
import ShowGrid from '@/components/ShowGrid.vue'

const { favouritesShowList } = storeToRefs(useShowsStore())
</script>
