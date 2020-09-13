import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';

@Component({
  selector: 'app-armoury',
  templateUrl: './armoury.component.html',
  styleUrls: ['./armoury.component.scss']
})
export class ArmouryComponent implements OnInit {

  activeConfig: WeaponConfig
  allConfigs: WeaponConfig[]
  // weaponName: string
  // weaponType: string
  newConfig: WeaponConfig

  constructor(private route: ActivatedRoute, private configService: WeaponConfigService, private globalService: GlobalService, private dataService: DataService) { }

  ngOnInit(): void {
    this.globalService.goBackOnEscape()

    const weaponName = this.globalService.linkToName(this.route.snapshot.paramMap.get('weaponName'))
    const armouryConfigs = this.configService.getArmouryConfigs(weaponName)
    const weaponType = Object.values(armouryConfigs)[0].weaponType // not the cleanest way, but works
    
    this.newConfig = new WeaponConfig(weaponName, this.getCurrentSlot(), weaponType)
    this.activeConfig = this.newConfig
    
    this.allConfigs = Array.of(this.activeConfig)
    Object.values(armouryConfigs).forEach(config => this.allConfigs.push(config))
  }

  setActiveConfig(weaponConfig: WeaponConfig) {
    this.activeConfig = weaponConfig
  }

  getCurrentSlot(): number {
    return parseInt(this.route.snapshot.paramMap.get('slot'))
  }

  selectConfig(weaponConfig: WeaponConfig): void {
    this.configService.saveConfig(new WeaponConfig(weaponConfig.weaponName, this.getCurrentSlot(), weaponConfig.weaponType))
    this.dataService.getAvailableAttachmentSlots(weaponConfig.weaponName) // for caching
    window.history.back()
  }

}
