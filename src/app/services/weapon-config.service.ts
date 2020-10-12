import { Injectable } from '@angular/core';
import { WeaponConfig } from 'src/app/models/WeaponConfig'
import { ConfigSaveResponse } from 'src/app/models/ConfigSaveResponse'
import { GlobalService } from './global.service';
import { DataService } from './data.service';

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

  private storageSaveName = 'configurations'

  private maxAttachments: number = 5

  constructor(private globalService: GlobalService, private dataService: DataService) {
  }

  getAllArmouryConfigs(): {[key:string]: {[key:string]: WeaponConfig}} {
    return JSON.parse(window.localStorage.getItem(this.storageSaveName)) || {}
  }

  getWeaponConfig(slot: number): WeaponConfig {
    const config = window.sessionStorage.getItem('' + slot)
    return JSON.parse(config)
  }

  getArmouryConfigs(weaponName: string): {[key:string]: WeaponConfig} {
    let weaponConfigs =  this.getAllArmouryConfigs()[weaponName]
    for(let key in weaponConfigs) {
      if(!weaponConfigs[key].weaponProfile) {
        weaponConfigs[key].weaponProfile = weaponConfigs[key].weaponName
        // this.saveConfig(weaponConfigs[key], true, true)
      }
    }
      return weaponConfigs
  }

  getComparisonConfigs(): WeaponConfig[] {
    let arr: WeaponConfig[] = []

    for(let i = 0; i < window.sessionStorage.length; i ++) {
      let key = window.sessionStorage.key(i)
      arr.push(JSON.parse(window.sessionStorage.getItem(key)))
    }
    return arr
  }

  /**
   * If isArmouryconfig, name is checked before it's saved. Returns true if name is ok
   * DOES NOT CHECK FOR DUPLICATES
   * @param weaponConfig
   * @param isArmouryConfig Saves config to sessionStorage, and also to localStorage if isAmouryConfig === true

   */
  saveConfig(weaponConfig: WeaponConfig, isArmouryConfig: boolean = false, updateComparisonConfig: boolean = true, isUpdate: boolean = false): ConfigSaveResponse {
    if(isArmouryConfig) {
      if(!weaponConfig.armouryName || weaponConfig.armouryName.trim().length === 0) {
        return ConfigSaveResponse.missingName
      }
      weaponConfig.armouryName = weaponConfig.armouryName.trim()
      if(weaponConfig.armouryName.length > WeaponConfig.maxNameLength) { // this only happens if the user removed the limitation. cutting it and saving without a warning is fine
        weaponConfig.armouryName = weaponConfig.armouryName.substr(0, WeaponConfig.maxNameLength)
      }

      if(this.configDuplicateExists(weaponConfig) === true) {
        return ConfigSaveResponse.duplicate
      }
      
      const allConfigs = this.getAllArmouryConfigs()
      const weaponConfigs = allConfigs[weaponConfig.weaponName] || {}
      weaponConfigs[weaponConfig.armouryName] = weaponConfig
      allConfigs[weaponConfig.weaponName] = weaponConfigs
      window.localStorage.setItem(this.storageSaveName, JSON.stringify(allConfigs))
    }
    if(updateComparisonConfig === true) {
      window.sessionStorage.setItem('' + weaponConfig.comparisonSlot, JSON.stringify(weaponConfig))
    }
    return isUpdate ? ConfigSaveResponse.updated : ConfigSaveResponse.savedNew
  }

  /**
   * returns false if duplicate was found
   * @param oldConfig
   * @param newName 
   * @param updateComparisonConfig 
   */
  renameArmouryConfig(oldConfig: WeaponConfig, newName: string, updateComparisonConfig: boolean = false): ConfigSaveResponse {
    let newConfig: WeaponConfig = { ...oldConfig }
    newConfig.armouryName = newName
   
    if(!newName || newName.trim().length == 0) {      
      return ConfigSaveResponse.missingName
    } else if(oldConfig.armouryName !== newName && this.configDuplicateExists(newConfig)) {
      return ConfigSaveResponse.duplicate
    }
  
    this.deleteArmouryConfig(oldConfig)
    oldConfig.armouryName = newName

    return this.saveConfig(newConfig, true, updateComparisonConfig, true)
  }

  deleteArmouryConfig(weaponConfig: WeaponConfig): void {
    const allConfigs = this.getAllArmouryConfigs()
    delete allConfigs[weaponConfig.weaponName][weaponConfig.armouryName]
    window.localStorage.setItem(this.storageSaveName, JSON.stringify(allConfigs))
  }

  /**
   * Checks if this weapon has a config with the armouryName in the argument
   */
  private configDuplicateExists(config: WeaponConfig): boolean {   
    const armouryConfigs = this.getArmouryConfigs(config.weaponName) || {}
    return armouryConfigs[config.armouryName.trim()] !== undefined
  }

  deleteComparisonConfig(slot: number) {
    window.sessionStorage.removeItem('' + slot)
  }

  getNextFreeComparisonSlot(): number {
    let temp = this.getComparisonConfigs()
    if(temp.length) {
      temp.sort((a, b) => b.comparisonSlot - a.comparisonSlot)
      return temp[0].comparisonSlot + 1
    }
    return 1
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
      // Same as selected attachment. Unequip
      this.removeAttachment(weaponConfig, attachmentSlot)
      return this.editStatus.UNEQUIPPED
    
    } else if(Object.keys(weaponConfig.attachments).length >= 5 && !weaponConfig.attachments.hasOwnProperty(attachmentSlot)) {
      // There are already 5 attachments and the requested swap was not for a used type
      return this.editStatus.TOOMANY

    } else {
      // Attachment will be equipped
      const blockedAttachment = this.attachmentBlocks.get(attachmentName)
      if(blockedAttachment) {
        // remove blocked attachment
        delete weaponConfig.attachments[blockedAttachment]
      }
      weaponConfig.attachments[attachmentSlot] = attachmentName
      
      // set or unset special profile in WeaponConfig
      const specialProfiles = this.dataService.getSpecialAttachmentProfiles(weaponConfig.weaponName, attachmentSlot)
      for(const profile of specialProfiles) {
        if(profile.attachmentName === attachmentName) {
          weaponConfig.weaponProfile = profile.profileName
          break
        } else {
          weaponConfig.weaponProfile = weaponConfig.weaponName
        }
      }
      
      this.saveConfig(weaponConfig)
      return this.editStatus.EQUIPPED
    }
  }

  removeAttachment(weaponConfig: WeaponConfig, attachmentSlot: string): void {
    delete weaponConfig.attachments[attachmentSlot]
    const specialProfiles = this.dataService.getSpecialAttachmentProfiles(weaponConfig.weaponName, attachmentSlot)
    
    // unequipped slot made the WeaponProfile a "special profile"
    for(const profile of specialProfiles) {      
      if(profile.attachmentSlot === attachmentSlot) {
        weaponConfig.weaponProfile = weaponConfig.weaponName
      }
    }
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
