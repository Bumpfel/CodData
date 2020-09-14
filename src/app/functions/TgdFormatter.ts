// ---- Missing / weird stuff ----
// there is no data for non stat effects like "sound suppression"
// there is no attachment data for base magasine size or reload time. have to compare with base weapon
// the attachment data given for the reload time is not the reduction in reload time, but rather the new total reload time
// attachments affecting damage stat are listed as their own weapons

import { Stats } from '../models/Stats'
import { Effect } from '../models/Effect'
import { AttachmentData, WeaponData, TGDData } from '../models/TGD/Data'

export class TgdFormatter {

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
    
    // summary
    final_ads: 'final_ads',
    ads_move: 'ads_move',
    move: 'move',
    hipfire_area: 'hipfire_area',
    bullet_velocity: 'bullet_velocity',
    sstf: 'sstf',
    stf: 'stf',

    // base
    base_ads: 'base_ads',
    base_move: 'base_move',
    base_ads_move: 'base_ads_move',
    hipfire_base_area: 'hipfire_base_area',
    type: 'type,'
  }

  
  /**
   * @deprecated Use getAttachmentEffects
   * Formats TGD data into printable keys and values (TODO not sure I'll use at all)
   * @param summaryData
   */
  static getAllWeaponEffects(summaryData: AttachmentData[], weaponData: WeaponData): Array<Map<string, Effect>> {
    const allEffects: Map<string, Effect>[] = []
    
    for(let i = 0; i < summaryData.length; i ++) {
      const attachmentKey: string = summaryData[i].attachment || summaryData[i].gun
      allEffects[attachmentKey] = TgdFormatter.getAttachmentEffects(summaryData[i], weaponData)
    }
    
    return allEffects
  }

  // TODO rename to reflect its used by weapon summary data as well
  static getAttachmentEffects(tgdData: TGDData, baseWeaponData: WeaponData, isSummary: boolean = false): Map<string, Effect> {
    const effects: Map<string, Effect> = new Map()   

    for(let mod in tgdData) {
      const value = tgdData[mod]
      
      const effect: Effect = new Effect(
        TgdFormatter.getEffectDisplayValue(mod, value, (isSummary && TgdFormatter.summaryValuesWithSign.has(mod) || !isSummary), baseWeaponData, isSummary),
        this.getModEffectStatus(mod, value, baseWeaponData)
      )
      
      effects.set(TgdFormatter.displayNames.get(mod), effect)
    }
    
    return effects
  }

