import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  constructor(public globalService: GlobalService, private configService: WeaponConfigService, public soundService: SoundService) { }
  
  // configurations: any[] = [ // TODO temp
  //   { name: 'Kilo 141', type: 'Assault Rifle', configName: 'Kilo Ranged', attachments: { muzzle: 'Monolithic Suppressor' } },
  //   { name: 'MP7',  type: 'Submachine Gun', configName: 'MP7 Hybrid', attachments: { muzzle: 'Monolithic Suppressor' } },
  // ]

  nextSlot: number
  hoveredSlot: number
  activeConfig: WeaponConfig
  contextMenu: HTMLElement
  contextOverlay: HTMLElement

  configurations: WeaponConfig[]

  ngOnInit(): void {
    this.configurations = this.configService.getComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // this.configService.obs_getComparisonConfigs().subscribe(configs => {
    //   this.configurations = configs
    //   this.configurations.sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // })
    this.nextSlot = this.configService.getNextFreeComparisonSlot()
    
    this.contextOverlay = document.querySelector('#contextMenuOverlay')
    this.contextMenu = document.querySelector('#contextMenu')
  }
  
  deleteConfig(): void {
    this.configService.deleteConfig(this.activeConfig.comparisonSlot)
    this.configurations = this.configService.getComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    this.hoveredSlot = undefined
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

    this.contextOverlay.classList.remove('hidden')
    document.querySelector('#weapon-slot' + weaponConfig.comparisonSlot).classList.add('hovered')
    
    this.contextMenu.style.left = event.clientX + 'px'
    this.contextMenu.style.top = event.clientY + 'px'
  }
  
  closeContextMenu(): void {
    this.contextOverlay.classList.add('hidden')
    document.querySelector('#weapon-slot' + this.activeConfig.comparisonSlot).classList.remove('hovered')
  }

  getActiveConfigName(): string {   
    return this.activeConfig ? this.activeConfig.weaponName : null
  }
}
