import { Injectable } from '@angular/core';
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
    document.addEventListener('keydown', this.goBackCallback, { once: true })
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

}
