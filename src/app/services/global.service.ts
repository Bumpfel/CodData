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

  nameToSelector(str: string): string {
    return str != null ? str.split(' ').join('_').split('.').join('') : null
  }
 
  nameToLink(str: string): string {
    return str != null ? str.split(' ').join('_') : null
  }

  linkToName(str: string): string {
    return str != null ? str.split('_').join(' ') : null // .toLowerCase()
  }

  getImageLink(weaponConfig: WeaponConfig): string {
    return '/assets/images/weapons/' + this.nameToSelector(weaponConfig.weaponType) + '/' + weaponConfig.weaponName + '.png'
  }

  round(nr: number, decimals: number): number {
    const smt = Math.pow(10, decimals)
    const calc = Math.round(nr * smt)

    return calc / smt
  }

  /**
   * Ceiling (or floor) rounds a nr to the nearest interval
   * @param nr 
   * @param interval 
   * @param roundDown floor rounds instead of ceiling 
   */
  roundToClosestInterval(nr: number, interval: number, roundDown: boolean = false) {
    if(roundDown === true) {
      return Math.floor(nr / interval) * interval
    } else {
      return Math.ceil(nr / interval) * interval
    }
  }

  clamp(nr: number, min: number, max: number): number {
    nr = Math.max(nr, min)
    nr = Math.min(nr, max)
    return nr
  }
}
