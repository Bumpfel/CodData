import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  goBack = e => {
    if(e.key === 'Escape') {
      window.history.back()
      this.disableGoBack()
    }
  }

  constructor() { 
    this.disableGoBack()
  }
  
  goBackOnEscape() {
    document.addEventListener('keydown', this.goBack)
  }

  disableGoBack() {
    document.removeEventListener('keydown', this.goBack)
  }
}
