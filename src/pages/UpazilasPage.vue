<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGeoData } from '../composables/useGeoData'
import GeoBreadcrumb from '../components/GeoBreadcrumb.vue'
import DetailModal from '../components/DetailModal.vue'

const props = defineProps({
  divisionId: { type: Number, required: true },
  districtId: { type: Number, required: true },
})

const router = useRouter()
const route = useRoute()
const { getDivision, getDistrict, getUpazilas, getUnions } = useGeoData()

const division = computed(() => getDivision(props.divisionId))
const district = computed(() => getDistrict(props.districtId))

watch(
  [division, district],
  ([div, dist]) => {
    if (!div) return router.replace({ name: 'divisions' })
    if (!dist || dist.division_id !== div.id) {
      return router.replace({ name: 'districts', params: { divisionId: div.id } })
    }
  },
  { immediate: true }
)

const upazilas = computed(() => getUpazilas(props.districtId))

const query = ref('')
const modalItem = ref(null)
const highlightId = ref(route.query.highlight ? Number(route.query.highlight) : null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return upazilas.value
  return upazilas.value.filter(
    (u) => u.name.toLowerCase().includes(q) || u.bn_name.includes(query.value.trim())
  )
})

function explore(u) {
  router.push({
    name: 'unions',
    params: { divisionId: props.divisionId, districtId: props.districtId, upazilaId: u.id },
  })
}
function showDetails(u) {
  modalItem.value = { level: 'upazila', item: u }
}

onMounted(() => {
  if (!highlightId.value) return
  requestAnimationFrame(() => {
    document.getElementById(`upazila-${highlightId.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
  setTimeout(() => (highlightId.value = null), 2200)
})
</script>

<template>
  <section v-if="division && district" class="geo-page">
    <GeoBreadcrumb
      :trail="[
        { label: division.name, to: { name: 'districts', params: { divisionId: division.id } } },
        { label: district.name },
      ]"
    />

    <header class="geo-page-head">
      <div>
        <p class="geo-eyebrow">Step 3 · ধাপ ৩</p>
        <h1 class="geo-title">
          {{ district.name }} <span class="en">{{ district.bn_name }}</span>
        </h1>
        <p class="geo-sub">Choose an upazila in this district to see its unions, or view details.</p>
      </div>
      <div class="geo-search">
        <i class="bi bi-search"></i>
        <input v-model="query" type="text" placeholder="Search upazilas…" aria-label="Search upazilas" />
      </div>
    </header>

    <div class="geo-grid">
      <article
        v-for="u in filtered"
        :id="`upazila-${u.id}`"
        :key="u.id"
        class="geo-card"
        :class="{ 'is-highlighted': highlightId === u.id }"
      >
        <div class="geo-card-top">
          <h3 class="geo-card-name">{{ u.name }}</h3>
            <span class="geo-card-bn">{{ u.bn_name }}</span>
        </div>
        <p class="geo-card-stat"><i class="bi bi-signpost-split"></i>{{ getUnions(u.id).length }} Unions</p>
        <p v-if="u.url" class="geo-card-link">
          <a :href="'https://' + u.url.replace(/^https?:\/\//, '')" target="_blank" rel="noopener" @click.stop>
            <i class="bi bi-box-arrow-up-right me-1"></i>{{ u.url }}
          </a>
        </p>
        <div class="geo-card-actions">
          <button class="btn-explore" type="button" @click="explore(u)">
            Unions <i class="bi bi-arrow-right"></i>
          </button>
          <button class="btn-detail" type="button" @click="showDetails(u)">
            <i class="bi bi-map"></i> Details
          </button>
        </div>
      </article>

      <p v-if="!filtered.length" class="geo-empty">No upazilas found.</p>
    </div>

    <DetailModal
      v-if="modalItem"
      :level="modalItem.level"
      :item="modalItem.item"
      @close="modalItem = null"
    />
  </section>
</template>
