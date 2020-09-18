import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { Dialogue } from 'src/app/models/Dialogue';
import { GlobalService } from 'src/app/services/global.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss']
})
export class DialogueComponent implements OnInit {

  @Input() options: Dialogue 
  @Input() weaponConfig: WeaponConfig
  @Input() isFocused: boolean = false

  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>()

  isActive: boolean = false
  maxNameLength: number = WeaponConfig.maxNameLength // TODO should this be here?
  contentLoaded: boolean = false

  private closeDialogueCB: (e: KeyboardEvent) => void

  /**
   * Menu is opened by setting @Input weaponConfig. This component reacts to the changes
   */  
  constructor(private globalService: GlobalService, public soundService: SoundService) { }

  ngOnInit(): void {
    this.closeDialogueCB = (e: KeyboardEvent) => {
      if(e.key === 'Escape') {
        this.isActive = false
        this.optionSelected.emit(undefined)
      }
    }
  }
  
  ngAfterViewInit(): void {
    this.contentLoaded = true
  }
  
  ngOnChanges(): void {
    // console.log(this.options ? 'options set' : 'no options')
    
    if(this.contentLoaded === true && this.options) {
      this.isActive = true
      this.globalService.disableGoBackOnEscape()
      document.addEventListener('keydown', this.closeDialogueCB, { once: true })
      setTimeout(() => {
        if(this.options.form) {
          (document.querySelector('#textInput') as HTMLElement).focus(), 0 // make sure its run last by sending function to event loop
        }
      })
    } else {
      this.isActive = false
    }
  }
  
  emit(name: string): void {
    this.optionSelected.emit(name)
    document.removeEventListener('keydown', this.closeDialogueCB)
    this.globalService.enableGoBackOnEscape()
  }
}
