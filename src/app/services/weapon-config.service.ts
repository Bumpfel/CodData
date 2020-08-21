import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeaponConfigService {
  
  weaponTypes: string[] = ['assault rifles', 'smgs', 'shotguns', 'lmgs', 'marksman rifles', 'sniper rifles', 'handguns']
  attachments: object = {
    muzzle: ['Flash Guard', 'Tactical Suppressor', 'Breacher Device', 'Muzzle Brake', 'Lightweight Suppressor', 'Compensator', 'Monolithic Suppressor'],
    barrel: ['Singuard Arms 16.6" SOCOM', 'Singuard Arms Whisperer'],
    laser: ['5mW Laser', 'Tac Laser', '1mW Laser'],
    optic: ['Operator Reflex Sight', 'Corp Combat Holo Sight', 'G.I. Mini Reflex', 'VLK 3.0x Otpic'],
    stock: ['FSS Close Quarters Stock', 'No Stock'],
    underbarrel: ['Commando Foregrip', 'Merc Foregrip'],
    triggerAction: [],
    ammunition: ['50 Round Mags', '60 Round Mags'],
    rearGrip: ['Stippled Grip Tape', 'Granulated Grip Tape'],
    perk: ['Sleight of Hand']
  }

  private weapons: object = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR 56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker 45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen MK9'],
    marksmanrifles: ['EBR-14', 'MK2 Carbine', 'Kar98K', 'Crossbow', 'SKS'],
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // TODO keep only to make browsable?
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }
  
  weaponConfig = {
    name: '',
    attachments: {}
  }
  
  constructor() {
    this.getTempConfig()
  }

  getWeaponTypes(): string[] {
    return this.weaponTypes
  }

  getWeaponsOfType(type: string): string[] {
    if(type) {
      return this.weapons[type.split(' ').join('')]
    }
    return null
  }

  getAvailableAttachments(): object {
    return this.attachments
  }

  getAttachmentsOfType(attachmentType: string): string[] {
    return this.attachments[attachmentType]
  }

  getSelectedAttachment(attachmentType: string): string {
    return this.weaponConfig.attachments[attachmentType]
  }

  getWeaponConfig(): object { 
    return this.weaponConfig
  }
  
  selectWeapon(weaponName: string): void {
    // TODO check that the weapon exists
    // TODO use weaponconfig class
    this.weaponConfig.name = weaponName
  }

  setAttachment(type: string, name: string): boolean {
    if(this.weaponConfig.attachments[type] === name) {
      delete this.weaponConfig.attachments[type]
      this.saveConfig(null)
      return true
    } else if(Object.keys(this.weaponConfig.attachments).length >= 5 && !this.weaponConfig.attachments.hasOwnProperty(type)) { // there are already 5 attachments and the requested swap was not for a used type
      return false
    } else {
      this.weaponConfig.attachments[type] = name
      this.saveConfig(null)
      return true
    }
  }
  
  saveConfig(name: string): void {
    if(!name) {
      window.sessionStorage.setItem('currentConfig', JSON.stringify(this.weaponConfig))
    } else {
      window.localStorage.setItem(name, JSON.stringify(this.weaponConfig))
    }
  }

  getTempConfig(): void {
    let tempConfig = JSON.parse(window.sessionStorage.getItem('currentConfig'))
    if(tempConfig) {
      this.weaponConfig = tempConfig
    }
  }

  // resetTempConfig

}
