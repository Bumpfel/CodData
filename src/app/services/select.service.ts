import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectService {

  // private selectedWeaponType: string

  weaponTypes = ['assault rifles', 'smgs', 'shotguns', 'lmgs', 'marksman rifles', 'sniper rifles', 'handguns'] // 'launchers', 'melee']

  private weapons = {
    assaultrifles: ['Kilo 141', 'FAL', 'M4A1', 'FR 5.56', 'Oden', 'M13', 'FN Scar 17', 'AK-47' ,'RAM-7', 'Grau 5.56', 'CR 56 AMAX', 'AN-94'],
    smgs: ['AUG', 'P90', 'MP5', 'Uzi', 'PP19 Bizon', 'MP7', 'Striker 45', 'Fennec', 'ISO'],
    shotguns: ['R9-0 Shotgun', '725', 'Origin 12 Shotgun', 'VLK Rogue'],
    lmgs: ['PKM', 'SA87', 'M91', 'MG34', 'Holger-26', 'Bruen MK9'],
    marksmanrifles: ['EBR-14', 'MK2 Carbine', 'Kar98K', 'Crossbow', 'SKS'],
    sniperrifles: ['Dragunov', 'HDR', 'AX-50', 'Rytec AMR'],
    handguns: ['X16', '1911', '.357', 'M19', '.50 GS', 'Renetti'],
    // launchers: ['PILA', 'Strela-P', 'JOKR', 'RPG-7'],
    // melee: ['Riot Shield', 'Combat Knife', 'Kali Sticks', 'Dual Kodachis']
  }
  
  constructor() { }


  getWeaponTypes(): string[] {
    return this.weaponTypes
  }

  // setWeaponType(type: string): void { // unused if using route params
  //    this.selectedWeaponType = type  
  // }

  // getSelectedWeaponType(type: string): Observable<string> {
  //   return type
  // }
  
  // getWeaponsOfTypeAsync(type: string): Observable<string[]> {
  //   if(type) {
  //     return of(this.weapons[type.split(' ').join('')])
  //   }
  //   return of(null)
  // }

  getWeaponsOfTypeSync(type: string): string[] {
    if(type) {
      return this.weapons[type.split(' ').join('')]
    }
    return null
  }

  // getActiveWeapons() {
  //   return this.weapons[this.selectedWeaponType.split(' ').join('')]
  // }

}
