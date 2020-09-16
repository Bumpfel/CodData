import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-nameform',
  templateUrl: './nameform.component.html',
  styleUrls: ['./nameform.component.scss']
})
export class NameformComponent implements OnInit {
  
  @Input() weaponConfig: WeaponConfig
  @Output() submitForm: EventEmitter<string> = new EventEmitter<string>()
  
  isActive: boolean = false
  maxNameLength: number = 20
  contentLoaded: boolean = false

  private closeFormCB: (e: KeyboardEvent) => void

  constructor(private globalService: GlobalService) { }
  
  ngOnInit(): void {
    this.closeFormCB = (e: KeyboardEvent) => {
      if(e.key === 'Escape') {
        this.closeForm()
      }
    }
  }
  
  ngAfterViewInit(): void {
    this.contentLoaded = true
  }
  
  ngOnChanges(): void {
    if(this.contentLoaded === true && this.weaponConfig) {
      this.isActive = true
      this.globalService.disableGoBackOnEscape()
      document.addEventListener('keydown', this.closeFormCB, { once: true })
      setTimeout(() => (document.querySelector('#nameInput') as HTMLElement).focus(), 0) // make sure its run last by sending instruction to event loop
    }
  }
  
  saveConfig(name: string): void {
    this.isActive = false
    this.submitForm.emit(name)
    document.removeEventListener('keydown', this.closeFormCB)
    this.globalService.enableGoBackOnEscape()
  }
  
  closeForm(): void {
    this.isActive = false
    document.removeEventListener('keydown', this.closeFormCB)
    this.globalService.enableGoBackOnEscape()
    this.submitForm.emit(null)
  }

}
