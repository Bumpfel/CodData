import { Injectable } from '@angular/core';
import { SoundService } from './sound.service'

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  constructor(private soundService: SoundService) { 
  }

  backAction(): void {
    this.soundService.goBack()
    window.history.back()
  }

  private goBackCallback = (e: KeyboardEvent) => {
    if(e.key === 'Escape') {
      this.backAction()
      this.disableGoBackOnEscape()
      // document.removeEventListener('keydown', this.goBackCallback)
    }
  }

  goBackOnEscape(): void {
    document.addEventListener('keydown', this.goBackCallback)
  }

  disableGoBackOnEscape(): void {
    document.removeEventListener('keydown', this.goBackCallback)
  }

  nameToLink(str: string): string {
    return str != null ? str.split(' ').join('_').split('.').join('') : null
  }

  linkToName(str: string): string {
    return str != null ? str.split('_').join(' ').toLowerCase() : null
  }

}
