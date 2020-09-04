import { WeaponConfig } from '../models/WeaponConfig'
import { Attachment } from '../models/TGD/Attachment'
import { WeaponDamage } from '../models/TGD/WeaponDamage'

// @Injectable({
//   providedIn: 'root'
// })

// TODO could probably just have been a functions class, not a service since everything's static
export class TgdService {

  private constructor() { }

  private static request = {  // TODO type (make interface?)
    weapons: { path: 'grab_guns.php', key: 'selectedGunType' },
    weapon: { path: 'base_stats.php', key: 'gun' },
    attachments: { path: 'grab_attachment_data.php', key: 'selectedGun' },
    summary: { path: 'grab_attachments_summary.php', key: 'attachmentSummary' },
  }

  static async getWeaponsData(weaponType: string): Promise<string[][]> {
    console.log(await this.getTGDData(this.request.weapons, weaponType))

    return this.getTGDData(this.request.weapons, weaponType)
  }

  /**
   * Returns array of 
   * [0] = array of damage and drop-off ranges
   * [1] = base weapon data
   * @param weaponName 
   */
  static getWeaponData(weaponName: string): Promise<(WeaponDamage[] | Attachment)[]> {
    return this.getTGDData(this.request.weapon, weaponName)
  }

  static getAttachmentData(weaponName: string): Promise<Attachment[]> {
    return this.getTGDData(this.request.attachments, weaponName)
  }

  /**
   * Fetches summary data and data for all equipped attachments for a weapon
   * Last item arr is summary. The rest of the slots contains attachment data in the order given in the weaponConfig
   * @param weaponConfig 
   */
  static getWeaponSummaryData(weaponConfig: WeaponConfig): Promise<Attachment[]> {
    const arr = []
    arr.push(weaponConfig.weaponName)
    for(const key in weaponConfig.attachments) {
      arr.push(weaponConfig.attachments[key])
    }

    return this.getTGDData(this.request.summary, arr)
  }

  private static async getTGDData(request: any, formData: any): Promise<any> { //Promise<(WeaponDamage | Attachment)[]> {
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
