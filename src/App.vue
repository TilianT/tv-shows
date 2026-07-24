<template>
  <AppHeader />

  <main class="main">
    <RouterView v-slot="{ Component, route }">
      <KeepAlive>
        <component :is="Component" v-if="route.meta?.keepAlive" />
      </KeepAlive>

      <component :is="Component" v-if="!route.meta?.keepAlive" :key="route.fullPath" />
    </RouterView>
  </main>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader/AppHeader.vue'
</script>

<style scoped lang="scss">
.main {
  padding: 24px 48px;
  padding-top: 0;
}

@media (max-width: 700px) {
  .main {
    padding: 16px;
  }
}
</style>
