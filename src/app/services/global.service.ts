import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }
  
  goBackOnEscape() {
    document.addEventListener('keydown', function goBack(e) {     
      if(e.key === 'Escape') {
        window.history.back()
        document.removeEventListener('keydown', goBack)
      }
    })
  }
}
