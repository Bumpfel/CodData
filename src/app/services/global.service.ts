import { Injectable } from '@angular/core';
import { WeaponConfig } from '../models/WeaponConfig';
import { SoundService } from './sound.service'

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  constructor(private soundService: SoundService) { 
  }

  goBack(): void {   
    this.soundService.goBack()
    window.history.back()
  }

  private goBackCallback = (e: KeyboardEvent) => {
    if(e.key === 'Escape') {
      this.goBack()
      this.disableGoBackOnEscape()
    }
  }

  enableGoBackOnEscape(): void {    
    // console.log('enableGoBackOnEscape')
    document.addEventListener('keydown', this.goBackCallback)
  }
  
  disableGoBackOnEscape(): void {
    // console.log('disableGoBackOnEscape')
    document.removeEventListener('keydown', this.goBackCallback)
  }

  nameToLink(str: string): string {
    return str != null ? str.split(' ').join('_').split('.').join('') : null
  }

  linkToName(str: string): string {
    return str != null ? str.split('_').join(' ') : null // .toLowerCase()
  }

  getImageLink(weaponConfig: WeaponConfig): string {
    return '/assets/images/weapons/' + this.nameToLink(weaponConfig.weaponType) + '/' + weaponConfig.weaponName + '.png'
  }

}
