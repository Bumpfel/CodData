import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  constructor(public globalService: GlobalService, private configService: WeaponConfigService) { }
  
  // configurations: any[] = [ // TODO temp
  //   { name: 'Kilo 141', type: 'Assault Rifle', configName: 'Kilo Ranged', attachments: { muzzle: 'Monolithic Suppressor' } },
  //   { name: 'MP7',  type: 'Submachine Gun', configName: 'MP7 Hybrid', attachments: { muzzle: 'Monolithic Suppressor' } },
  // ]
  nextSlot: number

  configurations: WeaponConfig[] // use type

  ngOnInit(): void {
    this.configurations = this.configService.getAllComparisonConfigs().sort((a, b) => a.comparisonSlot - b.comparisonSlot)
    this.nextSlot = this.configService.getNextFreeComparisonSlot()
  }

  // selectSlot(config: WeaponConfig) : void {
  //   this.configService.setActiveConfig(config)
  // }

  test() {
    console.log('debug') 
  }

}
