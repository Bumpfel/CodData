import { WeaponConfig } from '../models/WeaponConfig'
import { AttachmentData, WeaponData } from '../models/TGD/Data'
import { DamageIntervals } from '../models/TGD/WeaponDamage'

export class TgdFetch {

  private constructor() { }

  private static request = {
    weapons: { path: 'grab_guns.php', key: 'selectedGunType' },
    weapon: { path: 'base_stats.php', key: 'gun' },
    attachments: { path: 'grab_attachment_data.php', key: 'selectedGun' },
    summary: { path: 'grab_attachments_summary.php', key: 'attachmentSummary' },
    // plot: { path: 'generate_plot_data.php', key: 'gunList' },
  }


  // static plotData = [
  //   "Kilo 141",
  //   [ads, bullet_velocity, range_mod],
  //   "DPS",
  //   hitbox,
  // ]

  static async getWeaponsData(weaponType: string): Promise<Array<string[]>> { // dno why TGD wraps each string in their own array here, but it is what it is
    return this.getTGDData(this.request.weapons, weaponType)
  }

  /**
   * Returns array of 
   * [0] = array of damage and drop-off ranges
   * [1] = base weapon data
   * @param weaponName
   */
  static getBaseWeaponData(weaponName: string): Promise<(DamageIntervals[] | WeaponData)[]> {
    return this.getTGDData(this.request.weapon, weaponName)
  }

  static getAttachmentData(weaponName: string): Promise<AttachmentData[]> {
    return this.getTGDData(this.request.attachments, weaponName)
  }

  /**
   * @deprecated Use getWeaponSummaryData() instead
   * 
   * Fetches summary data and data for all equipped attachments for a weapon
   * Last item arr is summary. The rest of the slots contains attachment data in the order given in the weaponConfig
   * @param weaponConfig 
   */
  static getSummaryData(weaponConfig: WeaponConfig): Promise<Array<AttachmentData>> {
    const arr = []
    arr.push(weaponConfig.weaponName)
    for(const key in weaponConfig.attachments) {
      arr.push(weaponConfig.attachments[key])
    }
    console.log(arr)

    return this.getTGDData(this.request.summary, arr)
  }

  /**
   * Fetches summary data for weapon
   * @param weaponConfig 
   */
  static async getWeaponSummaryData(weaponConfig: WeaponConfig): Promise<AttachmentData> {
    const arr = Array.of(weaponConfig.weaponName)
    Object.values(weaponConfig.attachments).forEach(attachment => { 
      if(attachment) {
        arr.push(attachment)
      }
    })
    
    const result = await this.getTGDData(this.request.summary, arr)
    
    return result[result.length - 1]
  }

  private static async getTGDData(request: any, formData: any): Promise<any> {
    // const proxyurl = "https://cors-anywhere.herokuapp.com/"
    const proxyurl = "http://localhost:4100/"

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
