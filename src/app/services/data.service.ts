import { Injectable } from '@angular/core';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { BaseData, DamageInterval, SummaryData, TGDData } from 'src/app/models/TGD/Data';
import { TgdFormatterService } from 'src/app/services/tgd/tgd-formatter.service';
import { TgdFetchService } from 'src/app/services/tgd/tgd-fetch.service';
import { Effect } from 'src/app/models/Effect';
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
  private tgdToDisplayWeaponTypes: Map<string, string> = new Map([
    ['AR', 'assault rifles'],
    ['SMG', 'smgs'],
    ['LMG', 'lmgs'],
    ['MR', 'marksman rifles'],
    ['SR', 'sniper rifles']
  ])

  private weapons = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR-56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker-45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen Mk9', 'FiNN LMG', 'FiNN LMG Factory Adverse'],
    marksmanrifles: ['EBR', 'Mk2 Carbine', 'Kar98k', 'Crossbow', 'SKS'], // EBR-14
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // TODO keep only to make browsable?
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }

  private weaponIdentifiers: string[] = [ // will only work for my weapon list. not for tgd weapons (since my weapon list is already sorted)
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 
    'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'x-ray', 'yankee', 'zulu'
  ]

    // Cache VARS
  private weaponNamesData: { [key: string]:  Promise<string[][]> } = {}
  private weaponData: { [key: string]: Promise<BaseData> } = {} // P.I.T.A. typing
  private summaryData: Map<string, Promise<SummaryData>> = new Map() // uses stringifed WeaponConfig as key
  private attachmentData: { [key: string]: Promise<TGDData[]> } = {}

  constructor(private formatterService: TgdFormatterService, private fetchService: TgdFetchService) {
  }
  
  getHitboxes():{[key: string]: string} {
    return this.formatterService.getHitboxes()
  }

  getWeaponTypes(): string[] {
    return Array.from(this.menuToTGDWeaponTypes.keys())
  }

  async getWeaponType(weaponName: string): Promise<string> {
    const weaponData =  await this.getBaseWeaponData(weaponName)
    const type = weaponData[1].type
    
    return this.tgdToDisplayWeaponTypes.get(type)
  }

  getWeaponSortIdentifier(weaponConfig: WeaponConfig): string {
    const index = this.weapons[weaponConfig.weaponType.split(' ').join('')].indexOf(weaponConfig.weaponName)
    return this.weaponIdentifiers[index]
  }

  cacheWeapons(): void{
    for(const tgdType of this.menuToTGDWeaponTypes.keys()) {
      this.getWeaponNames(tgdType)
    }
  }

  /**
   * @deprecated Uses internally listed weapons
   * @param type
   */
  static_getWeaponNames(type: string): string[] {
    // if(type) {
      return this.weapons[type.split(' ').join('')]
    // }
    // return null
  }

  /**
   * Fetches and caches weapon names data
   * @param type
   */
  async getWeaponNames(type: string): Promise<string[]> {
    const tgdType = this.menuToTGDWeaponTypes.get(type)
    
    const arr = []
    if(!this.weaponNamesData[tgdType]) {
      this.weaponNamesData[tgdType] = this.fetchService.getWeaponsData(tgdType)
    }
    const weapons = await this.weaponNamesData[tgdType]
    
    for(const weapon of weapons) {
      arr.push(weapon[0])
    }

    return arr
  }

  /**
   * Fetches attachment data for the given weapon
   */
  async getAvailableAttachmentSlots(weaponName: string): Promise<Array<string>> {  
    const result = await this.getBaseWeaponData(weaponName)
 
    return result.slot_names
  }

  /**
   * Used by attachment-select
   * @param weaponName 
   * @param attachmentType 
   */
  async getAttachmentsEffectsOfType(weaponName: string,  attachmentType: string): Promise<{[key: string]: Map<string, Effect>}> {
    let attachmentData = await this.getAllAttachmentData(weaponName)
    attachmentData = attachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentType)

    return this.extractAttachmentEffects(weaponName, attachmentData)
  }

  /**
   *  Used by gunsmith summary
   * @param weaponConfig
   */
  async getAllAttachmentEffects(weaponConfig: WeaponConfig): Promise<{[key: string]: Map<string, Effect>}> {
    const rawData = await this.getAllAttachmentData(weaponConfig.weaponName)
    
    const attachmentNames: Set<string> = new Set()
    for(let attachmentSlot in weaponConfig.attachments) {
      attachmentNames.add(weaponConfig.attachments[attachmentSlot])
    }

    const attachmentsData = rawData.filter(attachment => attachmentNames.has(attachment.attachment))
    
    return this.extractAttachmentEffects(weaponConfig.weaponName, attachmentsData)
  }


  async getBaseDamageIntervals(weaponName: string, weaponProfile?: string): Promise<DamageInterval[]> { // TODO returnerar TGD DATA, vilket skapar beroenden. borde formatera här
    const result = await this.getBaseWeaponData(weaponName)
    return result.damage_data[weaponProfile] || result.damage_data['Default']
  }

  /**
   * Fetches weapon stats summary and returns formatted Effects. Used by gunsmith
   * @param weaponConfig 
   */
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<Map<string, Effect>> {
    const ordered = Object.values(weaponConfig.attachments).sort()
    const cacheKey = weaponConfig.weaponName + JSON.stringify(ordered)   
   
    const baseWeaponData = await this.getBaseWeaponData(weaponConfig.weaponName)

    this.mapToSummaryData(weaponConfig)

    if(!this.summaryData.has(cacheKey)) {
      this.summaryData.set(cacheKey, this.fetchService.getWeaponSummaryData(weaponConfig.weaponName, weaponConfig.attachments)) // cache data
    }
    const result: TGDData = await this.summaryData.get(cacheKey) || {} // get cached data

    return this.formatterService.getAttachmentEffects(result, baseWeaponData, true)
  }

  async mapToSummaryData(weaponConfig: WeaponConfig) {
    const baseWeaponData = await this.getBaseWeaponData(weaponConfig.weaponName)

    const data = Array.of(baseWeaponData)
    // console.log(weaponConfig.attachments)
    // console.log(await this.getAllAttachmentData(weaponConfig.weaponName))
    
    
    const attachmentData = (await this.getAllAttachmentData(weaponConfig.weaponName)).filter(attachment => Object.values(weaponConfig.attachments).includes(attachment.attachment))
    const mappedData = attachmentData.map(attachment => Object.keys(attachment))
    console.log(attachmentData)
   
  }

  /**
   * Formats raw data to printable effects
   * @param weaponName
   * @param attachmentsData 
   */
  private async extractAttachmentEffects(weaponName: string, attachmentsData: TGDData[]): Promise<{[key: string]: Map<string, Effect>}> {
    const attachmentSummary: {[key: string]: Map<string, Effect>} = {}
        
    const weaponData = await this.getBaseWeaponData(weaponName)
    for(let attachmentSlot in attachmentsData) {
      const attachmentData = attachmentsData[attachmentSlot]

      attachmentSummary[attachmentData.attachment] = this.formatterService.getAttachmentEffects(attachmentData, weaponData[1] as TGDData)
    }
    
    return attachmentSummary
  }

  /**
   * Used internally. Fetches raw attachment data for all the attachments equipped in the config and caches retrieved data in a variable
   * @param weaponName
   */
  private async getAllAttachmentData(weaponName: string): Promise<TGDData[]> {
    if(!this.attachmentData[weaponName]) {
      this.attachmentData[weaponName] = this.fetchService.getAttachmentData(weaponName)
    }
    return this.attachmentData[weaponName]
  }
  
  /**
   * Internal method that fetches and caches raw weapon damage data w. ranges drop-offs, and base weapon data
   * @param weaponName
   */
  private async getBaseWeaponData(weaponName: string): Promise<BaseData> {
    if(!this.weaponData[weaponName]) {
      this.weaponData[weaponName] = this.fetchService.getBaseWeaponData(weaponName)
    }
    return this.weaponData[weaponName]
  }
}
