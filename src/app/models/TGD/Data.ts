export interface TGDData {
  ads_mod?: number
  ads_move_mod?: number
  attachment?: string
  base_ads?: number
  base_ads_move?: number
  base_move?: number
  bullet_velocity?: number
  bullet_velocity_mod?: number
  gun?: string
  hipfire_area_mod?: number
  hipfire_base_area?: number
  horiz_bounce_mod?: number
  mag_size?: number
  move_mod?: number
  period?: number
  range_mod?: number
  reload?: number
  row_id?: number
  slot?: string
  sstf?: number
  sstfe?: number
  stf?: number
  stfe?: number
  type?: string
  vert_recoil_mod?: number
  x_sway?: number
  x_sway_mod?: number
  y_sway?: number
  y_sway_mod?: number
}

export interface AttachmentData extends TGDData {
}
export interface WeaponData extends TGDData {
}