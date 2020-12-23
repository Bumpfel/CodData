export interface BaseData {
  ads: number
  ads_movement: number
  alt_rpm: number
  burst: number
  bv: number
  damage_data: { [key: string]: DamageInterval[] }
  hipfire_area: number
  horiz_bounce: number
  mag_size: number
  movement: number
  obd: number
  recoil_mag: number
  reload_time: number
  rpm: number
  slot_names: string[]
  sstf: number
  stf: number
}

export interface SummaryData {
  fire_rate?: number
  range_mod: number
  final_ads: number
  stf?: number
  sstf?: number
  move?: number
  ads_move?: number
  vert_recoil_mod: number
  horiz_bounce_mod: number
  hipfire_area?: number
  bullet_velocity?: number
  reload?: number
  mag_size?: number
}
// e.g. Default: [
  // 0: { head: 43, chest: 28... },
  // 1: { head: 43 ... },
  // 2: { head: 43 ....},
// ]

export interface DamageInterval {
  head: number
  chest: number
  stomach: number
  extremities: number
  dropoff: number
}

export interface TGDData {
  ads_mod?: number
  ads_movement_mod?: number
  attachment?: string
  base_ads?: number
  base_ads_move?: number
  base_move?: number
  bullet_velocity?: number
  BV_mod?: number
  details?: string
  gun?: string
  hipfire_area_mod?: number
  hipfire_base_area?: number
  horiz_bounce_mod?: number
  mag_size?: number
  move_mod?: number
  period?: number
  range_mod?: number
  reload?: number
  RPM_mod?: number
  row_id?: number
  slot?: string
  slot_names?: string
  sstf?: number
  sstfe?: number
  stf?: number
  stfe?: number
  type?: string
  unlock_level?: string
  vert_recoil_mod?: number
  x_sway?: number
  x_sway_mod?: number
  y_sway?: number
  y_sway_mod?: number
}