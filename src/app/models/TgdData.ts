// ---- Missing / weird stuff ----
// there is no data for non stat effects like "sound suppression"
// there is no attachment data for base magasine size or reload time. have to compare with base weapon
// the attachment data given for the reload time is not the reduction in reload time, but rather the new total reload time
// attachments affecting damage stat are listed as their own weapons

import { Stats } from '../models/Stats'
import { Effect } from './Effect'
import { AttachmentData, WeaponData } from './TGD/Data'

export class TgdData {
  // TODO doing double work (iterates through the entire attachment object for both negative and positive effects)

  /**
   * Formats TGD data into printable keys and values (TODO not sure I'll use at all)
   * @param summaryData
   */

  static getAllWeaponEffects(summaryData: AttachmentData[], weaponData: WeaponData): Map<string, Effect>[] {
    const allEffects: Map<string, Effect>[] = []
    
    for(let i = 0; i < summaryData.length; i ++) {     
      const attachmentKey: string = summaryData[i].attachment || summaryData[i].gun
      allEffects[attachmentKey] = TgdData.getAttachmentEffects(summaryData[i], weaponData)
    }
    
    return allEffects
  }

  static getAttachmentEffects(attachment: AttachmentData, baseWeaponData: WeaponData): Map<string, Effect> { // TODO type parameters
    const effects: Map<string, Effect> = new Map()

    for(let mod in attachment) {
      const value = attachment[mod]

      const status = this.getModEffectStatus(mod, value, baseWeaponData)

      const effect: Effect = new Effect(
        TgdData.getEffectDisplayValue(mod, value, true),
        status
        // status: status > 0 ? Effect.Positive : (status < 0 ? Effect.Negative : Effect.Neutral)
      )
      effects.set(TgdData.displayNames.get(mod), effect)
    }
    
    return effects
  }

/**
   * Returns a negative, 0 (neutral), or positive value
   * @param mod 
   * @param value raw value
   * @param baseWeaponData tgd base weapon data. use TgdService.getWeaponData()[1]
   */
  private static getModEffectStatus(mod: string, value: number, baseWeaponData: WeaponData ): number {
    
    const positiveModEffect: string = TgdData.positiveModEffect.get(mod)
    let status: number // positive effect = pro, negative effect = con, neutral effect = none  

    if(TgdData.comparesToBase.has(mod)) {
      const baseValue: number = baseWeaponData[mod]
      const difference = value - baseValue
      
      if(difference != 0) {
        if(positiveModEffect === TgdData.positiveEffects.positive) {
          status = value - baseWeaponData[mod]
        } else if(positiveModEffect === TgdData.positiveEffects.negative) {
          status = baseWeaponData[mod] - value
        }
        value = difference
      }
    } else if(positiveModEffect === TgdData.positiveEffects.greaterThan1) {
      status = value - 1
    } else if(positiveModEffect === TgdData.positiveEffects.lessThan1) {
      status = (value - 1) * -1
    } else if(positiveModEffect === TgdData.positiveEffects.negative) {
      status = value * -1
    }

    return status
  }

  private static getEffectDisplayValue(mod: string, value: number, addSign: boolean): string {
    let unit = TgdData.displayUnits.get(mod)

    if(unit === TgdData.units.percent) {
      let calc = Math.round((value - 1) * 1000) / 10
      value = calc * (this.flipSign.has(mod) ? -1 : 1)
    } else {
      // round to at most 4 numbers (at most 2 decimals)
      let roundRatio = value > 1000 ? 1 : (value > 1000 ? 10 : 100)
      value = Math.round(value * roundRatio) / roundRatio 
    }

    return (value === 0 ? '' : (addSign && value > 0 ? '+' : '') + value + ' ' + unit)
  }

  private static positiveEffects = { negative: '-', positive: '+', greaterThan1: '>', lessThan1: '<' }

