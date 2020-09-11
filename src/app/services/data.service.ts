import { Injectable } from '@angular/core';
import { WeaponDamage } from 'src/app/models/TGD/WeaponDamage';
import { AttachmentData, TGDData, WeaponData } from 'src/app/models/TGD/Data';
import { TgdFormatter } from '../functions/TgdFormatter';
import { Effect } from 'src/app/models/Effect';
import { TgdFetch } from 'src/app/functions/TgdFetch';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private menuToTGDWeaponTypes: Map<string, string> = new Map([ // keys = for menu display / used in path. values = tgd form data
    ['assault rifles', 'AR'],
    ['smgs', 'SMG'],
    ['lmgs', 'LMG'],
    ['marksman rifles', 'MR'],
    ['sniper rifles', 'SR']
  ])

  private weapons = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR-56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker 45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen Mk9', 'FiNN LMG'], // 'FiNN LMG Factory Adverse'],
    marksmanrifles: ['EBR', 'Mk2 Carbine', 'Kar98k', 'Crossbow', 'SKS'], // EBR-14
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // TODO keep only to make browsable?
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }

  // Cache VARS
  private weaponTypesData: Array<Array<string>> = [] // Object<Array<string>>
  private weaponData: Array<(Array<(Array<WeaponDamage> | AttachmentData)>)> = [] // P.I.T.A. typing. not actually Arrays. objects
  private attachmentData: Array<Array<AttachmentData>> = []
  private summaryData: Map<string, any> = new Map() // uses stringifed WeaponConfig as key

  constructor() {
  }

  getWeaponTypes(): string[] {
    return Array.from(this.menuToTGDWeaponTypes.keys())
  }

  /**
   * Fetches and caches weapons
   * @param type
   */
  async tgd_getWeapons(type: string): Promise<string[]> { // TODO should use this one, but I don't like how he's displaying different versions of the same weapons sometimes
    const tgdType = this.menuToTGDWeaponTypes.get(type)
    
    if(type) {
      if(!this.weaponTypesData[tgdType]) {
        this.weaponTypesData[tgdType] = []
        const weapons = await TgdFetch.getWeaponsData(tgdType)
        for(const weapon of weapons) {
          this.weaponTypesData[tgdType].push(weapon[0])
        }
      }

      return this.weaponTypesData[tgdType]
    }
    return null
  }
  
  /**
   * @deprecated Uses internally listed weapons
   * @param type
   */
  getWeapons(type: string): string[] {
    if(type) {
      return this.weapons[type.split(' ').join('')]
    }
    return null
  }

  /**
   * Fetches and caches attachment data for the given weapon
   */
  async getAvailableAttachmentSlots(weaponName: string): Promise<Set<string>> {  
    let result = await this.getAllAttachmentData(weaponName)
    
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
    let attachmentData = await this.getAllAttachmentData(weaponName)
    attachmentData = attachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentType)

    return this.extractAttachmentEffects(weaponName, attachmentData)
  }

  /**
   *  Used by gunsmith summary
   * @param weaponConfig
   */
  async getAllAttachmentEffects(weaponConfig: WeaponConfig): Promise<Array<Map<string, Effect>>> {
    const rawData = await this.getAllAttachmentData(weaponConfig.weaponName)
    
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
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<Map<string, Effect>> {
    const ordered = Object.values(weaponConfig.attachments).sort() 
    const cacheKey = weaponConfig.weaponName + JSON.stringify(ordered)
   
    const baseWeaponData = await this.getBaseWeaponData(weaponConfig.weaponName)
    if(!this.summaryData.has(cacheKey)) {
      this.summaryData.set(cacheKey, await TgdFetch.getWeaponSummaryData(weaponConfig)) // cache data
    }
    const result: AttachmentData = this.summaryData.get(cacheKey) || {} // get cached data

    return TgdFormatter.getAttachmentEffects(result, baseWeaponData[baseWeaponData.length - 1] as WeaponData, true)
  }

  /**
   * Formats raw data to printable effects
   * @param weaponName
   * @param attachmentsData 
   */
  private async extractAttachmentEffects(weaponName: string, attachmentsData: AttachmentData[]): Promise<Array<Map<string, Effect>>> {
    const attachmentSummary: Array<Map<string, Effect>> = []
        
    const weaponData = await this.getBaseWeaponData(weaponName)
    for(let attachmentSlot in attachmentsData) {
      const attachmentData = attachmentsData[attachmentSlot]

      attachmentSummary[attachmentData.attachment] = TgdFormatter.getAttachmentEffects(attachmentData, weaponData[1] as WeaponData)
    }
    
    return attachmentSummary
  }

  /**
   * Used internally. Fetches raw attachment data for all the attachments equipped in the config and caches retrieved data in a variable
   * @param weaponName
   */
  private async getAllAttachmentData(weaponName: string): Promise<AttachmentData[]> {
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
      console.log('fetching base weapon data')
      result = await TgdFetch.getBaseWeaponData(weaponName)
      this.weaponData[weaponName] = result
    } else {
      result = this.weaponData[weaponName]
    }
    
    return result
  }

}
