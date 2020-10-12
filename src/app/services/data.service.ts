import { Injectable } from '@angular/core';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { TGDData } from 'src/app/models/TGD/Data';
import { TgdFormatter } from '../functions/TgdFormatter';
import { Effect } from 'src/app/models/Effect';
import { WeaponTypes } from 'src/app/models/WeaponTypes';
import { WeaponProfile } from 'src/app/models/WeaponConfig';
import { TgdFetch } from 'src/app/functions/TgdFetch';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { Stats } from '../models/Stats';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private menuToTGDWeaponTypes: Map<string, string> = new Map([ // keys = for menu display / used in path. values = tgd form data
    [WeaponTypes.assaultRifles, 'AR'],
    [WeaponTypes.subMachineGuns, 'SMG'],
    [WeaponTypes.lightMachineGuns, 'LMG'],
    [WeaponTypes.marksmanRifles, 'MR'],
    [WeaponTypes.sniperRifles, 'SR']
  ])
  private tgdToDisplayWeaponTypes: Map<string, string> = new Map([
    ['AR', WeaponTypes.sniperRifles],
    ['SMG', WeaponTypes.subMachineGuns],
    ['LMG', WeaponTypes.lightMachineGuns],
    ['MR', WeaponTypes.marksmanRifles],
    ['SR', WeaponTypes.sniperRifles]
  ])

  private weapons = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR-56 AMAX', 'AN-94', 'AS VAL'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker-45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen Mk9', 'FiNN LMG'],
    marksmanrifles: ['EBR', 'Mk2 Carbine', 'Kar98k', 'Crossbow', 'SKS', 'SP-R 208'],
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
  private weaponNamesData: { [key: string]: Promise<string[][]> } = {}
  private weaponData: { [key: string]: Promise<(TGDData | DamageIntervals[])[]> } = {} // P.I.T.A. typing
  private summaryData: Map<string, Promise<TGDData>> = new Map() // uses stringifed WeaponConfig as key
  private attachmentData: { [key: string]: Promise<TGDData[]> } = {}

  constructor() {
  }

  getWeaponTypes(): string[] {
    return Array.from(this.menuToTGDWeaponTypes.keys())
  }

  async getWeaponType(weaponConfig: WeaponConfig): Promise<string> {
    const weaponData =  await this.getBaseWeaponData(weaponConfig) as TGDData
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
      this.weaponNamesData[tgdType] = TgdFetch.getWeaponsData(tgdType)
    }
    const weapons = await this.weaponNamesData[tgdType] || []
    
    for(const weapon of weapons) {
      arr.push(weapon[0])
    }

    return arr
  }

  /**
   * Maps alternate TGD weapon profiles so that the base weapon name links to the other profiles
   * e.g. { AK-47: {AK-47, AK-47 5.45mm }}
   * @param names 
   */
  async getWeaponProfilesOfType(type: string): Promise<Map<string, string[]>> { // TODO ev merga denna med getWeapons
    const weaponProfiles: Map<string, string[]> = new Map() // <base weapon name, alternate profile weapon name>
    
    const names = await this.getWeaponNames(type)    
    for(let name of names) {
      let duplicateFound = false
      let appendedString: string = ''
      
      for(let str of name.split(' ')) {
        appendedString += str + ' '
        const compareString = appendedString.trim()

        if(weaponProfiles.has(compareString)) {
          duplicateFound = true
          const arr = weaponProfiles.get(compareString) || []
          arr.push(name)
          weaponProfiles.set(compareString, arr)
          break;
        }
      }
      if(!duplicateFound) {
        weaponProfiles.set(name, Array.of(name))
      }
    }
    return weaponProfiles
  }


  /**
   * Workaround for TGD data to add attachments that changes the weapon profile
   * 
   * @param weaponName
   * @param attachmentSlot 
   */
  getSpecialAttachmentProfiles(weaponName: string, attachmentSlot: string): WeaponProfile[] {  
    const arr = []
    const specialProfiles = TgdFormatter.weaponProfileAttachments.get(weaponName) || []
    for(const profile of specialProfiles) {
      if(profile.attachmentSlot === attachmentSlot) {
        arr.push(profile)
      }
    }
    return arr
  }

  /**
   * Fetches attachment data for the given weapon
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
   * @param attachmentSlot 
   */
  async _getAttachmentsEffectsOfType(weaponConfig: WeaponConfig, attachmentSlot: string): Promise<{[key:string]: Map<string, Effect>}> {   
    let attachmentData = await this.getAllAttachmentData(weaponConfig.weaponName)
    attachmentData = attachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentSlot)
    return this.extractAttachmentEffects(weaponConfig, attachmentData)
  }
  async getAttachmentsEffectsOfType(weaponConfig: WeaponConfig, attachmentSlot: string): Promise<{[key:string]: Map<string, Effect>}> {
    const weaponProfiles = (await this.getWeaponProfilesOfType(weaponConfig.weaponType)).get(weaponConfig.weaponName)

    const baseData = (await this.getBaseWeaponData(weaponConfig))[1]

    let attachmentData = []
    for(const profile of weaponProfiles) {
      let profileAttachmentData = await this.getAllAttachmentData(profile)
      profileAttachmentData = profileAttachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentSlot)
      const profileBaseData = (await this.getProfileBaseData(profile))[1]


      // TODO temp name. temp place (should probably sit in TGDFormatter). should map e.g. bullet_velocity to bullet_velocity_mod
      const valueToMod = new Map<string, string>([
        ['bullet_velocity', 'bullet_velocity_mod'],
        // ['', ''],
      ])

      if(weaponConfig.weaponName !== profile) { // if special attachment data
        for(let i = 0; i < profileAttachmentData.length; i++) { // for each attachment
          console.log(profileAttachmentData[i].attachment)
          
          for(const entry of valueToMod.entries()) { // iterate through valueToMod map
            const recalc = profileBaseData[entry[0]] / baseData[entry[0]] * profileAttachmentData[i][entry[1]]
            console.log(' changed', entry[0], profileBaseData[entry[0]] + ' / ' + baseData[entry[0]] + ' * ' + profileAttachmentData[i][entry[1]] + ' = ' + recalc)
            profileAttachmentData[i][entry[1]] = recalc
            console.log(profileAttachmentData[i][entry[1]])
            
          }
        }
      }
      profileAttachmentData.forEach(profileData => attachmentData.push(profileData))
    }
    attachmentData = attachmentData.filter(attachment => attachment.slot.toLowerCase() === attachmentSlot)

    return this.extractAttachmentEffects(weaponConfig, attachmentData)
  }

  /**
   *  Used by gunsmith summary
   * @param weaponConfig
   */
  async getAllAttachmentEffects(weaponConfig: WeaponConfig): Promise<{[key:string]: Map<string, Effect>}> {
    const rawData = await this.getAllAttachmentData(weaponConfig.weaponProfile)

    const attachmentNames: Set<string> = new Set()
    for(let attachmentSlot in weaponConfig.attachments) {
      const attachmentName = weaponConfig.attachments[attachmentSlot]
      attachmentNames.add(attachmentName)     
    }
    const attachmentsData = rawData.filter(attachment => attachmentNames.has(attachment.attachment))
    
    return this.extractAttachmentEffects(weaponConfig, attachmentsData)
  }


  async getBaseDamageIntervals(weaponConfig: WeaponConfig): Promise<DamageIntervals[]> { // TODO returnerar TGD DATA, vilket skapar beroenden. borde formatera här
   const result = await this.getBaseWeaponData(weaponConfig)
   return result[0] as DamageIntervals[]
  }

  /**
   * Fetches weapon stats summary and returns formatted Effects. Used by gunsmith
   * @param weaponConfig 
   */
  async getWeaponSummary(weaponConfig: WeaponConfig): Promise<Map<string, Effect>> {
    const ordered = Object.values(weaponConfig.attachments).sort()
    const cacheKey = weaponConfig.weaponName + JSON.stringify(ordered)
   
    const baseWeaponData = await this.getBaseWeaponData(weaponConfig)
    if(!this.summaryData.has(cacheKey)) {
      this.summaryData.set(cacheKey, TgdFetch.getWeaponSummaryData(weaponConfig.weaponProfile, weaponConfig.attachments)) // cache data
    }
    const result: TGDData = await this.summaryData.get(cacheKey) || {} // get cached data

    return TgdFormatter.getAttachmentEffects(result, baseWeaponData[baseWeaponData.length - 1] as TGDData, true)
  }

  getHitboxes():{[key: string]: string} {
    return TgdFormatter.getHitboxes()
  }

  /**
   * Formats raw data to printable effects
   * @param weaponName
   * @param attachmentsData 
   */
  public async extractAttachmentEffects(weaponConfig: WeaponConfig, attachmentsData: TGDData[]): Promise<{[key:string]: Map<string, Effect>}> { // TODO temp public
    const attachmentSummary: {[key:string]: Map<string, Effect>} = {}    
    const weaponData = await this.getBaseWeaponData(weaponConfig)
    
    for(let data of attachmentsData) {
      attachmentSummary[data.attachment] = TgdFormatter.getAttachmentEffects(data, weaponData[1] as TGDData)
    }

    return attachmentSummary
  }

  /**
   * Used internally. Fetches raw attachment data for all the attachments equipped in the config and caches retrieved data in a variable
   * @param weaponName
   */
  private async getAllAttachmentData(weaponName: string): Promise<TGDData[]> {   
    if(!this.attachmentData[weaponName]) {
      this.attachmentData[weaponName] = TgdFetch.getAttachmentData(weaponName)
    }
    return this.attachmentData[weaponName]
  }
  
  /**
   * Internal method that fetches and caches raw weapon damage data w. ranges drop-offs, and base weapon data
   * @param weaponName
   */
  private async getBaseWeaponData(weaponConfig: WeaponConfig): Promise<(DamageIntervals[] | TGDData)[]> {
    if(!this.weaponData[weaponConfig.weaponName]) {
      this.weaponData[weaponConfig.weaponName] = TgdFetch.getBaseWeaponData(weaponConfig.weaponName)
    }
    return this.weaponData[weaponConfig.weaponName]
  }


  private async getProfileBaseData(profile: string): Promise<(DamageIntervals[] | TGDData)[]> {
    if(!this.weaponData[profile]) {
      this.weaponData[profile] = TgdFetch.getBaseWeaponData(profile)
    }
    return this.weaponData[profile]
  }

}
