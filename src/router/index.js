import { createRouter, createWebHistory } from 'vue-router'
import DivisionsPage from '../pages/DivisionsPage.vue'
import DistrictsPage from '../pages/DistrictsPage.vue'
import UpazilasPage from '../pages/UpazilasPage.vue'
import UnionsPage from '../pages/UnionsPage.vue'
import { useGeoData } from '../composables/useGeoData'

const SITE_TITLE = 'Bangladesh Geo Registry'
const { getDivision, getDistrict, getUpazila } = useGeoData()

const routes = [
  { path: '/', redirect: '/divisions' },
  {
    path: '/divisions',
    name: 'divisions',
    component: DivisionsPage,
  },
  {
    path: '/divisions/:divisionId/districts',
    name: 'districts',
    component: DistrictsPage,
    props: (route) => ({ divisionId: Number(route.params.divisionId) }),
  },
  {
    path: '/divisions/:divisionId/districts/:districtId/upazilas',
    name: 'upazilas',
    component: UpazilasPage,
    props: (route) => ({
      divisionId: Number(route.params.divisionId),
      districtId: Number(route.params.districtId),
    }),
  },
  {
    path: '/divisions/:divisionId/districts/:districtId/upazilas/:upazilaId/unions',
    name: 'unions',
    component: UnionsPage,
    props: (route) => ({
      divisionId: Number(route.params.divisionId),
      districtId: Number(route.params.districtId),
      upazilaId: Number(route.params.upazilaId),
    }),
  },
  { path: '/:pathMatch(.*)*', redirect: '/divisions' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Keep the browser tab title in sync with where the person actually is —
// a static title on every page makes history/bookmarks/tab-switching
// harder to use, which isn't the "standard" behaviour people expect from
// a real app.
router.afterEach((to) => {
  const parts = []

  const divisionId = to.params.divisionId != null ? Number(to.params.divisionId) : null
  const districtId = to.params.districtId != null ? Number(to.params.districtId) : null
  const upazilaId = to.params.upazilaId != null ? Number(to.params.upazilaId) : null

  const division = divisionId != null ? getDivision(divisionId) : null
  const district = districtId != null ? getDistrict(districtId) : null
  const upazila = upazilaId != null ? getUpazila(upazilaId) : null

  if (upazila) parts.push(upazila.name)
  else if (district) parts.push(district.name)
  else if (division) parts.push(division.name)

  if (to.name === 'divisions') parts.push('Divisions')
  else if (to.name === 'districts' && division) parts.push('Districts')
  else if (to.name === 'upazilas' && district) parts.push('Upazilas')
  else if (to.name === 'unions' && upazila) parts.push('Unions')

  document.title = parts.length ? `${parts.join(' · ')} — ${SITE_TITLE}` : SITE_TITLE
})

export default router
