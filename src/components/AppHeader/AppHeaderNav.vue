<template>
  <nav class="nav" aria-label="Primary">
    <RouterLink class="link" :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink class="link" :to="{ name: 'favorites' }">My List</RouterLink>
  </nav>
</template>

<style scoped lang="scss">
.nav {
  display: flex;
  gap: 4px;
}

.link {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim);
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--bg-light);
    color: var(--text);
  }

  &.router-link-active,
  &.router-link-exact-active {
    background: var(--surface);
    color: var(--text);
  }
}
</style>
