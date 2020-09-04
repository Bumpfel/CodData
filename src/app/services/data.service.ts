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
  private attachmentData: any = {} // cache var
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

}
