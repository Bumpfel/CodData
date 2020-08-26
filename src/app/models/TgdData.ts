import { TgdService } from '../services/tgd.service'
// ---- Missing / weird stuff ----
// there is no data for non stat effects like "sound suppression"
// there is no attachment data for base magasine size or reload time. have to compare with base weapon
// the attachment data given for the reload time is not the reduction in reload time, but rather the new total reload time
// attachments affecting damage stat are listed as their own weapons


export class TgdData { // TODO not really a model, yet it's in the models folder
  // TODO doing double work (iterates through the entire attachment object for both negative and positive effects)
  
  static async getPositiveEffects(attachment: any): Promise<any> { //, baseWeaponData) {
    return await TgdData.getAttachmentEffects(attachment, true)
  }
  
  static async getNegativeEffects(attachment: any): Promise<any> { //, baseWeaponData) {
    return await TgdData.getAttachmentEffects(attachment, false)
  }


  private static getEffectDisplayValue(attachment: string, value: number): string {
    let unit = TgdData.displayUnits.get(attachment)

    if(unit === TgdData.units.percent) {
      let calc = Math.round((value - 1) * 1000) / 10
      value = calc * (this.flipSign.has(attachment) ? -1 : 1)
    } else {
      value = Math.round(value * 100) / 100 // round to at most 2 decimals
    }
    return (value > 0 ? '+' : '') + (value) + ' ' + unit
  }

  private static async getAttachmentEffects(attachment: any, getPositiveEffects: boolean): Promise<any[]> {
    console.log(attachment)
    
    const arr: Array<any> = []
    let baseWeaponData = await TgdService.getWeaponData(attachment.gun)
    baseWeaponData = baseWeaponData[1]   
    
    for(let mod in attachment) {
      const positiveModEffect = TgdData.positiveModEffect.get(mod)

      let comparableEffect: number // positive effect = pro, negative effect = con, neutral effect = none
      if(positiveModEffect) {
        
        let value = attachment[mod]
        if(TgdData.missingMods.has(mod)) {
          
          const difference = value - baseWeaponData[mod]
          if(difference != 0) {
            if(positiveModEffect === TgdData.positiveEffects.positive) {
              comparableEffect = value - baseWeaponData[mod]
            } else if(positiveModEffect === TgdData.positiveEffects.negative) {
              comparableEffect = baseWeaponData[mod] - value
            }

            // special - calc reload mod value
            if(mod == TgdData.mods.reload) {
              value -= baseWeaponData.reload
            }
          }
        } else if(positiveModEffect === TgdData.positiveEffects.greaterThan1) {
          comparableEffect = value - 1
        } else if(positiveModEffect === TgdData.positiveEffects.lessThan1) {
          comparableEffect = (value - 1) * -1
        } else if(positiveModEffect === TgdData.positiveEffects.negative) {
          comparableEffect = value * -1
        }

        const obj: object = {
          key: TgdData.displayNames.get(mod),
          value: TgdData.getEffectDisplayValue(mod, value)
        }
        if(comparableEffect > 0 && getPositiveEffects) {
          arr.push(obj)
        } else if(comparableEffect < 0 && !getPositiveEffects) {
          arr.push(obj)
        }
      }
    }
    return arr
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
  }

  private static missingMods: Set<string> = new Set([
    TgdData.mods.reload,
    TgdData.mods.mag_size,
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
    [TgdData.mods.mag_size, TgdData.units.rounds],
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
