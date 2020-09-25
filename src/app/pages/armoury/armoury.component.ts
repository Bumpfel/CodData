import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { ContextMenu, InfoPopup } from 'src/app/models/ComponentTypes';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';
import { MessageService } from 'src/app/services/message.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-armoury',
  templateUrl: './armoury.component.html',
  styleUrls: ['./armoury.component.scss']
})
export class ArmouryComponent implements OnInit {

  activeConfig: WeaponConfig
  infoPopupSettings: InfoPopup
  // attachmentsPopup: HTMLElement
  armouryConfigs: {[key:string]: WeaponConfig}
  newConfig: WeaponConfig
  contextMenuOptions: ContextMenu
  nameFormConfig: WeaponConfig
  loaded: boolean = false

  private contextMenuAlternatives = { delete: 'Delete', rename: 'Rename' }
  
  constructor(
    private route: ActivatedRoute,
    private configService: WeaponConfigService,
    private globalService: GlobalService,
    private dataService: DataService,
    private messageService: MessageService,
    private soundService: SoundService
  ) { }
  
  ngOnInit(): void {
    // this.dataService.getWeaponType(this.globalService.linkToName(this.route.snapshot.paramMap.get('weaponName')))
    this.initiate()
  }
  
  ngAfterViewInit(): void {
    // this.attachmentsPopup = document.querySelector('#attachmentsPopup')
  }
  
  initiate(): void {  
    this.globalService.enableGoBackOnEscape()
    const weaponName = this.globalService.linkToName(this.route.snapshot.paramMap.get('weaponName'))
    this.armouryConfigs = this.configService.getArmouryConfigs(weaponName)

    // cache summary data for the armoury configs
    for(let key in this.armouryConfigs) {
      this.dataService.getWeaponSummary(this.armouryConfigs[key])
    }
    
    if(Object.keys(this.armouryConfigs).length === 0) { // if deleted last config
      window.history.back()
      return
    }

    const weaponType = Object.values(this.armouryConfigs)[0].weaponType   
    this.newConfig = new WeaponConfig(weaponName, this.getCurrentSlot(), weaponType)
    
    this.activeConfig = this.newConfig
    this.loaded = true
  }

  setActiveConfig(weaponConfig: WeaponConfig, event: MouseEvent) {   
    this.soundService.hover()
    this.activeConfig = weaponConfig
    
  }

  showAttachmentsPopup(weaponConfig: WeaponConfig, event: MouseEvent): void {
    this.infoPopupSettings = { info: weaponConfig.attachments, x: event.pageX, y: event.pageY }
  }
  
  closeAttachmentsPopup(): void {
    delete this.infoPopupSettings
  }

  getCurrentSlot(): number {
    return parseInt(this.route.snapshot.paramMap.get('slot'))
  }

  selectConfig(weaponConfig: WeaponConfig): void {
    this.soundService.goBack()
    this.soundService.highPitched()
    
    weaponConfig.comparisonSlot = this.getCurrentSlot()
    
    this.configService.saveConfig(weaponConfig)
    this.dataService.getAvailableAttachmentSlots(weaponConfig.weaponName) // for caching
    this.messageService.addMessage('Weapon Equipped', weaponConfig.armouryName || weaponConfig.weaponName)
    window.history.go(-2)
  }

  /**
   * Triggering a change in this.contextMenuOptions variable causes the contextmenu component to react to it
   * @param event 
   */
  showContextMenu(event: MouseEvent): void {
    event.preventDefault()

    this.contextMenuOptions = { 
      title: this.activeConfig.armouryName || this.activeConfig.weaponName,
      alternatives: this.contextMenuAlternatives,
      x: event.pageX + 'px',
      y: event.pageY + 'px'
    }
  }

  /**
   * ContextMenu component emits optionSelected
   * armoury.component.html uses that event to trigger this method -- <app-contextmenu (optionSelected)="contextMenuAction($event)">
   * @param option
   */
  contextMenuAction(option: string): void {
    if(option === this.contextMenuAlternatives.delete) {
      this.configService.deleteArmouryConfig(this.activeConfig)
      this.messageService.addMessage('Armoury Configuration Deleted', this.activeConfig.armouryName)
      this.initiate()
    } else if(option === this.contextMenuAlternatives.rename) {
      this.nameFormConfig = this.activeConfig
    }
  }

  renameConfig(newName: string): void {
    if(newName) {
      this.configService.renameArmouryConfig(this.nameFormConfig, newName)
      this.messageService.addMessage('Armoury Configuration renamed', newName)
    }
    this.nameFormConfig = undefined
  }

  getFullWeaponType(): string {
    return this.configService.getFullWeaponType(this.activeConfig)
  }
  
  getWeaponSortIdentifier(): string {    
    return this.dataService.getWeaponSortIdentifier(this.activeConfig)
  }
}
