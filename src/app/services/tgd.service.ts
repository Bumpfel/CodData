import { Injectable } from '@angular/core';
import { cors } from 'cors'

@Injectable({
  providedIn: 'root'
})

// TODO could probably just have been a functions class, not a service since everything's static
export class TgdService {

  private constructor() { }

  private static path = { weapons: 'grab_guns.php', attachments: 'grab_attachment_data.php' }

  static getWeaponData(weaponType: string) {
    return this.getTGDData(this.path.weapons, weaponType)
  }

  static getAttachmentData(weaponName) {
    return this.getTGDData(this.path.attachments, weaponName)
  }


  private static async getTGDData(path: string, formData: string): Promise<any> {
    // const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const proxyurl = "http://localhost:4000/";

    var urlencoded = new URLSearchParams();
    if(path === this.path.weapons) {
      urlencoded.append("selectedGunType", "\"" + formData + "\"")
    } else if(path === this.path.attachments) {
      urlencoded.append("selectedGun", "\"" + formData + "\"")
    }

    let response = await fetch(proxyurl + 'https://www.truegamedata.com/' + path, {
      method: 'POST',
      body: urlencoded,
    })
    let result = JSON.parse(await response.text())

    return result
  }
}
