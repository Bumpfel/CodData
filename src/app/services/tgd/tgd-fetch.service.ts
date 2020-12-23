import { Injectable } from '@angular/core';
import { BaseData, SummaryData, TGDData } from 'src/app/models/TGD/Data'
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage'
import { TgdFormatterService } from './tgd-formatter.service';

@Injectable({
  providedIn: 'root'
})
export class TgdFetchService {

  private constructor(private formatService: TgdFormatterService) { }

  private request = {
    weapons: { path: 'grab_guns.php', key: 'selectedGunType' },
    weapon: { path: 'base_data.php', key: 'weapon_name' },
    attachmentNames: { path: 'grab_attachment_names.php', key: 'selectedGun' },
    attachments: { path: 'grab_all_attachments.php', key: 'sentData' },
    summary: { path: 'generate_attachments_summary.php', key: 'attachmentSummary' },
    // plot: { path: 'generate_plot_data.php', key: 'gunList' },
  }

  async getWeaponsData(weaponType: string): Promise<Array<string[]>> { // dno why TGD wraps each string in their own array here, but it is what it is
    return this.getTGDData(this.request.weapons, [weaponType , 'mw'])
  }

    async getBaseWeaponData(weaponProfile: string): Promise<BaseData> {
    const result = await this.getTGDData(this.request.weapon, [weaponProfile, 'mw'])
    if(result.length > 1) {
      console.error('warning: fetchService found more than one result in base data, but only returned the first result')
    }

    const data = result[0]
    data['damage_data'] = JSON.parse(data['damage_data'])
    data['slot_names'] = JSON.parse(data['slot_names'])
    
    return data
  }

  getAttachmentNames(weaponName: string): Promise<any[]> {
    return this.getTGDData(this.request.attachmentNames, [weaponName, 'mw'])
  }

  getAttachmentData(weaponName: string): Promise<TGDData[]> {
    return this.getTGDData(this.request.attachments, [weaponName, 'mw'])
  }

  /**
   * Fetches summary data for weapon
   * @param weaponConfig 
   */
  async getWeaponSummaryData(weaponName: string, attachments: {[key: string]: string}): Promise<SummaryData> {
    const arr = Array.of(weaponName)
    Object.values(attachments).forEach(attachment => {
      if(attachment) {
        arr.push(attachment)
      }
    })
    
    const result = await this.getTGDData(this.request.summary, arr)
    // not sure what the result indexes stands for. 1 (or the last index) seem to contain the summary data
    const summaryData = this.formatService.translateSummaryData(result[result.length - 1])
    
    return summaryData
  }

  private async getTGDData(request: any, formData: any): Promise<any> {
    const proxyurl = 'https://cors-anywhere-bumpfel.herokuapp.com/'

    formData = JSON.stringify(formData)

    var urlencoded = new URLSearchParams()
    urlencoded.append(request.key, formData)

    let response = await fetch(proxyurl + 'https://www.truegamedata.com/SQL_calls/' + request.path, {
      method: 'POST',
      body: urlencoded,
    })
    let result = JSON.parse(await response.text())

    return result
  }
}
