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
  menuTimeout

  configurations: WeaponConfig[] // use type

  ngOnInit(): void {
    this.configurations = this.configService.getComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // this.configService.obs_getComparisonConfigs().subscribe(configs => {
    //   this.configurations = configs
    //   this.configurations.sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    // })
    this.nextSlot = this.configService.getNextFreeComparisonSlot()
   
    // const smt: HTMLTemplateElement = document.querySelector('#contextMenu')
    // this.contextMenu = smt.content.cloneNode(true
    
    this.contextMenu = document.querySelector('#contextMenu')
    this.closeContextMenu()
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
    if(slot >= 0) { // add button sends has slot. but uses this method to hide gunsmith buttons
      document.querySelector('#gunsmith-slot' + slot).classList.remove('hidden')
      this.hoveredSlot = slot
    }
  }

  showContextMenu(event: MouseEvent, weaponConfig: WeaponConfig): void {
    event.preventDefault()
    this.activeConfig = weaponConfig

    document.querySelector('#card-' + weaponConfig.comparisonSlot).append(this.contextMenu)
    // this.contextMenu.style.left = event.clientX + 'px'
    // this.contextMenu.style.top = event.clientY + 'px'
  }
  
  closeContextMenu(delay?: number): void {
    this.menuTimeout = setTimeout(() => { this.contextMenu.remove() }, delay)
  }

  keepContextMenu(slot: number): void {
    const hasActiveMenu = document.querySelector('#card-' + slot).querySelector('#contextMenu')

    if(hasActiveMenu) {
      console.log('clearing timeout')
      
      clearTimeout(this.menuTimeout)
    }
  }

  getActiveConfigName(): string {   
    return this.activeConfig ? this.activeConfig.weaponName : null
  }
}
