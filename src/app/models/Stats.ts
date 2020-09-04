export class Stats {

  static names = {
    ads_speed: 'Aim Down Sight Speed',
    ads_move_speed: 'Aim Walking Movement Speed',
    bullet_velocity: 'Bullet Velocity',
    dmg_range: 'Damage Range',
    hipfire_accuracy: 'Hip Fire Accuracy',
    mag_size: 'Magasine Size',
    move_speed: 'Movement Speed',
    recoil_control: 'Recoil Control (Vertical)',
    recoil_stability: 'Recoil Stability (Horizontal)',
    reload_time: 'Reload Time',
    stf: 'Sprint to Fire Speed',
    tstf: 'Tactical Sprint to Fire Speed',
  }

  static getAllOrderedStats(): string[] {
    const arr = [
      Stats.names.ads_speed,
      Stats.names.ads_move_speed,
      Stats.names.bullet_velocity,
      Stats.names.dmg_range,
      Stats.names.hipfire_accuracy,
      Stats.names.mag_size,
      Stats.names.move_speed,
      Stats.names.recoil_control,
      Stats.names.recoil_stability,
      Stats.names.reload_time,
      Stats.names.stf,
      Stats.names.tstf,
    ]
    return arr
  }
}