  private static units = { s: 's', ms: 'ms', mps: 'm/s', percent: '%', area: 'kPixel^2', rounds: 'rounds'}
  
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
  }

  private static comparesToBase: Set<string> = new Set([
    TgdData.mods.reload,
    TgdData.mods.mag_size,

    // summary
    TgdData.mods.ads_move,
    TgdData.mods.move,
    TgdData.mods.hipfire_area,
    TgdData.mods.bullet_velocity,
    TgdData.mods.sstf,
    TgdData.mods.stf,
  ])

  // since tgd calls e.g. "Recoil Control" "Horizontal Bounce", it flips the logic
  private static flipSign: Set<string> = new Set([
    TgdData.mods.hipfire_area_mod,
    TgdData.mods.horiz_bounce_mod,
    TgdData.mods.vert_recoil_mod,
  ])

  private static positiveModEffect: Map<string, string> = new Map([
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

    // summary. compare to base
    [TgdData.mods.final_ads, TgdData.positiveEffects.negative],
    [TgdData.mods.ads_move, TgdData.positiveEffects.positive],
    [TgdData.mods.move, TgdData.positiveEffects.positive],
    [TgdData.mods.hipfire_area, TgdData.positiveEffects.negative],
    [TgdData.mods.bullet_velocity, TgdData.positiveEffects.positive],
    [TgdData.mods.sstf, TgdData.positiveEffects.negative],
    [TgdData.mods.stf, TgdData.positiveEffects.negative],
  ])

  private static displayNames: Map<string, string> = new Map([
    [TgdData.mods.ads_mod, Stats.names.ads_speed],
    [TgdData.mods.ads_move_mod, Stats.names.ads_move_speed],
    [TgdData.mods.bullet_velocity_mod, Stats.names.bullet_velocity],
    [TgdData.mods.hipfire_area_mod, Stats.names.hipfire_accuracy],
    [TgdData.mods.horiz_bounce_mod, Stats.names.recoil_stability],
    [TgdData.mods.move_mod, Stats.names.move_speed],
    [TgdData.mods.range_mod, Stats.names.dmg_range],
    [TgdData.mods.sstfe, Stats.names.tstf],
    [TgdData.mods.stfe, Stats.names.stf],
    [TgdData.mods.vert_recoil_mod, Stats.names.recoil_control],
    [TgdData.mods.reload, Stats.names.reload_time],
    [TgdData.mods.mag_size, Stats.names.mag_size],
    
    // Summary
    [TgdData.mods.final_ads, Stats.names.ads_speed],
    [TgdData.mods.ads_move, Stats.names.ads_move_speed],
    [TgdData.mods.move, Stats.names.move_speed],
    [TgdData.mods.hipfire_area, Stats.names.hipfire_accuracy],
    [TgdData.mods.bullet_velocity, Stats.names.bullet_velocity],
    [TgdData.mods.stf, Stats.names.stf],
    [TgdData.mods.sstf, Stats.names.tstf],
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
    [TgdData.mods.mag_size, TgdData.units.rounds],

    // Summary
    [TgdData.mods.final_ads, TgdData.units.ms],
    [TgdData.mods.ads_move, TgdData.units.mps],
    [TgdData.mods.move, TgdData.units.mps],
    [TgdData.mods.hipfire_area, TgdData.units.area],
    [TgdData.mods.bullet_velocity, TgdData.units.mps],
    [TgdData.mods.sstf, TgdData.units.ms],
    [TgdData.mods.stf, TgdData.units.ms],
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




    // TODO test
    private static positiveModEffect2: Map<string, string> = new Map([
      [Stats.names.ads_speed, TgdData.positiveEffects.negative],
      [Stats.names.ads_move_speed, TgdData.positiveEffects.greaterThan1],
      [Stats.names.bullet_velocity, TgdData.positiveEffects.greaterThan1],
      [Stats.names.hipfire_accuracy, TgdData.positiveEffects.lessThan1],
      [Stats.names.recoil_stability, TgdData.positiveEffects.lessThan1],
      [Stats.names.move_speed, TgdData.positiveEffects.greaterThan1],
      [Stats.names.dmg_range, TgdData.positiveEffects.greaterThan1],
      [Stats.names.tstf, TgdData.positiveEffects.negative],
      [Stats.names.stf, TgdData.positiveEffects.negative],
      [Stats.names.recoil_control, TgdData.positiveEffects.lessThan1],
      [Stats.names.reload_time, TgdData.positiveEffects.negative],
      [Stats.names.mag_size, TgdData.positiveEffects.positive],
    ])
}
