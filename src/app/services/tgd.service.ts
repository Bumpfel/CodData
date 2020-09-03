// import { Injectable } from '@angular/core';

import { WeaponConfig } from '../models/WeaponConfig'

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

  static getWeaponsData(weaponType: string) {
    return this.getTGDData(this.request.weapons, weaponType)
  }

  static getWeaponData(weaponName: string) {
    return this.getTGDData(this.request.weapon, weaponName)
  }

  static getAttachmentData(weaponName: string) {
    return this.getTGDData(this.request.attachments, weaponName)
  }

  static getWeaponSummaryData(weaponConfig: WeaponConfig) {
    const arr = []
    arr.push(weaponConfig.weaponName)
    for(const key in weaponConfig.attachments) {
      arr.push(weaponConfig.attachments[key])
    }

    return this.getTGDData(this.request.summary, arr)
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
