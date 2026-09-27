<script setup>
import { useRouter } from 'vue-router'

defineProps({
  // [{ label, bn, to }] — last item has no `to` (current page)
  trail: { type: Array, required: true },
})

const router = useRouter()
function goBack() {
  router.back()
}
</script>

<template>
  <div class="geo-breadcrumb-row">
    <button class="btn-back" type="button" @click="goBack" aria-label="Go back">
      <i class="bi bi-arrow-left"></i> Back
    </button>
    <nav class="geo-breadcrumb" aria-label="breadcrumb">
      <RouterLink to="/divisions"><i class="bi bi-house-door me-1"></i>Divisions</RouterLink>
      <template v-for="(crumb, i) in trail" :key="i">
        <span class="sep"><i class="bi bi-chevron-right"></i></span>
        <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
        <span v-else class="current">{{ crumb.label }}</span>
      </template>
    </nav>
  </div>
</template>

<style scoped>
.geo-breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}
.btn-back {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
  color: var(--forest-deep);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-back:hover {
  background: #eae7d8;
}
</style>
