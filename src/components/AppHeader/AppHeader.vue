<template>
  <header class="header">
    <RouterLink class="logo" :to="{ name: 'home' }" aria-label="Home">
      <span class="mark">TVE</span>
    </RouterLink>

    <AppHeaderNav />

    <div class="search">
      <AppHeaderSearch />
    </div>
  </header>
</template>

<script setup lang="ts">
import AppHeaderNav from './AppHeaderNav.vue'
import AppHeaderSearch from './AppHeaderSearch.vue'
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
  padding: 0 48px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 12, 15, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.logo {
  text-decoration: none;
}

.mark {
  padding: 2px 14px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  color: #000;
  background: linear-gradient(135deg, var(--green), rgba(0, 207, 114, 0.55));
}

.search {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 700px) {
  .header {
    padding: 10px 16px;
    gap: 12px;
    height: auto;
    flex-wrap: wrap;
  }

  .search {
    flex: 1 0 100%;
    justify-content: stretch;
  }
}
</style>
