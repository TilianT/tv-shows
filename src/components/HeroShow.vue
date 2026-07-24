<template>
  <Transition name="hero-fade" mode="out-in">
    <RouterLink
      v-if="heroShow"
      :key="heroShow.id"
      class="hero"
      :to="{ name: 'details', params: { id: heroShow.id } }"
      aria-label="View featured show details"
    >
      <img
        class="hero-img"
        :src="heroShow.image.original ?? heroShow.image.default ?? undefined"
        :alt="heroShow.title"
        decoding="async"
        fetchpriority="high"
      />

      <div class="hero-overlay" />

      <div class="hero-content">
        <div class="hero-genres">
          <span v-for="item in heroShow.genres.slice(0, 3)" :key="item" class="chip">
            {{ item }}
          </span>
        </div>

        <h1 class="hero-title">{{ heroShow.title }}</h1>

        <div v-if="heroRatingText || heroNetworkText" class="hero-badges">
          <span v-if="heroRatingText" class="hero-rating" aria-label="Rating">
            <span class="hero-star" aria-hidden="true">★</span>
            {{ heroRatingText }}
          </span>
          <span v-if="heroNetworkText" class="hero-network">{{ heroNetworkText }}</span>
        </div>

        <p v-if="heroSummary" class="hero-desc">{{ heroSummary }}</p>

        <span class="hero-cta">View Details →</span>
      </div>
    </RouterLink>

    <div v-else-if="isLoading" key="hero-skeleton" class="hero hero--skeleton" aria-hidden="true">
      <div class="hero-img--skeleton sk-shimmer" />
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-genres">
          <span v-for="i in 3" :key="i" class="chip--skeleton" />
        </div>
        <div class="hero-title--skeleton sk-shimmer" />
        <div class="hero-badges">
          <span class="hero-rating--skeleton sk-shimmer" />
          <span class="hero-network--skeleton sk-shimmer" />
        </div>
        <div class="hero-desc--skeleton sk-shimmer" />
        <div class="hero-desc--skeleton short sk-shimmer" />
        <div class="hero-cta--skeleton sk-shimmer" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Show } from '@/models/show.model'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type GenreEntries = Array<[string, Show[]]>

const props = defineProps<{ entries: GenreEntries; isLoading: boolean }>()

const heroShow = ref<Show | null>(null)

const heroSummary = computed(() => {
  const description = heroShow.value?.description || ''
  if (description.length <= 200) return description
  return `${description.slice(0, 200)}…`
})

const heroRatingText = computed(() => {
  const r = heroShow.value?.rating || 0
  if (r <= 0) return ''

  return r.toFixed(1)
})

const heroNetworkText = computed(() => heroShow.value?.network || '')

const allShows = computed(() => props.entries.flatMap(([, shows]) => shows))

function pickRandomHero() {
  const list = allShows.value
  if (list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)] ?? null
}

let heroTimer: number | null = null

function startTimer() {
  if (heroTimer !== null) return
  heroTimer = window.setInterval(() => {
    const next = pickRandomHero()
    if (next) heroShow.value = next
  }, 5000)
}

function stopTimer() {
  if (heroTimer === null) return
  window.clearInterval(heroTimer)
  heroTimer = null
}

watch(
  () => allShows.value.length,
  (len) => {
    if (len === 0) {
      heroShow.value = null
      stopTimer()
      return
    }

    if (!heroShow.value) {
      heroShow.value = pickRandomHero()
    }

    startTimer()
  },
  { immediate: true },
)

onBeforeUnmount(() => stopTimer())
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  height: 460px;
  margin: 0 -48px 32px;
  overflow: hidden;
  display: block;
  border-bottom: 0;
  text-decoration: none;
  color: inherit;
  background: #000;

  &-content {
    position: absolute;
    left: 48px;
    bottom: 60px;
    max-width: 520px;
  }
  &-genres {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  &-title {
    font-family: var(--font-display);
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    margin: 0 0 10px;
    text-wrap: balance;

    &--skeleton {
      height: 56px;
      width: min(460px, 90%);
      border-radius: 12px;
      margin: 0 0 10px;
    }
  }

  &-badges {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  &-rating {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 10px;
    background: var(--green);
    color: #000;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: -0.01em;

    &--skeleton {
      width: 78px;
      height: 32px;
      border-radius: 10px;
      color: transparent;
    }
  }

  &-star {
    line-height: 1;
  }

  &-network {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(30, 35, 48, 0.45);
    color: rgba(240, 242, 245, 0.8);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-body);

    &--skeleton {
      width: 64px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid transparent;
      color: transparent;
    }
  }

  &-desc {
    font-size: 14px;
    color: rgba(240, 242, 245, 0.8);
    line-height: 1.65;
    margin: 0;

    &--skeleton {
      height: 14px;
      width: min(520px, 95%);
      border-radius: 8px;
      margin-top: 10px;
      opacity: 0.65;

      &.short {
        width: min(380px, 80%);
      }
    }
  }

  &-cta {
    display: inline-flex;
    margin-top: 18px;
    background: var(--green);
    color: #000;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 700;
    font-family: var(--font-display);
    letter-spacing: 0.02em;

    &--skeleton {
      width: 180px;
      height: 44px;
      border-radius: 8px;
      margin-top: 18px;
    }
  }

  &-img,
  &-img--skeleton {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    background: var(--bg-light);
  }

  &--skeleton {
    pointer-events: none;
  }

  &-overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        140% 75% at 50% 100%,
        rgba(10, 12, 15, 1) 0%,
        rgba(10, 12, 15, 0.9) 24%,
        rgba(10, 12, 15, 0.55) 52%,
        rgba(10, 12, 15, 0) 78%
      ),
      linear-gradient(
        to top,
        rgba(10, 12, 15, 0.95) 0%,
        rgba(10, 12, 15, 0.65) 22%,
        rgba(10, 12, 15, 0) 70%
      ),
      linear-gradient(
        to right,
        rgba(10, 12, 15, 0.88) 24%,
        rgba(10, 12, 15, 0.35) 62%,
        rgba(10, 12, 15, 0.08) 86%,
        transparent 100%
      );
  }
}

.chip,
.chip--skeleton {
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: uppercase;
}

.chip {
  border: 1px solid var(--green);
  color: var(--green);
  letter-spacing: 0.06em;

  &--skeleton {
    width: 80px;
    height: 22px;
    border: 1px solid var(--border);
    background: rgba(30, 35, 48, 0.25);
    color: transparent;
    letter-spacing: 0;
  }
}

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 520ms ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

@media (max-width: 500px) {
  .hero-desc {
    display: none;
  }
}

@media (max-width: 700px) {
  .hero {
    height: 340px;
    margin: 0 -16px 22px;

    &-title {
      font-size: 34px;
    }

    &-content {
      left: 16px;
      right: 16px;
      bottom: 28px;
      max-width: none;
    }
  }
}
</style>
