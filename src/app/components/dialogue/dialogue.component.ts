import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { Dialogue } from 'src/app/models/Dialogue';
import { GlobalService } from 'src/app/services/global.service';
import { SoundService } from 'src/app/services/sound.service';
import { DialogueService } from 'src/app/services/dialogue.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss']
})
export class DialogueComponent implements OnInit {

  @Input() options: Dialogue
  @Input() tempName: string
  @Input() weaponConfig: WeaponConfig
  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>()

  isActive: boolean = false
  maxNameLength: number = WeaponConfig.maxNameLength // TODO should this be here?
  contentLoaded: boolean = false

  private closeDialogueCB: (e: KeyboardEvent) => void

  /**
   * Menu is opened by setting @Input weaponConfig. This component reacts to the changes
   */  
  constructor(private globalService: GlobalService,
    public soundService: SoundService,
    public dialogueService: DialogueService,
    public configService: WeaponConfigService
    ) { }

  ngOnInit(): void {
    this.closeDialogueCB = (e: KeyboardEvent) => {
      if(e.key === 'Escape') {
        this.emit(null)
      }
    }
  }
  
  ngAfterViewInit(): void {
    this.contentLoaded = true
  }
  
  ngOnChanges(): void {   
    if(this.contentLoaded === true && this.options) {
      this.globalService.disableGoBackOnEscape()
      document.addEventListener('keydown', this.closeDialogueCB)
      this.isActive = true
      setTimeout(() => {
        if(this.options && this.options.form) {
          (document.querySelector('#textInput') as HTMLElement).focus(), 0 // make sure its run last by sending function to event loop
        }
      })
    } else {
      this.isActive = false
    }
  }
  
  emit(value: string): void {
    if(!value) {
      this.soundService.goBack()
    }
    
    this.optionSelected.emit(value)
    document.removeEventListener('keydown', this.closeDialogueCB)
  }

  getImageLink(): string {
    return this.globalService.getImageLink(this.weaponConfig)
  }


  hasCustomName(): boolean {
    return this.weaponConfig.armouryName || this.tempName ? true : false
  }

  getConfigName(): string {
    return this.tempName || this.weaponConfig.armouryName || 'WEAPON NAME'
  }
}
