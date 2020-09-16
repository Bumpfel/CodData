import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Component({
  selector: 'app-weapon-card',
  templateUrl: './weapon-card.component.html',
  styleUrls: ['./weapon-card.component.scss']
})
export class WeaponCardComponent implements OnInit {

  @Input() weaponConfig: WeaponConfig
  // @Input() displayExtras: boolean = false
  @Input() page: string

  static page = { configurations: 1 }

  constructor(public globalService: GlobalService, private configService: WeaponConfigService) { }

  ngOnInit(): void {
  }

  getDisplayName() {
    // return this.displayExtras
    return this.page === 'configurations'
      ? 'Configuration #' + this.weaponConfig.comparisonSlot
      : this.weaponConfig.armouryName || this.weaponConfig.weaponName
  }

  getFullWeaponType(): string {
    return this.configService.getFullWeaponType(this.weaponConfig)
  }

  getConfigName(): string {
    return this.weaponConfig.armouryName
      ? this.weaponConfig.armouryName
      : this.weaponConfig.weaponName
  }

  isCustomConfig() {
    return this.weaponConfig.armouryName
  }
  
  err(event): void {
    event.target.src = '/assets/images/no_image.png'
  }

  pageIsWeaponSelect(): boolean {
    return this.page === 'weapon-select'
  }
  pageIsConfigurations(): boolean {
    return this.page === 'configurations'
  }
  pageIsArmoury(): boolean {
    return this.page === 'armoury'
  }

}
