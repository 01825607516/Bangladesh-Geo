<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  // { id, lat, lon, name, bnName, color, active }
  markers: { type: Array, default: () => [] },
  center: { type: Array, default: () => [23.685, 90.3563] }, // Bangladesh centroid
  zoom: { type: Number, default: 7 },
  fitBounds: { type: Boolean, default: false },
})

const emit = defineEmits(['marker-click'])

const el = ref(null)
let map = null
let resizeObserver = null
const leafletMarkers = []

function markerIcon(color, active) {
  const size = active ? 18 : 11
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color || '#0e4430'};
      border:2px solid ${active ? '#16231d' : '#fbfaf5'};
      box-shadow:0 0 0 1px rgba(22,35,29,0.25);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function render() {
  if (!map) return
  leafletMarkers.forEach((m) => m.remove())
  leafletMarkers.length = 0

  const valid = props.markers.filter((m) => m.lat != null && m.lon != null)

  valid.forEach((m) => {
    const marker = L.marker([m.lat, m.lon], { icon: markerIcon(m.color, m.active) })
      .addTo(map)
      .bindTooltip(`${m.name}${m.bnName ? ' · ' + m.bnName : ''}`, {
        direction: 'top',
        offset: [0, -6],
      })
      .on('click', () => emit('marker-click', m.id))
    leafletMarkers.push(marker)
  })

  if (props.fitBounds && valid.length > 1) {
    map.flyToBounds(
      L.latLngBounds(valid.map((m) => [m.lat, m.lon])),
      { padding: [36, 36], duration: 0.5, maxZoom: 11 }
    )
  } else if (valid.length >= 1) {
    map.flyTo([valid[0].lat, valid[0].lon], props.zoom, { duration: 0.5 })
  } else {
    map.flyTo(props.center, props.zoom, { duration: 0.3 })
  }
}

onMounted(() => {
  map = L.map(el.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView(props.center, props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 6,
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  render()

  // Safety net: re-measure a few times right after mount (common with
  // flex/grid layouts and modals that resolve their real size a tick
  // after first paint), then keep watching with a ResizeObserver.
  requestAnimationFrame(() => map && map.invalidateSize())
  setTimeout(() => map && map.invalidateSize(), 150)
  setTimeout(() => map && map.invalidateSize(), 450)

  resizeObserver = new ResizeObserver(() => {
    if (map) map.invalidateSize()
  })
  resizeObserver.observe(el.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (map) map.remove()
})

watch(() => props.markers, render, { deep: true })
</script>

<template>
  <div ref="el" class="geo-map"></div>
</template>

<style scoped>
.geo-map {
  width: 100%;
  height: 100%;
  min-height: 240px;
  background: #e7e5da;
}

.geo-map :deep(.leaflet-tooltip) {
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink);
  background: var(--paper-raised);
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  box-shadow: none;
}

.geo-map :deep(.leaflet-control-attribution) {
  font-size: 10px;
  background: rgba(251, 250, 245, 0.8);
}
</style>
