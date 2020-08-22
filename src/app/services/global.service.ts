import { Injectable } from '@angular/core';
import { SoundService } from './sound.service'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  
  router: Router
  location: string

  constructor(private soundService: SoundService) { 
  }

  navigateOnEscape(location: string, router: Router) {
    this.router = router
    this.location = location
    document.removeEventListener('keydown', this.navigate)
    document.addEventListener('keydown', this.navigate)
  }

  navigate = (e: KeyboardEvent) => {
    if(e.key === 'Escape') {
      this.soundService.goBack()
      this.router.navigate([this.location],  { replaceUrl: true })
      document.removeEventListener('keydown', this.navigate)
    }
    // document.addEventListener('keydown', this.navigate)
    // console.log('added event listener')
  }



  // goBack = (e: KeyboardEvent) => {
  //   if(e.key === 'Escape') {
  //     this.soundService.goBack()
  //     window.history.back()
  //     this.disableGoBack()
  //   }
  // }

  // goBackOnEscape() : void{
  //   document.addEventListener('keydown', this.goBack)
  // }

  // disableGoBack() : void {
  //   document.removeEventListener('keydown', this.goBack)
  // }

  nameToLink(str: string): string {
    return str.split(' ').join('_')
  }

  linkToName(str: string): string {
    return str.split('_').join(' ').toLowerCase()
  }
}
