<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useGeoData, totals } from '../composables/useGeoData'
import { useGlobalSearch } from '../composables/useGlobalSearch'
import DetailModal from '../components/DetailModal.vue'

const route = useRoute()
const { divisionsData, getDistricts } = useGeoData()

const { query, results, activeIndex, pickResult, clear, moveActive, chooseActive } = useGlobalSearch()

const searchWrap = ref(null)
const searchInput = ref(null)
const resultsList = ref(null)

const modalItem = ref(null)
const highlightId = ref(route.query.highlight ? Number(route.query.highlight) : null)

function showDetails(d) {
  modalItem.value = { level: 'division', item: d }
}

function scrollActiveIntoView() {
  nextTick(() => {
    resultsList.value?.querySelector('.search-row.is-active')?.scrollIntoView({ block: 'nearest' })
  })
}

function onSearchKeydown(e) {
  if (!results.value.length) {
    if (e.key === 'Escape') clear()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveActive(1)
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveActive(-1)
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    if (activeIndex.value >= 0) {
      e.preventDefault()
      chooseActive()
    }
  } else if (e.key === 'Escape') {
    clear()
    searchInput.value?.blur()
  }
}

function onDocumentClick(e) {
  if (query.value && searchWrap.value && !searchWrap.value.contains(e.target)) clear()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)

  if (!highlightId.value) return
  requestAnimationFrame(() => {
    document.getElementById(`division-${highlightId.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
  setTimeout(() => (highlightId.value = null), 2200)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div>
    <!-- ============ hero ============ -->
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">বাংলাদেশ জিও রেজিস্ট্রি</p>
        <h1 class="hero-title">Find any place in Bangladesh</h1>
        <p class="hero-sub">
          Search across every division, district, upazila and union — or browse the hierarchy below.
        </p>

        <div class="hero-search" ref="searchWrap">
          <div class="hero-search-box">
            <i class="bi bi-search"></i>
            <input
              v-model="query"
              ref="searchInput"
              type="text"
              placeholder="Search divisions, districts, upazilas or unions…"
              aria-label="Search"
              role="combobox"
              :aria-expanded="query.trim() ? 'true' : 'false'"
              aria-controls="hero-search-results"
              autocomplete="off"
              @keydown="onSearchKeydown"
            />
            <button v-if="query" type="button" class="hero-search-clear" @click="clear" aria-label="Clear search">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <Transition name="fade-slide">
            <ul
              v-if="query.trim()"
              id="hero-search-results"
              ref="resultsList"
              class="hero-results"
              role="listbox"
            >
              <li v-if="!results.length" class="hero-results-empty">
                <i class="bi bi-emoji-neutral me-2"></i>No results found.
              </li>
              <li
                v-for="(r, i) in results"
                :key="r.level + '-' + r.item.id"
                class="search-row"
                :class="{ 'is-active': i === activeIndex }"
                role="option"
                :aria-selected="i === activeIndex"
                @click="pickResult(r)"
                @mouseenter="activeIndex = i"
              >
                <span class="search-level" :class="'lvl-' + r.level">{{ r.level }}</span>
                <span class="search-path">{{ r.path }}</span>
                <span class="search-bn">{{ r.item.bn_name }}</span>
              </li>
            </ul>
          </Transition>
        </div>

        <ul class="hero-stats list-unstyled d-flex flex-wrap justify-content-center mb-0">
          <li><span class="hero-stat-num">{{ totals.divisions }}</span><span class="hero-stat-label">Divisions</span></li>
          <li><span class="hero-stat-num">{{ totals.districts }}</span><span class="hero-stat-label">Districts</span></li>
          <li><span class="hero-stat-num">{{ totals.upazilas }}</span><span class="hero-stat-label">Upazilas</span></li>
          <li><span class="hero-stat-num">{{ totals.unions.toLocaleString('en-US') }}</span><span class="hero-stat-label">Unions</span></li>
        </ul>
      </div>
    </section>

    <!-- ============ divisions grid ============ -->
    <section class="geo-page">
      <header class="geo-section-head">
        <h2 class="geo-section-title">Browse by division</h2>
        <p class="geo-sub mb-0">Pick a division to drill down into its districts.</p>
      </header>

      <div class="geo-grid">
        <article
          v-for="d in divisionsData"
          :id="`division-${d.id}`"
          :key="d.id"
          class="geo-card"
          :class="{ 'is-highlighted': highlightId === d.id }"
        >
          <div class="geo-card-top">
            <h3 class="geo-card-name">{{ d.name }}</h3>
            <span class="geo-card-bn">{{ d.bn_name }}</span>
          </div>
          <p class="geo-card-stat"><i class="bi bi-signpost-split"></i>{{ getDistricts(d.id).length }} Districts</p>
          <p v-if="d.url" class="geo-card-link">
            <a :href="'https://' + d.url.replace(/^https?:\/\//, '')" target="_blank" rel="noopener" @click.stop>
              <i class="bi bi-box-arrow-up-right me-1"></i>{{ d.url }}
            </a>
          </p>
          <div class="geo-card-actions">
            <RouterLink class="btn-explore" :to="{ name: 'districts', params: { divisionId: d.id } }">
              Districts <i class="bi bi-arrow-right"></i>
            </RouterLink>
            <button class="btn-detail" type="button" @click="showDetails(d)">
              <i class="bi bi-map"></i> Details
            </button>
          </div>
        </article>
      </div>
    </section>

    <DetailModal
      v-if="modalItem"
      :level="modalItem.level"
      :item="modalItem.item"
      @close="modalItem = null"
    />
  </div>
</template>
