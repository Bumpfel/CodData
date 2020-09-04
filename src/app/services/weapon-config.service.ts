import { Injectable } from '@angular/core';
import { WeaponConfig } from '../models/WeaponConfig'
import { Attachment } from '../models/TGD/Attachment'
import { TgdService } from './tgd.service'
import { TgdData } from '../models/TgdData';
import { Effect } from '../models/Effect';
import { WeaponDamage } from '../models/TGD/WeaponDamage';

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
  ])

  private weaponTypes: string[] = ['assault rifles', 'smgs', 'shotguns', 'lmgs', 'marksman rifles', 'sniper rifles', 'handguns']

  private weapons: object = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR 56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker 45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen MK9'],
    marksmanrifles: ['EBR', 'MK2 Carbine', 'Kar98K', 'Crossbow', 'SKS'], // EBR-14
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // TODO keep only to make browsable?
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }

  public editStatus = { UNEQUIPPED: 1, EQUIPPED: 2,  TOOMANY: 3, BLOCKED: 4 }

  private weaponData: any = {} // cache var
  private attachmentData: any = {} // cache var
  private summaryData: Map<string, any> = new Map() // cache var. uses stringifed WeaponConfig as key
  private maxAttachments: number = 5

  constructor() {
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

  async getWeaponData(weaponName: string): Promise<(WeaponDamage[] | Attachment)[]> {
    let result: (WeaponDamage[] | Attachment)[]

    if(!this.weaponData[weaponName]) {
      result = await TgdService.getWeaponData(weaponName)
      this.weaponData[weaponName] = result
    } else {
      result = this.weaponData[weaponName]
    }   
    
    return result
  }
  
  async getAttachmentEffects(attachment: Attachment, weaponName: string): Promise<Map<string, Effect>> { // passing weaponName to avoid hidden dep., even though that data exists on the tgd attachment
    const weaponData = await this.getWeaponData(weaponName)
    return TgdData.getAttachmentEffects(attachment, weaponData[1])
  }

  async getAvailableAttachmentSlots(weaponName: string): Promise<Set<string>> {  
    let result: Attachment[] = await this.getAttachmentData(weaponName)
    
    let attachmentSlots: Set<string> = new Set()
    result.forEach(attachment => attachmentSlots.add(attachment.slot.toLowerCase()))

    return attachmentSlots
  }
  
  async getAttachments(weaponName: string, attachmentType: string): Promise<Attachment[]> {
    let result = await this.getAttachmentData(weaponName)
    result = result.filter(attachment => attachment.slot.toLowerCase() === attachmentType)     

    return result
  }

  /**
   * Used internally. Fetches raw attachment data and caches retrieved data in a variable
   * @param weaponName
   */
  private async getAttachmentData(weaponName: string): Promise<Attachment[]> {
    let result: Attachment[]
    
    if(!this.attachmentData[weaponName]) {
      result = await TgdService.getAttachmentData(weaponName)
      this.attachmentData[weaponName] = result
    } else {
      result = this.attachmentData[weaponName]
    }
    
    return result
  }

  /**
   * Fetches stats data for each attachment and a summary of all the attachment effects
   * @param weaponConfig 
   */
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<any> {
    // create new object to prevent modifying original
    let tempConfig: WeaponConfig = JSON.parse(JSON.stringify(weaponConfig))
    delete tempConfig.comparisonSlot
    const key = JSON.stringify(tempConfig)
    
    const baseWeaponData = await this.getWeaponData(weaponConfig.weaponName)
    if(!this.summaryData.has(key)) {
      this.summaryData.set(key, await TgdService.getWeaponSummaryData(weaponConfig)) // cache data
    }
    const result: any[] = this.summaryData.get(key) // get cached data

    return TgdData.getAllWeaponEffects(result, baseWeaponData[baseWeaponData.length - 1])
  }

  getSelectedAttachmentName(slot: number, attachmentType: string): string {
    let weaponConfig: WeaponConfig = this.getWeaponConfig(slot)
    if(!weaponConfig.attachments) {
      return null
    }
    return weaponConfig.attachments[attachmentType]
  }
  
  getBlockingAttachment(weaponConfig: WeaponConfig, attachmentSlot: string): string {
    if(attachmentSlot) {
      for(const configAttachmentSlot in weaponConfig.attachments) {
        const attachment = weaponConfig.attachments[configAttachmentSlot]
        
        if(this.attachmentBlocks.get(attachment) === attachmentSlot) {
          return attachment
        }
      }
    }
    return null
  }

  getWeaponConfig(slot: number): WeaponConfig {
    let weaponConfig = window.sessionStorage.getItem('' + slot)
    return JSON.parse(weaponConfig)
  }

  getArmouryConfigs(weaponName: string): WeaponConfig[] {
    return JSON.parse(window.localStorage.getItem(weaponName))
  }

  getComparisonConfigs(): WeaponConfig[] {
    let arr: WeaponConfig[] = []

    for(let i = 0; i < window.sessionStorage.length; i ++) {
      let key = window.sessionStorage.key(i)
      arr.push(JSON.parse(window.sessionStorage.getItem(key)))
    }
    return arr
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

  saveConfig(weaponConfig: WeaponConfig, isArmoryConfig: boolean = false): void {
    if(isArmoryConfig) {
      // TODO save as array with weaponName as key
      window.localStorage.setItem(weaponConfig.armouryName, JSON.stringify(weaponConfig))
    } else {
      window.sessionStorage.setItem('' + weaponConfig.comparisonSlot, JSON.stringify(weaponConfig))
    }
  }

  setAttachment(saveSlot: number, attachmentSlot: string, attachmentName: string): any { // TODO return not typed
    let weaponConfig: WeaponConfig = this.getWeaponConfig(saveSlot)

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
}
