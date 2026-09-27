<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGeoData } from '../composables/useGeoData'
import GeoBreadcrumb from '../components/GeoBreadcrumb.vue'
import DetailModal from '../components/DetailModal.vue'

const props = defineProps({
  divisionId: { type: Number, required: true },
})

const router = useRouter()
const route = useRoute()
const { getDivision, getDistricts, getUpazilas } = useGeoData()

const division = computed(() => getDivision(props.divisionId))

// invalid /divisions/:id in the URL — send them back to a valid page
watch(
  division,
  (d) => {
    if (!d) router.replace({ name: 'divisions' })
  },
  { immediate: true }
)

const districts = computed(() => getDistricts(props.divisionId))

const query = ref('')
const modalItem = ref(null)
const highlightId = ref(route.query.highlight ? Number(route.query.highlight) : null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return districts.value
  return districts.value.filter(
    (d) => d.name.toLowerCase().includes(q) || d.bn_name.includes(query.value.trim())
  )
})

function explore(d) {
  router.push({ name: 'upazilas', params: { divisionId: props.divisionId, districtId: d.id } })
}
function showDetails(d) {
  modalItem.value = { level: 'district', item: d }
}

onMounted(() => {
  if (!highlightId.value) return
  requestAnimationFrame(() => {
    document.getElementById(`district-${highlightId.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
  setTimeout(() => (highlightId.value = null), 2200)
})
</script>

<template>
  <section v-if="division" class="geo-page">
    <GeoBreadcrumb :trail="[{ label: division.name }]" />

    <header class="geo-page-head">
      <div>
        <p class="geo-eyebrow">Step 2 · ধাপ ২</p>
        <h1 class="geo-title">
          {{ division.name }} <span class="en">{{ division.bn_name }}</span>
        </h1>
        <p class="geo-sub">Choose a district in this division to see its upazilas, or view it on the map.</p>
      </div>
      <div class="geo-search">
        <i class="bi bi-search"></i>
        <input v-model="query" type="text" placeholder="Search districts…" aria-label="Search districts" />
      </div>
    </header>

    <div class="geo-grid">
      <article
        v-for="d in filtered"
        :id="`district-${d.id}`"
        :key="d.id"
        class="geo-card"
        :class="{ 'is-highlighted': highlightId === d.id }"
      >
        <div class="geo-card-top">
          <h3 class="geo-card-name">{{ d.name }}</h3>
            <span class="geo-card-bn">{{ d.bn_name }}</span>
        </div>
        <p class="geo-card-stat"><i class="bi bi-signpost-split"></i>{{ getUpazilas(d.id).length }} Upazilas</p>
        <p v-if="d.url" class="geo-card-link">
          <a :href="'https://' + d.url.replace(/^https?:\/\//, '')" target="_blank" rel="noopener" @click.stop>
            <i class="bi bi-box-arrow-up-right me-1"></i>{{ d.url }}
          </a>
        </p>
        <div class="geo-card-actions">
          <button class="btn-explore" type="button" @click="explore(d)">
            Upazilas <i class="bi bi-arrow-right"></i>
          </button>
          <button class="btn-detail" type="button" @click="showDetails(d)">
            <i class="bi bi-map"></i> Details
          </button>
        </div>
      </article>

      <p v-if="!filtered.length" class="geo-empty">No districts found.</p>
    </div>

    <DetailModal
      v-if="modalItem"
      :level="modalItem.level"
      :item="modalItem.item"
      @close="modalItem = null"
    />
  </section>
</template>
