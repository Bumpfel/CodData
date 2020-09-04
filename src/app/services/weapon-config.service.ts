import { Injectable } from '@angular/core';
import { WeaponConfig } from '../models/WeaponConfig'
import { TGDData, AttachmentData, WeaponData } from '../models/TGD/Data'
import { TgdFetch } from '../functions/TgdFetch'
import { TgdFormatter } from '../functions/TgdFormatter';
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

  private weapons = {
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

  private weaponData: Array<(Array<(Array<WeaponDamage> | AttachmentData)>)> = [] // cache var. PITA typing
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
  
  async getAvailableAttachmentSlots(weaponName: string): Promise<Set<string>> {  
    let result = await this.getAttachmentsData(weaponName)
    
    let attachmentSlots: Set<string> = new Set()
    result.forEach(attachment => attachmentSlots.add(attachment.slot.toLowerCase()))

    return attachmentSlots
  }
  
  /**
   * 
   * @param weaponName 
   * @param attachmentType 
   */
  // TODO used by attachment-select only. should be private. attachment-select should not deal with raw DATA
  async getAttachmentsOfType(weaponName: string, attachmentType: string): Promise<AttachmentData[]> {
    let result = await this.getAttachmentsData(weaponName)
    result = result.filter(attachment => attachment.slot.toLowerCase() === attachmentType)

    return result
  }

  /**
   * Fetches RAW attachment data
   * @param weaponName
   * @param attachmentName 
   */
  // TODO used by gunsmith only. should be private. gunsmith should not deal with raw data
  async getAttachmentData(weaponName: string, attachmentName: string): Promise<AttachmentData> {
    let result = await this.getAttachmentsData(weaponName)
    result = result.filter(attachment => attachment.attachment === attachmentName)
    
    return result[0]
  }

  /**
   * Fetches and formats the effects of an attachment or weapon into displayable values
   * @param attachment
   * @param weaponName
   */
  // TODO should not have TGDData as parameter
  async getEffects(tgdData: TGDData, weaponName: string): Promise<Map<string, Effect>> { // passing weaponName to avoid hidden dep., even though that data exists on the tgd attachment
    const weaponData = await this.getWeaponData(weaponName)
    return TgdFormatter.getAttachmentEffects(tgdData, weaponData[1] as WeaponData)
  }


  /**
   * Used internally. Fetches raw attachment data and caches retrieved data in a variable
   * @param weaponName
   */
  private async getAttachmentsData(weaponName: string): Promise<AttachmentData[]> {
    let result: AttachmentData[]
    
    if(!this.attachmentData[weaponName]) {
      result = await TgdFetch.getAttachmentData(weaponName)
      this.attachmentData[weaponName] = result
    } else {
      result = this.attachmentData[weaponName]
    }
    
    return result
  }
  
  /**
   * Internal method that fetches raw weapon damage data w. ranges drop-offs, and base weapon data
   * @param weaponName
   */
  private async getWeaponData(weaponName: string): Promise<Array<(Array<WeaponDamage> | WeaponData)>> {
    let result: (WeaponDamage[] | AttachmentData)[]
    
    if(!this.weaponData[weaponName]) {
      result = await TgdFetch.getWeaponData(weaponName)
      this.weaponData[weaponName] = result
    } else {
      result = this.weaponData[weaponName]
    }
    
    return result
  }

  /**
   * Fetches weapon stats summary
   * @param weaponConfig 
   */
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<Map<string, Effect>> {
    // create new object to prevent modifying original
    let tempConfig: WeaponConfig = JSON.parse(JSON.stringify(weaponConfig))
    delete tempConfig.comparisonSlot
    const key = JSON.stringify(tempConfig)
    
    const baseWeaponData = await this.getWeaponData(weaponConfig.weaponName)
    if(!this.summaryData.has(key)) {
      this.summaryData.set(key, await TgdFetch.getWeaponSummaryData(weaponConfig)) // cache data
    }
    const result: AttachmentData = this.summaryData.get(key) || {} // get cached data

    return TgdFormatter.getAttachmentEffects(result, baseWeaponData[baseWeaponData.length - 1] as WeaponData)
  }

  getSelectedAttachmentName(slot: number, attachmentType: string): string {
    let weaponConfig = this.getWeaponConfig(slot)
    if(!weaponConfig.attachments) {
      return null
    }
    return weaponConfig.attachments[attachmentType]
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
}
