import { Injectable } from '@angular/core';
import { Effect } from '../../models/Effect';
// ---- Missing / weird stuff ----
// there is no data for non stat effects like "sound suppression"
// there is no attachment data for base magasine size or reload time. have to compare with base weapon
// the attachment data given for the reload time is not the reduction in reload time, but rather the new total reload time
// attachments affecting damage stat are listed as their own weapons
// rate of fire is a part of the base gun data, but not in the summary
import { Stats } from '../../models/Stats';
import { SummaryData, BaseData, TGDData } from '../../models/TGD/Data';


@Injectable({
  providedIn: 'root'
})
export class TgdFormatterService {

  constructor() { }

  private mods = {
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
    fire_rate: 'fire_rate', // new
    final_ads: 'final_ads',
    stf: 'stf',
    sstf: 'sstf',
    move: 'move',
    ads_move: 'ads_move',
    hipfire_area: 'hipfire_area',
    bullet_velocity: 'bullet_velocity',

    // base
    base_ads: 'base_ads',
    base_move: 'base_move',
    base_ads_move: 'base_ads_move',
    hipfire_base_area: 'hipfire_base_area',
    type: 'type,'
  }

  // new. idiotic. why does he return it as an array...
  // structure for both base weapon and attachments. this is the format that generate_attachments_summary should be sent data as well as the format in which data will be returned
  private summary = {
    0: this.mods.fire_rate,
    1: this.mods.range_mod,
    2: this.mods.ads_mod,
    3: this.mods.stf,
    4: this.mods.sstf,
    5: this.mods.move,
    6: this.mods.ads_move,
    7: this.mods.vert_recoil_mod,
    8: this.mods.horiz_bounce_mod,
    9: this.mods.hipfire_area,
    10: this.mods.bullet_velocity,
    11: this.mods.reload,
    12: this.mods.mag_size,
  }

  translateSummaryData(rawData: any): SummaryData {
    const summaryData: SummaryData = {} as SummaryData
    for(const key in rawData) {
      summaryData[this.summary[key]] = rawData[key]
    }
    return summaryData
  }

  getHitboxes(): {[key: string]: string} {
    return { head: 'head', torso: 'chest', stomach: 'stomach', limbs: 'legs' }
  }
  
  /**
   * @deprecated Use getAttachmentEffects
   * Formats TGD data into printable keys and values (TODO not sure I'll use at all)
   * @param summaryData
   */
  getAllWeaponEffects(summaryData: TGDData[], weaponData: TGDData): Array<Map<string, Effect>> {
    const allEffects: Map<string, Effect>[] = []
    
    for(let i = 0; i < summaryData.length; i ++) {
      const attachmentKey: string = summaryData[i].attachment || summaryData[i].gun
      allEffects[attachmentKey] = this.getAttachmentEffects(summaryData[i], weaponData)
    }
    
    return allEffects
  }

  // TODO rename to reflect its used by weapon summary data as well
  getAttachmentEffects(tgdData: TGDData, baseWeaponData: any, isSummary: boolean = false): Map<string, Effect> {
    const effects: Map<string, Effect> = new Map()
    
    

    return effects
  }
  // old
  // getAttachmentEffects(tgdData: TGDData, baseWeaponData: any, isSummary: boolean = false): Map<string, Effect> {
  //   const effects: Map<string, Effect> = new Map()
    
  //   for(let mod in tgdData) {
  //     const value = tgdData[mod]
      
  //     const effect: Effect = new Effect(
  //       this.getEffectDisplayValue(mod, value, (isSummary && this.summaryValuesWithSign.has(mod) || !isSummary), baseWeaponData, isSummary),
  //       this.getModEffectStatus(mod, value, baseWeaponData)
  //     )
      
  //     effects.set(this.displayNames.get(mod), effect)
  //   }
    
  //   return effects
  // }

/**
   * Returns a negative, 0 (neutral), or positive value (used to determine whether the value is semantically negative or positive (good or bad))
   * @param mod 
   * @param value raw value
   * @param baseWeaponData tgd base weapon data. use TgdService.getWeaponData()[1]
   */
  private getModEffectStatus(mod: string, value: number, baseWeaponData: BaseData): number {
    const positiveModEffect: string = this.positiveModEffect.get(mod)
    let status: number // positive effect = pro, negative effect = con, neutral effect = none

    const compareToBaseMod = this.compareToBaseMods.get(mod)
    // if(this.comparesToBase.has(mod)) {
    if(compareToBaseMod) {
      const baseValue: number = baseWeaponData[compareToBaseMod]
      const difference = value - baseValue
      
      if(difference != 0) {
        if(positiveModEffect === this.positiveEffects.positive) {
          status = value - baseWeaponData[compareToBaseMod]
        } else if(positiveModEffect === this.positiveEffects.negative) {
          status = baseWeaponData[compareToBaseMod] - value
        }
        value = difference
      }
    } else if(positiveModEffect === this.positiveEffects.greaterThan1) {
      status = value - 1
    } else if(positiveModEffect === this.positiveEffects.lessThan1) {
      status = (value - 1) * -1
    } else if(positiveModEffect === this.positiveEffects.negative) {
      status = value * -1
    }
    
    return status
  }

