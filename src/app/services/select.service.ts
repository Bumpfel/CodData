import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectService {

  // private selectedWeaponType: string

  // data (temp)
  // weaponTypes = [
  //   { type: 'assault rifles', weapons: ['Grau', 'M4', 'M13'] },
  //   { type: 'smgs', weapons: ['MP5','P90', 'MP7'] },
  //   { type: 'shotguns', weapons: [] },
  //   { type: 'lmgs', weapons: ['Bruen MK9', 'PKM'] },
  //   { type: 'marksman rifles', weapons: [] },
  //   { type: 'sniper rifles', weapons: [] },
  //   { type: 'melee', weapons: [] }
  // ]
  
  weaponTypes = ['assault rifles', 'smgs', 'shotguns', 'lmgs', 'marksman rifles', 'sniper rifles', 'melee']

  private weapons = {
    assaultrifles: ['M4', 'M13', 'Grau 5.56'],
    smgs: ['MP5','P90', 'MP7'],
    shotguns: [],
    lmgs: ['Bruen MK9', 'PKM'],
    marksmanrifles: [],
    sniperrifles: [],
    melee: []
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
  
  getWeaponsOfTypeAsync(type: string): Observable<string[]> {
    if(type) {
      return of(this.weapons[type.split(' ').join('')])
    }
    return of(null)
  }

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
