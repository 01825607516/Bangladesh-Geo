<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useGeoData } from '../composables/useGeoData'
import GeoMap from './GeoMap.vue'

const props = defineProps({
  level: { type: String, required: true }, // 'division' | 'district' | 'upazila' | 'union'
  item: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const { divisionColors, getDivision, getDistrict, getUpazila, getDistricts, getUpazilas, getUnions } =
  useGeoData()

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const info = computed(() => {
  const it = props.item

  if (props.level === 'division') {
    return {
      kind: 'Division · বিভাগ',
      name: it.name,
      bn: it.bn_name,
      url: it.url,
      crumbs: [it.name],
      stat: `${getDistricts(it.id).length} Districts`,
      color: divisionColors[it.id],
      parentDistrict: null,
    }
  }

  if (props.level === 'district') {
    const div = getDivision(it.division_id)
    return {
      kind: 'District · জেলা',
      name: it.name,
      bn: it.bn_name,
      url: it.url,
      crumbs: [div?.name, it.name].filter(Boolean),
      stat: `${getUpazilas(it.id).length} Upazilas`,
      coords: it.lat != null ? `${it.lat.toFixed(4)}, ${it.lon.toFixed(4)}` : null,
      color: div ? divisionColors[div.id] : null,
      parentDistrict: it,
    }
  }

  if (props.level === 'upazila') {
    const d = getDistrict(it.district_id)
    const div = d ? getDivision(d.division_id) : null
    return {
      kind: 'Upazila · উপজেলা',
      name: it.name,
      bn: it.bn_name,
      url: it.url,
      crumbs: [div?.name, d?.name, it.name].filter(Boolean),
      stat: `${getUnions(it.id).length} Unions`,
      color: div ? divisionColors[div.id] : null,
      parentDistrict: d,
    }
  }

  // union
  const upa = getUpazila(it.upazila_id)
  const d = upa ? getDistrict(upa.district_id) : null
  const div = d ? getDivision(d.division_id) : null
  return {
    kind: 'Union · ইউনিয়ন',
    name: it.name,
    bn: it.bn_name,
    url: it.url,
    crumbs: [div?.name, d?.name, upa?.name, it.name].filter(Boolean),
    stat: null,
    color: div ? divisionColors[div.id] : null,
    parentDistrict: d,
  }
})

const isApproximate = computed(() => props.level === 'upazila' || props.level === 'union')

const markers = computed(() => {
  const it = props.item

  if (props.level === 'division') {
    return getDistricts(it.id)
      .filter((d) => d.lat != null)
      .map((d) => ({
        id: d.id,
        lat: d.lat,
        lon: d.lon,
        name: d.name,
        bnName: d.bn_name,
        color: info.value.color,
      }))
  }

  if (props.level === 'district') {
    if (it.lat == null) return []
    return [
      { id: it.id, lat: it.lat, lon: it.lon, name: it.name, bnName: it.bn_name, color: info.value.color, active: true },
    ]
  }

  // upazila / union: no coordinates of their own — show the parent district
  // as an approximate area marker instead of hiding the map entirely.
  const d = info.value.parentDistrict
  if (!d || d.lat == null) return []
  return [
    { id: d.id, lat: d.lat, lon: d.lon, name: it.name, bnName: it.bn_name, color: info.value.color, active: true },
  ]
})

const fitBounds = computed(() => props.level === 'division')
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-card" role="dialog" aria-modal="true" :aria-label="info.name">
        <button class="modal-close" type="button" @click="emit('close')" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="modal-body">
          <div class="modal-info">
            <p class="detail-kind">{{ info.kind }}</p>
            <h3 class="detail-name">{{ info.name }}</h3>
            <p class="detail-crumbs">
              <i class="bi bi-signpost-2 me-1"></i>{{ info.crumbs.join(' › ') }}
            </p>

            <dl class="detail-fields">
              <div class="detail-field">
                <dt>Bengali Name</dt>
                <dd>{{ info.bn }}</dd>
              </div>
              <div v-if="info.url" class="detail-field">
                <dt>Website</dt>
                <dd>
                  <a
                    class="meta-link"
                    :href="'https://' + info.url.replace(/^https?:\/\//, '')"
                    target="_blank"
                    rel="noopener"
                  >
                    <i class="bi bi-box-arrow-up-right me-1"></i>{{ info.url }}
                  </a>
                </dd>
              </div>
              <div v-if="info.coords" class="detail-field">
                <dt>Coordinates</dt>
                <dd>{{ info.coords }}</dd>
              </div>
            </dl>

            <div class="detail-meta">
              <span v-if="info.stat" class="meta-pill"><i class="bi bi-collection me-1"></i>{{ info.stat }}</span>
            </div>

            <p v-if="isApproximate && markers.length" class="approx-note">
              <i class="bi bi-info-circle me-1"></i>
              Exact coordinates aren't available at this level — the parent district's centre is shown on the map as an approximation.
            </p>
            <p v-if="!markers.length" class="approx-note">
              <i class="bi bi-info-circle me-1"></i>No map data is available for this entry.
            </p>

            <button class="btn-back-modal" type="button" @click="emit('close')">
              <i class="bi bi-arrow-left"></i> Back
            </button>
          </div>

          <div class="modal-map">
            <GeoMap v-if="markers.length" :markers="markers" :fit-bounds="fitBounds" :zoom="10" />
            <div v-else class="map-empty"><i class="bi bi-map"></i></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