  private getEffectDisplayValue(mod: string, value: number, addSign: boolean, baseWeaponData: TGDData, isSummary: boolean = false): string {
    let unit = this.displayUnits.get(mod)

    if(!isSummary && this.compareToBaseMods.has(mod)) {          
      value = value - baseWeaponData[mod]
    }

    if(unit === this.units.percent) {
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

  private positiveEffects = { negative: '-', positive: '+', greaterThan1: '>', lessThan1: '<' }

  private units = { s: 's', ms: 'ms', mps: 'm/s', percent: '%', area: 'kPixel^2', rounds: 'rounds'}

  private compareToBaseMods: Map<string, string> = new Map([
    [this.mods.reload, this.mods.reload],
    [this.mods.mag_size, this.mods.mag_size],

    // summary
    [this.mods.final_ads, this.mods.base_ads],
    [this.mods.ads_move, this.mods.base_ads_move],
    [this.mods.move, this.mods.base_move],
    [this.mods.hipfire_area, this.mods.hipfire_base_area],
    [this.mods.bullet_velocity, this.mods.bullet_velocity],
    [this.mods.sstf, this.mods.sstf],
    [this.mods.stf, this.mods.stf],
  ])

  // since tgd calls e.g. "Recoil Control" "Horizontal Bounce", it flips the logic
  private flipSign: Set<string> = new Set([
    this.mods.hipfire_area_mod,
    this.mods.horiz_bounce_mod,
    this.mods.vert_recoil_mod,
  ])

  private positiveModEffect: Map<string, string> = new Map([
    [this.mods.ads_mod, this.positiveEffects.negative],
    [this.mods.ads_move_mod, this.positiveEffects.greaterThan1],
    [this.mods.bullet_velocity_mod, this.positiveEffects.greaterThan1],
    [this.mods.hipfire_area_mod, this.positiveEffects.lessThan1],
    [this.mods.horiz_bounce_mod, this.positiveEffects.lessThan1],
    [this.mods.move_mod, this.positiveEffects.greaterThan1],
    [this.mods.range_mod, this.positiveEffects.greaterThan1],
    [this.mods.sstfe, this.positiveEffects.negative],
    [this.mods.stfe, this.positiveEffects.negative],
    [this.mods.vert_recoil_mod, this.positiveEffects.lessThan1],
    [this.mods.reload, this.positiveEffects.negative],
    [this.mods.mag_size, this.positiveEffects.positive],

    // summary. compare to base
    [this.mods.final_ads, this.positiveEffects.negative],
    [this.mods.ads_move, this.positiveEffects.positive],
    [this.mods.move, this.positiveEffects.positive],
    [this.mods.hipfire_area, this.positiveEffects.negative],
    [this.mods.bullet_velocity, this.positiveEffects.positive],
    [this.mods.sstf, this.positiveEffects.negative],
    [this.mods.stf, this.positiveEffects.negative],
  ])

  private displayNames: Map<string, string> = new Map([
    [this.mods.ads_mod, Stats.names.ads_speed],
    [this.mods.ads_move_mod, Stats.names.ads_move_speed],
    [this.mods.bullet_velocity_mod, Stats.names.bullet_velocity],
    [this.mods.hipfire_area_mod, Stats.names.hipfire_accuracy],
    [this.mods.horiz_bounce_mod, Stats.names.recoil_stability],
    [this.mods.move_mod, Stats.names.move_speed],
    [this.mods.range_mod, Stats.names.dmg_range],
    [this.mods.sstfe, Stats.names.tstf],
    [this.mods.stfe, Stats.names.stf],
    [this.mods.vert_recoil_mod, Stats.names.recoil_control],
    [this.mods.reload, Stats.names.reload_time],
    [this.mods.mag_size, Stats.names.mag_size],
    
    // Summary
    [this.mods.final_ads, Stats.names.ads_speed],
    [this.mods.ads_move, Stats.names.ads_move_speed],
    [this.mods.move, Stats.names.move_speed],
    [this.mods.hipfire_area, Stats.names.hipfire_accuracy],
    [this.mods.bullet_velocity, Stats.names.bullet_velocity],
    [this.mods.stf, Stats.names.stf],
    [this.mods.sstf, Stats.names.tstf],
  ])

  // for singular attachments
  private displayUnits: Map<string, string> = new Map([
    [this.mods.ads_mod, this.units.ms],
    [this.mods.ads_move_mod, this.units.percent],
    [this.mods.bullet_velocity_mod, this.units.percent],
    [this.mods.hipfire_area_mod, this.units.percent],
    [this.mods.horiz_bounce_mod, this.units.percent],
    [this.mods.move_mod, this.units.percent],
    [this.mods.range_mod, this.units.percent],
    [this.mods.sstfe, this.units.ms],
    [this.mods.stfe, this.units.ms],
    [this.mods.vert_recoil_mod, this.units.percent],
    [this.mods.reload, this.units.s],
    [this.mods.mag_size, this.units.rounds],

    // Summary
    [this.mods.final_ads, this.units.ms],
    [this.mods.ads_move, this.units.mps],
    [this.mods.move, this.units.mps],
    [this.mods.hipfire_area, this.units.area],
    [this.mods.bullet_velocity, this.units.mps],
    [this.mods.sstf, this.units.ms],
    [this.mods.stf, this.units.ms],
  ])

  private summaryValuesWithSign: Set<string> = new Set([ // TODO rename
    this.mods.range_mod,
    this.mods.vert_recoil_mod,
    this.mods.horiz_bounce_mod,
  ])

  // TODO dno if I'll use (unfinished)
  private nonStatMods: Map<string, string> = new Map([ // Map<Set<string>, string>
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
