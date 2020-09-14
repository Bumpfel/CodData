import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';
import { MessageService } from 'src/app/services/message.service';
import { ContextMenuService } from 'src/app/services/contextmenu.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';

@Component({
  selector: 'app-armoury',
  templateUrl: './armoury.component.html',
  styleUrls: ['./armoury.component.scss']
})
export class ArmouryComponent implements OnInit {

  activeConfig: WeaponConfig
  armouryConfigs: WeaponConfig[]
  newConfig: WeaponConfig
  contextMenuOptions = { delete: 'delete' }
  loaded: boolean = false

  closeContextMenuCallback: (e: KeyboardEvent) => void

  constructor(private route: ActivatedRoute, private configService: WeaponConfigService, private globalService: GlobalService, private dataService: DataService, private contextMenuService: ContextMenuService, private messageService: MessageService) { }

  ngOnInit(): void {
    // this.dataService.getWeaponType(this.globalService.linkToName(this.route.snapshot.paramMap.get('weaponName')))
    this.initiate()
    this.closeContextMenuCallback = e => {
      if(e.key === 'Escape') {
        this.contextMenuService.closeMenu()
        this.globalService.goBackOnEscape()
        document.removeEventListener('keydown', this.closeContextMenuCallback)
      }
    }
  }
  
  ngOnDestroy(): void {   
    this.contextMenuService.closeMenu()
  }
  
  initiate(): void {
    this.globalService.goBackOnEscape()
    const weaponName = this.globalService.linkToName(this.route.snapshot.paramMap.get('weaponName'))
    this.armouryConfigs = this.configService.getArmouryConfigs(weaponName)
    // const weaponType = await this.dataService.getWeaponType(weaponName)
    
    if(Object.keys(this.armouryConfigs).length === 0) { // if deleted last config
      window.history.back()
      return
    }

    const weaponType = Object.values(this.armouryConfigs)[0].weaponType   
    this.newConfig = new WeaponConfig(weaponName, this.getCurrentSlot(), weaponType)
    
    this.activeConfig = this.newConfig
    this.loaded = true
  }

  setActiveConfig(weaponConfig: WeaponConfig) {
    this.activeConfig = weaponConfig    
  }

  getCurrentSlot(): number {
    return parseInt(this.route.snapshot.paramMap.get('slot'))
  }

  selectConfig(weaponConfig: WeaponConfig): void {
    weaponConfig.comparisonSlot = this.getCurrentSlot()
    
    this.configService.saveConfig(weaponConfig)
    this.dataService.getAvailableAttachmentSlots(weaponConfig.weaponName) // for caching
    this.messageService.addMessage('Weapon Equipped', weaponConfig.armouryName || weaponConfig.weaponName)
    window.history.go(-2)
  }

  showContextMenu(event: MouseEvent): void {
    this.contextMenuService.openMenu(this.activeConfig.armouryName || this.activeConfig.weaponName, this.contextMenuOptions, event.pageX, event.pageY)
    this.globalService.disableGoBackOnEscape()
    document.addEventListener('keydown', this.closeContextMenuCallback)
  }

  contextMenuAction(option: string) {
    if(option === this.contextMenuOptions.delete) {
      this.configService.deleteArmouryConfig(this.activeConfig)
      
      this.messageService.addMessage('Armoury Configuration Deleted', this.activeConfig.armouryName)
      this.initiate()
    }
  }

  getFullWeaponType(): string {
    return this.configService.getFullWeaponType(this.activeConfig)
  }
  
  getWeaponSortIdentifier(): string {
    return this.dataService.getWeaponSortIdentifier(this.activeConfig)
  }
}
