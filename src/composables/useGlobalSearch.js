import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGeoData } from './useGeoData'

/**
 * One shared search box for the whole app: type a name and get matches
 * across all four levels (division / district / upazila / union), each
 * tagged with its full breadcrumb path so results are unambiguous.
 */
export function useGlobalSearch() {
  const router = useRouter()
  const { divisionsData, districtsData, upazilasData, unionsData, getDivision, getDistrict, getUpazila } =
    useGeoData()

  const query = ref('')
  const activeIndex = ref(-1)

  const results = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return []
    const out = []

    for (const d of divisionsData) {
      if (d.name.toLowerCase().includes(q) || d.bn_name.includes(query.value.trim())) {
        out.push({ level: 'division', item: d, path: d.name })
      }
    }
    for (const d of districtsData) {
      if (d.name.toLowerCase().includes(q) || d.bn_name.includes(query.value.trim())) {
        const div = getDivision(d.division_id)
        out.push({ level: 'district', item: d, path: `${div?.name} › ${d.name}` })
      }
    }
    for (const u of upazilasData) {
      if (u.name.toLowerCase().includes(q) || u.bn_name.includes(query.value.trim())) {
        const d = getDistrict(u.district_id)
        const div = d ? getDivision(d.division_id) : null
        out.push({ level: 'upazila', item: u, path: `${div?.name} › ${d?.name} › ${u.name}` })
      }
    }
    if (out.length < 40) {
      for (const u of unionsData) {
        if (u.name.toLowerCase().includes(q) || u.bn_name.includes(query.value.trim())) {
          const upa = getUpazila(u.upazila_id)
          const d = upa ? getDistrict(upa.district_id) : null
          const div = d ? getDivision(d.division_id) : null
          out.push({
            level: 'union',
            item: u,
            path: `${div?.name} › ${d?.name} › ${upa?.name} › ${u.name}`,
          })
          if (out.length >= 60) break
        }
      }
    }
    return out.slice(0, 60)
  })

  watch([query, results], () => {
    activeIndex.value = -1
  })

  function clear() {
    query.value = ''
    activeIndex.value = -1
  }

  function pickResult(r) {
    clear()
    const { level, item } = r

    if (level === 'division') {
      router.push({ name: 'divisions', query: { highlight: item.id } })
    } else if (level === 'district') {
      router.push({
        name: 'districts',
        params: { divisionId: item.division_id },
        query: { highlight: item.id },
      })
    } else if (level === 'upazila') {
      const d = getDistrict(item.district_id)
      router.push({
        name: 'upazilas',
        params: { divisionId: d?.division_id, districtId: item.district_id },
        query: { highlight: item.id },
      })
    } else if (level === 'union') {
      const upa = getUpazila(item.upazila_id)
      const d = upa ? getDistrict(upa.district_id) : null
      router.push({
        name: 'unions',
        params: { divisionId: d?.division_id, districtId: upa?.district_id, upazilaId: item.upazila_id },
        query: { highlight: item.id },
      })
    }
  }

  function moveActive(dir) {
    if (!results.value.length) return
    const n = results.value.length
    activeIndex.value = (activeIndex.value + dir + n) % n
  }

  function chooseActive() {
    if (activeIndex.value >= 0) pickResult(results.value[activeIndex.value])
  }

  return { query, results, activeIndex, pickResult, clear, moveActive, chooseActive }
}
