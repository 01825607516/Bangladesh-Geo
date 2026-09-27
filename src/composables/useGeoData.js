import divisionsData from '../data/divisions.json'
import districtsData from '../data/districts.json'
import upazilasData from '../data/upazilas.json'
import unionsData from '../data/unions.json'

// one colour per division, drawn from the ledger's own ink set
export const PALETTE = [
  '#0e4430', // forest
  '#b8323a', // red
  '#a67a26', // gold
  '#2f5d8a', // slate blue
  '#7a4a9e', // plum
  '#3d7a5c', // sea green
  '#a15a2b', // clay
  '#5c6b8a', // steel
]

const divisionColors = {}
divisionsData.forEach((d, i) => (divisionColors[d.id] = PALETTE[i % PALETTE.length]))

const divisionById = new Map(divisionsData.map((d) => [d.id, d]))
const districtById = new Map(districtsData.map((d) => [d.id, d]))
const upazilaById = new Map(upazilasData.map((u) => [u.id, u]))
const unionById = new Map(unionsData.map((u) => [u.id, u]))

const districtsByDivision = new Map()
districtsData.forEach((d) => {
  if (!districtsByDivision.has(d.division_id)) districtsByDivision.set(d.division_id, [])
  districtsByDivision.get(d.division_id).push(d)
})

const upazilasByDistrict = new Map()
upazilasData.forEach((u) => {
  if (!upazilasByDistrict.has(u.district_id)) upazilasByDistrict.set(u.district_id, [])
  upazilasByDistrict.get(u.district_id).push(u)
})

const unionsByUpazila = new Map()
unionsData.forEach((u) => {
  if (!unionsByUpazila.has(u.upazila_id)) unionsByUpazila.set(u.upazila_id, [])
  unionsByUpazila.get(u.upazila_id).push(u)
})

export const totals = {
  divisions: divisionsData.length,
  districts: districtsData.length,
  upazilas: upazilasData.length,
  unions: unionsData.length,
}

/**
 * Shared read-only geo lookups. Everything here is plain data derived once
 * at module load, so every page/component that calls useGeoData() gets the
 * same maps without recomputing them.
 */
export function useGeoData() {
  return {
    divisionsData,
    districtsData,
    upazilasData,
    unionsData,
    divisionColors,

    getDivision: (id) => divisionById.get(Number(id)),
    getDistrict: (id) => districtById.get(Number(id)),
    getUpazila: (id) => upazilaById.get(Number(id)),
    getUnion: (id) => unionById.get(Number(id)),

    getDistricts: (divisionId) => districtsByDivision.get(Number(divisionId)) || [],
    getUpazilas: (districtId) => upazilasByDistrict.get(Number(districtId)) || [],
    getUnions: (upazilaId) => unionsByUpazila.get(Number(upazilaId)) || [],
  }
}
