// ---- Missing / weird stuff ----
// there is no data for non stat effects like "sound suppression"
// there is no data for base magasine size or reload time. have to compare with base weapon 
// attachments affecting damage stat are listed as their own weapons

export class TgdData { // TODO make all variables private. getters should be used to reduce the hidden dependencies (user needing to know which data structure is used)

  static getEffectDisplayName(effectLabel: string): string {
    return TgdData.displayNames.get(effectLabel)
  }

  static getEffectDisplayValue(effectLabel: string, effectValue: number, isPositive: boolean): string {
    let unit = TgdData.displayUnits.get(effectLabel)

    if(unit === TgdData.units.ms) {
      return (effectValue > 0 ? '+' : '') + effectValue + ' ' + unit
    } else if(unit === TgdData.units.percent) {
      let calc = Math.round((effectValue - 1) * 1000) / 10
      calc *= this.flipSign.has(effectLabel) ? -1 : 1
      return (calc > 0 ? '+' : '') + calc + ' %'
    }
    return null
  }

  static isMissingMod(attachmentName: string): boolean {
    return this.missingMods.has(attachmentName)
  }

  static positiveEffects = { negative: '-', positive: '+', greaterThan1: '>', lessThan1: '<' }

  private static units = { s: 's', ms: 'ms', mps: 'm/s', percent: '%', area: 'kPixel^2' }
  
  private static mods = {
    ads_mod: 'ads_mod',
    ads_move_mod: 'ads_move_mod',
    bullet_velocity_mod: 'bullet_velocity_mod',
    hipfire_area_mod: 'hipfire_area_mod',
    horiz_bounce_mod: 'horiz_bounce_mod',
    move_mod: 'move_mod',
    range_mod: 'range_mod',
    sstfe: 'sstfe',
    stfe: 'stfe',
    vert_recoil_mod: 'vert_recoil_mod',
    reload: 'reload',
    mag_size: 'mag_size',
  }

  private static missingMods: Set<string> = new Set([
    TgdData.mods.reload,
    TgdData.mods.mag_size,
  ])

  // since tgd calls e.g. "Recoil Control" "Horizontal Bounce", it flips the logic
  static flipSign: Set<string> = new Set([
    TgdData.mods.hipfire_area_mod,
    TgdData.mods.horiz_bounce_mod,
    TgdData.mods.vert_recoil_mod,
  ])

  static positiveModEffect: Map<string, string> = new Map([
    [TgdData.mods.ads_mod, TgdData.positiveEffects.negative],
    [TgdData.mods.ads_move_mod, TgdData.positiveEffects.greaterThan1],
    [TgdData.mods.bullet_velocity_mod, TgdData.positiveEffects.greaterThan1],
    [TgdData.mods.hipfire_area_mod, TgdData.positiveEffects.lessThan1],
    [TgdData.mods.horiz_bounce_mod, TgdData.positiveEffects.lessThan1],
    [TgdData.mods.move_mod, TgdData.positiveEffects.greaterThan1],
    [TgdData.mods.range_mod, TgdData.positiveEffects.greaterThan1],
    [TgdData.mods.sstfe, TgdData.positiveEffects.negative],
    [TgdData.mods.stfe, TgdData.positiveEffects.negative],
    [TgdData.mods.vert_recoil_mod, TgdData.positiveEffects.lessThan1],
    [TgdData.mods.reload, TgdData.positiveEffects.negative],
    [TgdData.mods.mag_size, TgdData.positiveEffects.positive],
  ])

  private static displayNames: Map<string, string> = new Map([
    [TgdData.mods.ads_mod, 'Aim Down Sight Speed'],
    [TgdData.mods.ads_move_mod, 'Aim Walking Movement Speed'],
    [TgdData.mods.bullet_velocity_mod, 'Bullet Velocity'],
    [TgdData.mods.hipfire_area_mod, 'Hip Fire Accuracy'],
    [TgdData.mods.horiz_bounce_mod, 'Recoil Stability (Horizontal)'],
    [TgdData.mods.move_mod, 'Movement Speed'],
    [TgdData.mods.range_mod, 'Range'],
    [TgdData.mods.sstfe, 'Tactical Sprint to Fire Speed'],
    [TgdData.mods.stfe, 'Sprint to Fire Speed'],
    [TgdData.mods.vert_recoil_mod, 'Recoil Control (Vertical)'],
    [TgdData.mods.reload, 'Reload time'],
    [TgdData.mods.mag_size, 'Magasine Size'],

    // [?, 'Damage'], // listed as different weapons on TGD
  ])

  // for singular attachments
  private static displayUnits: Map<string, string> = new Map([
    [TgdData.mods.ads_mod, TgdData.units.ms],
    [TgdData.mods.ads_move_mod, TgdData.units.percent],
    [TgdData.mods.bullet_velocity_mod, TgdData.units.percent],
    [TgdData.mods.hipfire_area_mod, TgdData.units.percent],
    [TgdData.mods.horiz_bounce_mod, TgdData.units.percent],
    [TgdData.mods.move_mod, TgdData.units.percent],
    [TgdData.mods.range_mod, TgdData.units.percent],
    [TgdData.mods.sstfe, TgdData.units.ms],
    [TgdData.mods.stfe, TgdData.units.ms],
    [TgdData.mods.vert_recoil_mod, TgdData.units.percent],
    [TgdData.mods.reload, TgdData.units.s],
  ])

  // might need for summary units ?
  // private static displayUnits: Map<string, string> = new Map([
  //   [TgdData.mods.ads_mod, TgdData.units.ms],
  //   [TgdData.mods.ads_move_mod, TgdData.units.mps],
  //   [TgdData.mods.bullet_velocity_mod, TgdData.units.mps],
    // [TgdData.mods.hipfire_area_mod, TgdData.units.area],
  //   [TgdData.mods.horiz_bounce_mod, TgdData.units.percent],
  //   [TgdData.mods.move_mod, TgdData.units.mps],
  //   [TgdData.mods.range_mod, TgdData.units.percent],
  //   [TgdData.mods.sstfe, TgdData.units.mps],
  //   [TgdData.mods.stfe, TgdData.units.mps],
  //   [TgdData.mods.vert_recoil_mod, TgdData.units.percent],
  // ])

  // TODO dno if I'll use (unfinished)
  private static nonStatMods: Map<string, string> = new Map([
    ['variable suppressors / suppressed barrels', 'Sound Suppression'],
    ['5mW laser/tac laser', 'Laser Visible to Enemies'],
    ['sniper scopes/variable zoom scope', 'Scope Glint'],
    ['Zoomed Scopes', 'Zoom Level'],
    ['?', 'Fire Rate'],
    ['', 'Magasine Ammo Capacity'],
    ['', ''],
  ])
}
