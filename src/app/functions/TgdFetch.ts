import { WeaponConfig } from '../models/WeaponConfig'
import { TGDData } from '../models/TGD/Data'
import { DamageIntervals } from '../models/TGD/WeaponDamage'
import { environment } from 'src/environments/environment'

export class TgdFetch {

  private constructor() { }

  private static request = {
    weapons: { path: 'grab_guns.php', key: 'selectedGunType' },
    weapon: { path: 'base_stats.php', key: 'gun' },
    attachments: { path: 'grab_attachment_data.php', key: 'selectedGun' },
    summary: { path: 'grab_attachments_summary.php', key: 'attachmentSummary' },
    // plot: { path: 'generate_plot_data.php', key: 'gunList' },
  }

  static async getWeaponsData(weaponType: string): Promise<Array<string[]>> { // dno why TGD wraps each string in their own array here, but it is what it is
    return this.getTGDData(this.request.weapons, weaponType)
  }

  /**
   * Returns array of 
   * [0] = array of damage and drop-off ranges
   * [1] = base weapon data
   * @param weaponName
   */
  static getBaseWeaponData(weaponProfile: string): Promise<(DamageIntervals[] | TGDData)[]> {
    return this.getTGDData(this.request.weapon, weaponProfile)
  }

  static getAttachmentData(weaponName: string): Promise<TGDData[]> {
    return this.getTGDData(this.request.attachments, weaponName)
  }

  /**
   * Fetches summary data for weapon
   * @param weaponConfig 
   */
  static async getWeaponSummaryData(weaponName: string, attachments: {[key: string]: string}): Promise<TGDData> {
    const arr = Array.of(weaponName)
    Object.values(attachments).forEach(attachment => {
      if(attachment) {
        arr.push(attachment)
      }
    })
    
    const result = await this.getTGDData(this.request.summary, arr)
    
    return result[result.length - 1]
  }

  private static async getTGDData(request: any, formData: any): Promise<any> {
    const proxyurl = 'https://cors-anywhere-bumpfel.herokuapp.com/'

    formData = JSON.stringify(formData)

    var urlencoded = new URLSearchParams()
    urlencoded.append(request.key, formData)

    let response = await fetch(proxyurl + 'https://www.truegamedata.com/' + request.path, {
      method: 'POST',
      body: urlencoded,
    })
    let result = JSON.parse(await response.text())

    return result
  }
}
