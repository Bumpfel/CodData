import { Injectable } from '@angular/core';
import { WeaponConfig } from '../models/WeaponConfig'

@Injectable({
  providedIn: 'root'
})

export class WeaponConfigService {
    
  private weaponTypes: string[] = ['assault rifles', 'smgs', 'shotguns', 'lmgs', 'marksman rifles', 'sniper rifles', 'handguns']
  private attachments: object = {
    muzzle: ['Flash Guard', 'Tactical Suppressor', 'Breacher Device', 'Muzzle Brake', 'Lightweight Suppressor', 'Compensator', 'Monolithic Suppressor'],
    barrel: ['Singuard Arms 16.6" SOCOM', 'Singuard Arms Whisperer'],
    laser: ['5mW Laser', 'Tac Laser', '1mW Laser'],
    optic: ['Operator Reflex Sight', 'Corp Combat Holo Sight', 'G.I. Mini Reflex', 'VLK 3.0x Otpic'],
    stock: ['FSS Close Quarters Stock', 'No Stock'],
    underbarrel: ['Commando Foregrip', 'Merc Foregrip'],
    triggerAction: [],
    ammunition: ['50 Round Mags', '60 Round Mags'],
    rearGrip: ['Stippled Grip Tape', 'Granulated Grip Tape'],
    perk: ['Sleight of Hand']
  }

  private weapons: object = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR 56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker 45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen MK9'],
    marksmanrifles: ['EBR-14', 'MK2 Carbine', 'Kar98K', 'Crossbow', 'SKS'],
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // TODO keep only to make browsable?
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }

  public editStatus = { UNEQUIPPED: 1, EQUIPPED: 2,  TOOMANY: 3}

  // private weaponConfig: WeaponConfig // TODO possibly phase this one out and pass this data as arguments in the methods instead

  constructor() {
    // this.getActiveConfig()
  }

  getWeaponTypes(): string[] {
    return this.weaponTypes
  }

  getWeapons(type: string): string[] {
    if(type) {
      return this.weapons[type.split(' ').join('')]
    }
    return null
  }

  getAvailableAttachments(): object {
    return this.attachments
  }

  getAttachments(attachmentType: string): string[] {
    return this.attachments[attachmentType]
  }

  getSelectedAttachment(slot: number, attachmentType: string): string {
    // return this.weaponConfig.attachments[attachmentType]
    let weaponConfig: WeaponConfig = this.getWeaponConfig(slot)
    if(!weaponConfig.attachments) {
      return null
    }
    return weaponConfig.attachments[attachmentType]
  }

  getWeaponConfig(slot: number): WeaponConfig {
    // return this.weaponConfig
    let weaponConfig = window.sessionStorage.getItem('' + slot)
    return JSON.parse(weaponConfig)
  }

  // getActiveConfig(): WeaponConfig {
  //   let tempConfig = JSON.parse(window.sessionStorage.getItem('activeConfig')) // TODO change to slot nr
  //   return tempConfig
  // }

  getAllComparisonConfigs(): WeaponConfig[] {
    let arr: WeaponConfig[] = []

    for(let i = 0; i < window.sessionStorage.length; i ++) {
      let key = window.sessionStorage.key(i)
      arr.push(JSON.parse(window.sessionStorage.getItem(key)))
    }
    return arr
  }

  // selectWeapon(weaponName: string): void {
  //   // TODO check that the weapon exists
  //   // TODO use weaponconfig class
  //   this.weaponConfig.weaponName = weaponName
  // }

  setAttachment(slot: number, type: string, weaponName: string) { // TODO return not typed
    let weaponConfig: WeaponConfig = this.getWeaponConfig(slot)

    if(weaponConfig.attachments[type] === weaponName) {
      // same as selected attachment. unequip
      delete weaponConfig.attachments[type]
      this.saveConfig(slot, weaponConfig)
      return this.editStatus.UNEQUIPPED
    } else if(Object.keys(weaponConfig.attachments).length >= 5 && !weaponConfig.attachments.hasOwnProperty(type)) {
      // there are already 5 attachments and the requested swap was not for a used type
      return this.editStatus.TOOMANY
    } else {
      weaponConfig.attachments[type] = weaponName
      this.saveConfig(slot, weaponConfig)
      return this.editStatus.EQUIPPED
    }
  }

  // setActiveConfig(config: WeaponConfig): void {
  //   if(!config) {
  //     let slot = this.getAllComparisonConfigs().length
  //     // console.log('--new config! saving to slot ' + slot)
  //     this.weaponConfig = new WeaponConfig(slot)
  //   } else {
  //     this.weaponConfig = config
  //   }
  // }

  getNextFreeComparisonSlot(): number {
    return this.getAllComparisonConfigs().length
  }

  saveConfig(slot: number, weaponConfig: WeaponConfig, isArmoryConfig: boolean = false, armouryName?: string): void {
    if(isArmoryConfig) {
      weaponConfig.armouryName = armouryName
      window.localStorage.setItem(name, JSON.stringify(weaponConfig))
    } else {
      window.sessionStorage.setItem('' + slot, JSON.stringify(weaponConfig))
    }
  }

  saveNewConfig(slot: number, weaponName: string): void {
    let weaponConfig = new WeaponConfig(slot, weaponName)
    window.sessionStorage.setItem('' + slot, JSON.stringify(weaponConfig))
  }
}
