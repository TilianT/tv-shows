<template>
  <div class="page">
    <button class="back" type="button" @click="router.back()">← Back</button>

    <div v-if="isLoading && !show" class="skeleton" aria-hidden="true">
      <div class="hero-bg--skeleton">
        <div class="hero-img--skeleton sk-shimmer" />
        <div class="hero-overlay" />
      </div>

      <div class="content">
        <section class="header-skeleton">
          <div class="poster-skeleton sk-shimmer" />
          <div class="info-skeleton">
            <div class="chips-skeleton">
              <span v-for="i in 3" :key="i" class="chip-skeleton" />
            </div>
            <div class="title-skeleton sk-shimmer" />
            <div class="meta-skeleton">
              <span class="pill-skeleton sk-shimmer" />
              <span class="pill-skeleton sk-shimmer" />
              <span class="text-skeleton sk-shimmer" />
              <span class="text-skeleton short sk-shimmer" />
            </div>
            <div class="btn-skeleton sk-shimmer" />
            <div class="para-skeleton sk-shimmer" />
            <div class="para-skeleton sk-shimmer" />
            <div class="para-skeleton short sk-shimmer" />
          </div>
        </section>

        <section class="cast-section">
          <div class="section-title-skeleton sk-shimmer" />
          <div class="row-skeleton" />
        </section>

        <section class="episodes-section">
          <div class="section-title-skeleton sk-shimmer" />
          <div class="episodes-skeleton">
            <div v-for="i in 4" :key="i" class="ep-skeleton sk-shimmer" />
          </div>
        </section>
      </div>
    </div>

    <p v-else-if="error" class="state error">{{ error }}</p>

    <template v-else>
      <div v-if="show" class="hero-bg" aria-hidden="true">
        <img
          class="hero-img"
          :src="show.image?.original ?? show.image?.default ?? undefined"
          :alt="show.title"
        />
        <div class="hero-overlay" />
      </div>

      <div class="content">
        <ShowDetailsHeader v-if="show" :show="show" />

        <section class="cast-section" v-if="cast.length">
          <h2 class="section-title">Cast</h2>
          <div class="row">
            <CastCard v-for="item in cast" :key="item.id" :cast="item" />
          </div>
        </section>

        <section v-else-if="isLoading" class="cast-section" aria-hidden="true">
          <h2 class="section-title">Cast</h2>
          <div class="row-skeleton" />
        </section>

        <section class="episodes-section" v-if="firstSeasonEpisodes.length">
          <h2 class="section-title">Episodes <span class="section-sub">(first season)</span></h2>

          <div class="episodes">
            <article v-for="ep in firstSeasonEpisodes" :key="ep.id" class="ep-item">
              <div class="ep-num">{{ epNumber(ep) }}</div>
              <div class="ep-body">
                <p class="ep-name">{{ ep.name }}</p>
                <p v-if="ep.description" class="ep-desc">{{ ep.description }}</p>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="isLoading" class="episodes-section" aria-hidden="true">
          <h2 class="section-title">Episodes <span class="section-sub">(first season)</span></h2>
          <div class="episodes-skeleton">
            <div v-for="i in 4" :key="i" class="ep-skeleton" />
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useShowsStore } from '@/store/shows'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CastCard from '@/components/CastCard.vue'
import ShowDetailsHeader from '@/components/ShowDetailsHeader.vue'

import type { Show } from '@/models/show.model'
import type { CastMember } from '@/models/cast.model'
import type { Episode } from '@/models/episode.model'

const showsStore = useShowsStore()
const router = useRouter()

const props = defineProps<{ id: number }>()

const show = ref<Show | null>(null)
const cast = ref<CastMember[]>([])
const episodes = ref<Episode[]>([])

const isLoading = computed(() => showsStore.isLoading)
const error = computed(() => showsStore.error)

const firstSeasonEpisodes = computed(() => episodes.value.filter((e) => e.season === 1))

function epNumber(ep: Episode): string {
  const n = ep.number || '-'
  return `E${n}`
}

onMounted(async () => {
  show.value = await showsStore.getShowDetails(props.id)

  const [castResp, episodesResp] = await Promise.all([
    showsStore.getShowCast(props.id),
    showsStore.getShowEpisodes(props.id),
  ])
  cast.value = castResp
  episodes.value = episodesResp

  if (show.value) {
    showsStore.recordRecentlyViewed(show.value)
  }

  document.title = show.value ? `${show.value.title} - TV Explorer` : 'TV Explorer'
})

onUnmounted(() => {
  document.title = 'TV Explorer'
})
</script>

<style scoped lang="scss">
.page {
  position: relative;
}

.back {
  position: fixed;
  top: 72px;
  left: 24px;
  z-index: 110;
  background: rgba(10, 12, 15, 0.85);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.hero {
  &-bg,
  &-bg--skeleton {
    position: relative;
    height: 400px;
    overflow: hidden;
    margin: 0 -48px;
  }

  &-bg--skeleton {
    background: var(--bg-light);
  }

  &-img,
  &-img--skeleton {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    filter: blur(2px) brightness(0.4);
  }

  &-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--bg) 30%, transparent 100%);
  }
}
.content {
  padding: 0 0 80px;
  margin-top: -300px;
  position: relative;
}

.state {
  color: var(--text-dim);
}

.error {
  color: var(--text);
}

.skeleton {
  position: relative;
}

.header-skeleton {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.poster-skeleton {
  width: 200px;
  height: 290px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.info-skeleton {
  flex: 1;
  min-width: 280px;
}

.chips-skeleton {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.chip-skeleton {
  width: 84px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: rgba(30, 35, 48, 0.25);
}

.title-skeleton {
  height: 46px;
  width: min(520px, 92%);
}

.meta-skeleton {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 14px;
}

.pill-skeleton {
  width: 78px;
  height: 28px;
  border-radius: 8px;
}

.text-skeleton {
  width: 70px;
  height: 14px;
  border-radius: 8px;
  opacity: 0.6;
}

.text-skeleton.short {
  width: 46px;
}

.btn-skeleton {
  width: 200px;
  height: 40px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.para-skeleton {
  height: 14px;
  width: min(70ch, 92%);
  border-radius: 8px;
  margin-top: 10px;
  opacity: 0.55;
}

.para-skeleton.short {
  width: min(46ch, 75%);
}

.section-title-skeleton {
  height: 22px;
  width: 140px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.episodes-skeleton {
  display: grid;
  gap: 14px;
}

.ep-skeleton {
  height: 86px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  opacity: 0.7;
}

.section-title {
  font-family: var(--font-display);
  margin-bottom: 10px;
}

.section-sub {
  color: var(--text-dim);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
}

.cast-section {
  margin-top: 56px;
}

.episodes-section {
  margin-top: 56px;
}

.episodes {
  display: grid;
  gap: 14px;
}

.ep-item {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(30, 35, 48, 0.28);
}

.ep-num {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--green);
  letter-spacing: -0.01em;
}

.ep-body {
  min-width: 0;
}

.ep-name {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
  line-height: 1.25;
}

.ep-desc {
  margin: 8px 0 0;
  color: rgba(240, 242, 245, 0.8);
  line-height: 1.65;
  font-size: 13px;
}

@media (max-width: 700px) {
  .back {
    left: 12px;
    top: 116px;
  }

  .hero-bg,
  .hero-bg--skeleton {
    margin: 0 -16px;
    height: 320px;
  }

  .content {
    margin-top: -240px;
  }

  .ep-item {
    grid-template-columns: 46px 1fr;
    gap: 12px;
  }
}
</style>