/**
   * Returns a negative, 0 (neutral), or positive value (used to determine whether the value is semantically negative or positive (good or bad))
   * @param mod 
   * @param value raw value
   * @param baseWeaponData tgd base weapon data. use TgdService.getWeaponData()[1]
   */
  private static getModEffectStatus(mod: string, value: number, baseWeaponData: WeaponData): number {
    const positiveModEffect: string = TgdFormatter.positiveModEffect.get(mod)
    let status: number // positive effect = pro, negative effect = con, neutral effect = none

    const compareToBaseMod = TgdFormatter.compareToBaseMods.get(mod)
    // if(TgdFormatter.comparesToBase.has(mod)) {
    if(compareToBaseMod) {
      const baseValue: number = baseWeaponData[compareToBaseMod]
      const difference = value - baseValue
      
      if(difference != 0) {
        if(positiveModEffect === TgdFormatter.positiveEffects.positive) {
          status = value - baseWeaponData[compareToBaseMod]
        } else if(positiveModEffect === TgdFormatter.positiveEffects.negative) {
          status = baseWeaponData[compareToBaseMod] - value
        }
        value = difference
      }
    } else if(positiveModEffect === TgdFormatter.positiveEffects.greaterThan1) {
      status = value - 1
    } else if(positiveModEffect === TgdFormatter.positiveEffects.lessThan1) {
      status = (value - 1) * -1
    } else if(positiveModEffect === TgdFormatter.positiveEffects.negative) {
      status = value * -1
    }
    
    return status
  }

  private static getEffectDisplayValue(mod: string, value: number, addSign: boolean, baseWeaponData: WeaponData, isSummary: boolean = false): string {
    let unit = TgdFormatter.displayUnits.get(mod)

    if(!isSummary && TgdFormatter.compareToBaseMods.has(mod)) {          
      value = value - baseWeaponData[mod]
    }

    if(unit === TgdFormatter.units.percent) {
      let calc = Math.round((value - 1) * 1000) / 10
      value = calc * (this.flipSign.has(mod) ? -1 : 1)
    } else {
      // round to at most 4 numbers (at most 2 decimals)
      let roundRatio = value > 1000 ? 1 : (value > 1000 ? 10 : 100)
      value = Math.round(value * roundRatio) / roundRatio 
    }

    return (value === 0 && !isSummary
      ? '' 
      : (addSign && value > 0 
        ? '+' 
        : '')
      + value + ' ' + unit)
  }

  private static positiveEffects = { negative: '-', positive: '+', greaterThan1: '>', lessThan1: '<' }

  private static units = { s: 's', ms: 'ms', mps: 'm/s', percent: '%', area: 'kPixel^2', rounds: 'rounds'}

  private static compareToBaseMods: Map<string, string> = new Map([
    [TgdFormatter.mods.reload, TgdFormatter.mods.reload],
    [TgdFormatter.mods.mag_size, TgdFormatter.mods.mag_size],

    // summary
    [TgdFormatter.mods.final_ads, TgdFormatter.mods.base_ads],
    [TgdFormatter.mods.ads_move, TgdFormatter.mods.base_ads_move],
    [TgdFormatter.mods.move, TgdFormatter.mods.base_move],
    [TgdFormatter.mods.hipfire_area, TgdFormatter.mods.hipfire_base_area],
    [TgdFormatter.mods.bullet_velocity, TgdFormatter.mods.bullet_velocity],
    [TgdFormatter.mods.sstf, TgdFormatter.mods.sstf],
    [TgdFormatter.mods.stf, TgdFormatter.mods.stf],
  ])

  // since tgd calls e.g. "Recoil Control" "Horizontal Bounce", it flips the logic
  private static flipSign: Set<string> = new Set([
    TgdFormatter.mods.hipfire_area_mod,
    TgdFormatter.mods.horiz_bounce_mod,
    TgdFormatter.mods.vert_recoil_mod,
  ])

  private static positiveModEffect: Map<string, string> = new Map([
    [TgdFormatter.mods.ads_mod, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.ads_move_mod, TgdFormatter.positiveEffects.greaterThan1],
    [TgdFormatter.mods.bullet_velocity_mod, TgdFormatter.positiveEffects.greaterThan1],
    [TgdFormatter.mods.hipfire_area_mod, TgdFormatter.positiveEffects.lessThan1],
    [TgdFormatter.mods.horiz_bounce_mod, TgdFormatter.positiveEffects.lessThan1],
    [TgdFormatter.mods.move_mod, TgdFormatter.positiveEffects.greaterThan1],
    [TgdFormatter.mods.range_mod, TgdFormatter.positiveEffects.greaterThan1],
    [TgdFormatter.mods.sstfe, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.stfe, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.vert_recoil_mod, TgdFormatter.positiveEffects.lessThan1],
    [TgdFormatter.mods.reload, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.mag_size, TgdFormatter.positiveEffects.positive],

    // summary. compare to base
    [TgdFormatter.mods.final_ads, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.ads_move, TgdFormatter.positiveEffects.positive],
    [TgdFormatter.mods.move, TgdFormatter.positiveEffects.positive],
    [TgdFormatter.mods.hipfire_area, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.bullet_velocity, TgdFormatter.positiveEffects.positive],
    [TgdFormatter.mods.sstf, TgdFormatter.positiveEffects.negative],
    [TgdFormatter.mods.stf, TgdFormatter.positiveEffects.negative],
  ])

  private static displayNames: Map<string, string> = new Map([
    [TgdFormatter.mods.ads_mod, Stats.names.ads_speed],
    [TgdFormatter.mods.ads_move_mod, Stats.names.ads_move_speed],
    [TgdFormatter.mods.bullet_velocity_mod, Stats.names.bullet_velocity],
    [TgdFormatter.mods.hipfire_area_mod, Stats.names.hipfire_accuracy],
    [TgdFormatter.mods.horiz_bounce_mod, Stats.names.recoil_stability],
    [TgdFormatter.mods.move_mod, Stats.names.move_speed],
    [TgdFormatter.mods.range_mod, Stats.names.dmg_range],
    [TgdFormatter.mods.sstfe, Stats.names.tstf],
    [TgdFormatter.mods.stfe, Stats.names.stf],
    [TgdFormatter.mods.vert_recoil_mod, Stats.names.recoil_control],
    [TgdFormatter.mods.reload, Stats.names.reload_time],
    [TgdFormatter.mods.mag_size, Stats.names.mag_size],
    
    // Summary
    [TgdFormatter.mods.final_ads, Stats.names.ads_speed],
    [TgdFormatter.mods.ads_move, Stats.names.ads_move_speed],
    [TgdFormatter.mods.move, Stats.names.move_speed],
    [TgdFormatter.mods.hipfire_area, Stats.names.hipfire_accuracy],
    [TgdFormatter.mods.bullet_velocity, Stats.names.bullet_velocity],
    [TgdFormatter.mods.stf, Stats.names.stf],
    [TgdFormatter.mods.sstf, Stats.names.tstf],
  ])

  // for singular attachments
  private static displayUnits: Map<string, string> = new Map([
    [TgdFormatter.mods.ads_mod, TgdFormatter.units.ms],
    [TgdFormatter.mods.ads_move_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.bullet_velocity_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.hipfire_area_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.horiz_bounce_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.move_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.range_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.sstfe, TgdFormatter.units.ms],
    [TgdFormatter.mods.stfe, TgdFormatter.units.ms],
    [TgdFormatter.mods.vert_recoil_mod, TgdFormatter.units.percent],
    [TgdFormatter.mods.reload, TgdFormatter.units.s],
    [TgdFormatter.mods.mag_size, TgdFormatter.units.rounds],

    // Summary
    [TgdFormatter.mods.final_ads, TgdFormatter.units.ms],
    [TgdFormatter.mods.ads_move, TgdFormatter.units.mps],
    [TgdFormatter.mods.move, TgdFormatter.units.mps],
    [TgdFormatter.mods.hipfire_area, TgdFormatter.units.area],
    [TgdFormatter.mods.bullet_velocity, TgdFormatter.units.mps],
    [TgdFormatter.mods.sstf, TgdFormatter.units.ms],
    [TgdFormatter.mods.stf, TgdFormatter.units.ms],
  ])

  private static summaryValuesWithSign: Set<string> = new Set([ // TODO rename
    TgdFormatter.mods.range_mod,
    TgdFormatter.mods.vert_recoil_mod,
    TgdFormatter.mods.horiz_bounce_mod,
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
  private static nonStatMods: Map<string, string> = new Map([ // Map<Set<string>, string>
    ['variable suppressors / suppressed barrels', 'Sound Suppression'],
    ['5mW laser/tac laser', 'Laser Visible to Enemies'],
    ['Sniper Scope, Variable Zoom Scope', 'Scope Glint'],
    ['Variable Zoom Scope', 'Magnification Toggle'],
    ['', 'Zoom Level'],
    ['', 'Precision Sight Picture'],
    ['', 'Holo & Scout Toggle'],
    ['', 'Reflex & Scout Toggle'],
    ['', 'Reflex & Thermal Toggle'],
    ['', 'Thermal Target Identification'],
    ['', 'Fire Rate'],
    ['', 'Magasine Ammo Capacity'],
    ['', 'No visible tracers'],
    ['', 'No enemy skulls'], // dno what this even is
    ['', 'Muzzle Flash Concealment'],
    ['', 'Tighter Pellet Spread'],
    ['', 'Wider Pellet Spread'],
    ['', 'Melee Damage'],
  ])
}
