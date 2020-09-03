import { Injectable } from '@angular/core';
import { SoundService } from './sound.service'

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  constructor(private soundService: SoundService) { 
  }

  backAction() {
    this.soundService.goBack()
    window.history.back()
  }

  private goBackCallback = (e: KeyboardEvent) => {
    if(e.key === 'Escape') {
      this.backAction()
      document.removeEventListener('keydown', this.goBackCallback)
    }
  }

  goBackOnEscape() : void{
    document.addEventListener('keydown', this.goBackCallback)
  }

  nameToLink(str: string): string {
    return str.split(' ').join('_').split('.').join('')
  }

  linkToName(str: string): string {
    return str.split('_').join(' ').toLowerCase()
  }

}
