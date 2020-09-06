import { Injectable } from '@angular/core';
import { WeaponDamage } from '../models/TGD/WeaponDamage';
import { AttachmentData, TGDData, WeaponData } from '../models/TGD/Data';
import { TgdFormatter } from '../functions/TgdFormatter';
import { Effect } from '../models/Effect';
import { TgdFetch } from '../functions/TgdFetch';
import { WeaponConfig } from '../models/WeaponConfig';

@Injectable({
  providedIn: 'root'
})
export class DataService {

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

  private weaponData: Array<(Array<(Array<WeaponDamage> | AttachmentData)>)> = [] // cache var. PITA typing
  private attachmentData: Array<Array<AttachmentData>> = [] // cache var
  private summaryData: Map<string, any> = new Map() // cache var. uses stringifed WeaponConfig as key

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
   * Used by attachment-select
   * @param weaponName 
   * @param attachmentType 
   */
  async getAttachmentsEffectsOfType(weaponName: string,  attachmentType: string): Promise<Array<Map<string, Effect>>> {
    let attachmentData = await this.getAttachmentsData(weaponName)
    attachmentData = attachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentType)

    return this.extractAttachmentEffects(weaponName, attachmentData)
  }

  /**
   *  Used by gunsmith summary
   * @param weaponConfig
   */
  async getAllAttachmentEffects(weaponConfig: WeaponConfig): Promise<Array<Map<string, Effect>>> {
    const rawData = await this.getAttachmentsData(weaponConfig.weaponName)
    const attachmentNames: Set<string> = new Set()
    for(let attachmentSlot in weaponConfig.attachments) {
      attachmentNames.add(weaponConfig.attachments[attachmentSlot])
    }

    const attachmentsData = rawData.filter(attachment => attachmentNames.has(attachment.attachment))
    
    return this.extractAttachmentEffects(weaponConfig.weaponName, attachmentsData)
  }

  /**
   * Fetches weapon stats summary and returns formatted Effects. Used by gunsmith
   * @param weaponConfig 
   */
  // this is perfect. no need to re-structure
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<Map<string, Effect>> {
    // create new object to prevent modifying original
    let tempConfig: WeaponConfig = JSON.parse(JSON.stringify(weaponConfig))
    delete tempConfig.comparisonSlot
    const key = JSON.stringify(tempConfig)
    
    const baseWeaponData = await this.getBaseWeaponData(weaponConfig.weaponName)
    if(!this.summaryData.has(key)) {
      this.summaryData.set(key, await TgdFetch.getWeaponSummaryData(weaponConfig)) // cache data
    }
    const result: AttachmentData = this.summaryData.get(key) || {} // get cached data

    return TgdFormatter.getAttachmentEffects(result, baseWeaponData[baseWeaponData.length - 1] as WeaponData)
  }

  /**
   * Formats raw data to printable effects
   * @param weaponName
   * @param attachmentsData 
   */
  private async extractAttachmentEffects(weaponName: string, attachmentsData): Promise<Array<Map<string, Effect>>> {
    const attachmentSummary: Array<Map<string, Effect>> = []
    
    for(let attachmentSlot in attachmentsData) {
      const attachmentData = attachmentsData[attachmentSlot]
      const weaponData = await this.getBaseWeaponData(weaponName)
      attachmentSummary[attachmentData.attachment] = TgdFormatter.getAttachmentEffects(attachmentData, weaponData[1] as WeaponData)
    }
    
    return attachmentSummary
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
   * Internal method that fetches and caches raw weapon damage data w. ranges drop-offs, and base weapon data
   * @param weaponName
   */
  private async getBaseWeaponData(weaponName: string): Promise<Array<(Array<WeaponDamage> | WeaponData)>> {
    let result: (WeaponDamage[] | AttachmentData)[]
    
    if(!this.weaponData[weaponName]) {
      result = await TgdFetch.getBaseWeaponData(weaponName)
      this.weaponData[weaponName] = result
    } else {
      result = this.weaponData[weaponName]
    }
    
    return result
  }

}
