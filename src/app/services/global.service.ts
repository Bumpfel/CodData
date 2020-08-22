import { Injectable } from '@angular/core';
import { SoundService } from './sound.service'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  constructor(private soundService: SoundService) { 
    this.disableGoBack()
  }

  navigateOnEscape(location: string, router: Router) {
    let navigate = e => {
      if(e.key === 'Escape') {
        this.soundService.goBack()
        router.navigate([location])
        document.removeEventListener('keydown', navigate)
      }
    }
    document.addEventListener('keydown', navigate)
  }

  goBack = (e: KeyboardEvent) => {
    if(e.key === 'Escape') {
      this.soundService.goBack()
      window.history.back()
      this.disableGoBack()
    }
  }

  goBackOnEscape() : void{
    document.addEventListener('keydown', this.goBack)
  }

  disableGoBack() : void {
    document.removeEventListener('keydown', this.goBack)
  }

  nameToLink(str: string): string {
    return str.split(' ').join('_')
  }

  linkToName(str: string): string {
    return str.split('_').join(' ').toLowerCase()
  }
}
