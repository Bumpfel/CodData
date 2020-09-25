import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  constructor(public globalService: GlobalService, private configService: WeaponConfigService, public soundService: SoundService, private messageService: MessageService) { }

  nextSlot: number
  hoveredSlot: number
  activeConfig: WeaponConfig
  contextMenu: HTMLElement
  contextOverlay: HTMLElement

  configurations: WeaponConfig[]
  enableGraph = true // to show experimental graph

  callBack: (e: KeyboardEvent) => void

  ngOnInit(): void {
    this.configurations = this.configService.getComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // this.configService.obs_getComparisonConfigs().subscribe(configs => {
    //   this.configurations = configs
    //   this.configurations.sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // })
    this.nextSlot = this.configService.getNextFreeComparisonSlot()
    
    this.contextOverlay = document.querySelector('#contextMenuOverlay')
    this.contextMenu = document.querySelector('#contextMenu')

    this.callBack = e => {
      this.closeContextMenu();
      // document.removeEventListener('keydown', this.callBack)
    }
  }
  
  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.callBack)
  }
  
  deleteConfig(): void {
    this.closeContextMenu()
    this.messageService.addMessage('Configuration deleted', '#' + this.activeConfig.comparisonSlot + ' ' + (this.activeConfig.armouryName || this.activeConfig.weaponName))

    this.configService.deleteComparisonConfig(this.activeConfig.comparisonSlot)
    this.configurations = this.configService.getComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    this.hoveredSlot = undefined
    this.activeConfig = undefined
  }

  setActiveConfig(config: WeaponConfig): void {
    this.activeConfig = config
  }
 
  showGunsmithButton(slot?: number): void {
    if(this.hoveredSlot >= 0) {
      document.querySelector('#gunsmith-slot' + this.hoveredSlot).classList.add('hidden')
    }
    if(slot >= 0) { // add button passes no slot argument, but uses this method to hide gunsmith buttons
      document.querySelector('#gunsmith-slot' + slot).classList.remove('hidden')
      this.hoveredSlot = slot
    }
  }

  showContextMenu(event: MouseEvent, weaponConfig: WeaponConfig): void {
    event.preventDefault()
    this.activeConfig = weaponConfig

    document.addEventListener('keydown', this.callBack, { once: true })

    this.contextOverlay.style.position = 'fixed'
    this.contextOverlay.classList.remove('hidden')
    this.contextMenu.classList.remove('hidden')
    document.querySelector('#weapon-slot' + weaponConfig.comparisonSlot).classList.add('hovered')
    
    this.contextMenu.style.left = (event.pageX) + 'px'
    this.contextMenu.style.top = (event.pageY) + 'px'    
  }
  
  closeContextMenu(): void {
    this.contextOverlay.style.position = 'absolute'
    this.contextOverlay.classList.add('hidden')
    this.contextMenu.classList.add('hidden')
    if(this.activeConfig) {
      document.querySelector('#weapon-slot' + this.activeConfig.comparisonSlot).classList.remove('hovered')
    }
  }

  getActiveConfigName(): string {   
    return this.activeConfig ? this.activeConfig.weaponName : null
  }
}
