<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGeoData } from '../composables/useGeoData'
import GeoBreadcrumb from '../components/GeoBreadcrumb.vue'
import DetailModal from '../components/DetailModal.vue'

const props = defineProps({
  divisionId: { type: Number, required: true },
  districtId: { type: Number, required: true },
  upazilaId: { type: Number, required: true },
})

const router = useRouter()
const route = useRoute()
const { getDivision, getDistrict, getUpazila, getUnions } = useGeoData()

const division = computed(() => getDivision(props.divisionId))
const district = computed(() => getDistrict(props.districtId))
const upazila = computed(() => getUpazila(props.upazilaId))

watch(
  [division, district, upazila],
  ([div, dist, upa]) => {
    if (!div) return router.replace({ name: 'divisions' })
    if (!dist || dist.division_id !== div.id) {
      return router.replace({ name: 'districts', params: { divisionId: div.id } })
    }
    if (!upa || upa.district_id !== dist.id) {
      return router.replace({
        name: 'upazilas',
        params: { divisionId: div.id, districtId: dist.id },
      })
    }
  },
  { immediate: true }
)

const unions = computed(() => getUnions(props.upazilaId))

const query = ref('')
const modalItem = ref(null)
const highlightId = ref(route.query.highlight ? Number(route.query.highlight) : null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return unions.value
  return unions.value.filter(
    (u) => u.name.toLowerCase().includes(q) || u.bn_name.includes(query.value.trim())
  )
})

function showDetails(u) {
  modalItem.value = { level: 'union', item: u }
}

onMounted(() => {
  if (!highlightId.value) return
  requestAnimationFrame(() => {
    document.getElementById(`union-${highlightId.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
  setTimeout(() => (highlightId.value = null), 2200)
})
</script>

<template>
  <section v-if="division && district && upazila" class="geo-page">
    <GeoBreadcrumb
      :trail="[
        { label: division.name, to: { name: 'districts', params: { divisionId: division.id } } },
        {
          label: district.name,
          to: { name: 'upazilas', params: { divisionId: division.id, districtId: district.id } },
        },
        { label: upazila.name },
      ]"
    />

    <header class="geo-page-head">
      <div>
        <p class="geo-eyebrow">Step 4 · ধাপ ৪</p>
        <h1 class="geo-title">
          {{ upazila.name }} <span class="en">{{ upazila.bn_name }}</span>
        </h1>
        <p class="geo-sub">The smallest administrative unit of this upazila — its unions. Tap for details.</p>
      </div>
      <div class="geo-search">
        <i class="bi bi-search"></i>
        <input v-model="query" type="text" placeholder="Search unions…" aria-label="Search unions" />
      </div>
    </header>

    <div class="geo-grid">
      <article
        v-for="u in filtered"
        :id="`union-${u.id}`"
        :key="u.id"
        class="geo-card"
        :class="{ 'is-highlighted': highlightId === u.id }"
      >
        <div class="geo-card-top">
          <h3 class="geo-card-name">{{ u.name }}</h3>
            <span class="geo-card-bn">{{ u.bn_name }}</span>
        </div>
        <p v-if="u.url" class="geo-card-link">
          <a :href="'https://' + u.url.replace(/^https?:\/\//, '')" target="_blank" rel="noopener" @click.stop>
            <i class="bi bi-box-arrow-up-right me-1"></i>{{ u.url }}
          </a>
        </p>
        <div class="geo-card-actions">
          <button class="btn-detail" type="button" style="flex: 1" @click="showDetails(u)">
            <i class="bi bi-map"></i> View Details
          </button>
        </div>
      </article>

      <p v-if="!filtered.length" class="geo-empty">No unions found.</p>
    </div>

    <DetailModal
      v-if="modalItem"
      :level="modalItem.level"
      :item="modalItem.item"
      @close="modalItem = null"
    />
  </section>
</template>
