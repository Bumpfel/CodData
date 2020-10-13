import { Component, Input, OnInit } from '@angular/core';
import { InfoPopup } from 'src/app/models/ComponentTypes';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.scss']
})
export class InfoPopupComponent implements OnInit {

  @Input() settings: InfoPopup

  constructor() { }

  ngOnInit(): void {
  }
  
  ngOnChanges(): void {
    const popup = document.querySelector('#popup') as HTMLElement
    
    if(this.settings && Object.keys(this.settings.info).length > 0) {      
      popup.classList.remove('hidden')
      popup.classList.add('delayed-fade-in')
      
      popup.style.left = this.settings.x + 'px'
      popup.style.top = this.settings.y + 'px'
    } else {
      popup.classList.add('hidden')
      popup.classList.remove('delayed-fade-in')
    }
  }
}
