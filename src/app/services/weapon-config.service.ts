import { Injectable } from '@angular/core';
import { WeaponConfig } from 'src/app/models/WeaponConfig'

@Injectable({
  providedIn: 'root'
})

export class WeaponConfigService {

  private attachmentBlocks: Map<string, string> = new Map([ // since it's not supplied by the tgd backend
    ['Singuard Arms Whisper', 'muzzle'], // kilo
    ['FSS 12.4 Predator', 'muzzle'], // m4
    ['Tempus Cyclone', 'muzzle'], // m13
    ['ZLR 18 Deadfall', 'muzzle'], // fennec
    ['23.0 Romanian', 'underbarrel'], // ak-47
    ['26 Bull Barrel', 'muzzle'], // HDR
    ['17.2 Bull Barrel', 'muzzle'], // HDR
    ['Monolithic Integral Suppressor', 'muzzle'], // MP5
  ])
  public editStatus = { UNEQUIPPED: 1, EQUIPPED: 2,  TOOMANY: 3, BLOCKED: 4 }

  private maxAttachments: number = 5

  constructor() {
  }

  getWeaponConfig(slot: number): WeaponConfig {
    let weaponConfig = window.sessionStorage.getItem('' + slot)
    return JSON.parse(weaponConfig)
  }

  getArmouryConfigs(weaponName: string): WeaponConfig[] {
    return JSON.parse(window.localStorage.getItem(weaponName))
  }

  // obs_getComparisonConfigs(): Observable<WeaponConfig[]> {
  //   let arr: WeaponConfig[] = []

  //   for(let i = 0; i < window.sessionStorage.length; i ++) {
  //     let key = window.sessionStorage.key(i)
  //     arr.push(JSON.parse(window.sessionStorage.getItem(key)))
  //   }
  //   return of(arr)
  // }

  getComparisonConfigs(): WeaponConfig[] {
    let arr: WeaponConfig[] = []

    for(let i = 0; i < window.sessionStorage.length; i ++) {
      let key = window.sessionStorage.key(i)
      arr.push(JSON.parse(window.sessionStorage.getItem(key)))
    }
    return arr
  }

  saveConfig(weaponConfig: WeaponConfig, isArmoryConfig: boolean = false): void {
    if(isArmoryConfig) {
      const weaponConfigs = this.getArmouryConfigs(weaponConfig.weaponName) || {}
      weaponConfigs[weaponConfig.armouryName] = weaponConfig
      window.localStorage.setItem(weaponConfig.weaponName, JSON.stringify(weaponConfigs))
    } else {
      window.sessionStorage.setItem('' + weaponConfig.comparisonSlot, JSON.stringify(weaponConfig))
    }
  }

  deleteConfig(slot: number) {
    window.sessionStorage.removeItem('' + slot)
  }

  getNextFreeComparisonSlot(): number {
    let temp = this.getComparisonConfigs()   
    if(temp.length) {
      temp.sort((a, b) => b.comparisonSlot - a.comparisonSlot)
      return temp[0].comparisonSlot + 1
    }
    return 0
  }

  getIterableNrOfEmptyAttachmentSlots(weaponConfig: WeaponConfig) { // for angular iterator (*ngFor)
    return new Array(this.maxAttachments - Object.keys(weaponConfig.attachments).length)
  }
  
  getFullWeaponType(weaponConfig: WeaponConfig): string {
    if(weaponConfig.weaponType) {
      const menuPathToWeaponType: Map<string, string> = new Map([
        ['assault rifles', 'Assault Rifle'],
        ['smgs', 'Sub Machine Gun'],
        ['lmgs', 'Light Machine Gun'],
        ['marksman rifles', 'Marksman Rifle'],
        ['sniper rifles', 'Sniper Rifle']
      ])
      
      return menuPathToWeaponType.get(weaponConfig.weaponType)
    }
    return null
  }

  setAttachment(saveSlot: number, attachmentSlot: string, attachmentName: string): number {
    let weaponConfig = this.getWeaponConfig(saveSlot)

    if(this.getBlockingAttachment(weaponConfig, attachmentSlot)) {
      return this.editStatus.BLOCKED
    } else if(weaponConfig.attachments[attachmentSlot] === attachmentName) {
      // same as selected attachment. unequip
      delete weaponConfig.attachments[attachmentSlot]
      this.saveConfig(weaponConfig)
      return this.editStatus.UNEQUIPPED
    } else if(Object.keys(weaponConfig.attachments).length >= 5 && !weaponConfig.attachments.hasOwnProperty(attachmentSlot)) {
      // there are already 5 attachments and the requested swap was not for a used type
      return this.editStatus.TOOMANY
    } else {
      const blockedAttachment = this.attachmentBlocks.get(attachmentName)
      if(blockedAttachment) {
        // remove blocked attachment
        delete weaponConfig.attachments[blockedAttachment]
      }
      weaponConfig.attachments[attachmentSlot] = attachmentName
      this.saveConfig(weaponConfig)
      return this.editStatus.EQUIPPED
    }
  }

  removeAttachment(weaponConfig: WeaponConfig, attachmentSlot: string): void {
    delete weaponConfig.attachments[attachmentSlot]
    this.saveConfig(weaponConfig)
  }

    
  getBlockingAttachment(weaponConfig: WeaponConfig, attachmentSlot: string): string {
    if(attachmentSlot) {
      for(const configAttachmentSlot in weaponConfig.attachments) {
        const attachmentName: string = weaponConfig.attachments[configAttachmentSlot]
        
        if(this.attachmentBlocks.get(attachmentName) === attachmentSlot) {
          return attachmentName
        }
      }
    }
    return null
  }

  getSelectedAttachmentName(slot: number, attachmentType: string): string {
    let weaponConfig = this.getWeaponConfig(slot)
    if(!weaponConfig.attachments) {
      return null
    }
    return weaponConfig.attachments[attachmentType]
  }
}
