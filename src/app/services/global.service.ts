import { Injectable } from '@angular/core';
import { SoundService } from './sound.service'

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  
  constructor(private soundService: SoundService) { 
    this.disableGoBack()
  }

  goBack = e => {
    if(e.key === 'Escape') {
      this.soundService.goBack()
      window.history.back()
      this.disableGoBack()
    }
  }
  
  goBackOnEscape() {
    document.addEventListener('keydown', this.goBack)
  }

  disableGoBack() {
    document.removeEventListener('keydown', this.goBack)
  }

  nameToLink(str: string): string {
    return str.split(' ').join('_').toLowerCase();
  }

  linkToName(str: string): string {
    return str.split('_').join(' ').toLowerCase();
  }
}
