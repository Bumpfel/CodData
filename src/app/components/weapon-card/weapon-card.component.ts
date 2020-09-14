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
  @Input() displayExtras: boolean = false

  constructor(public globalService: GlobalService, private configService: WeaponConfigService) { }

  ngOnInit(): void {
  }

  getDisplayName() {
    return this.weaponConfig.armouryName && !this.displayExtras ? this.weaponConfig.armouryName : this.weaponConfig.weaponName
  }

  getFullWeaponType(): string {
    return this.configService.getFullWeaponType(this.weaponConfig)
  }

  getCustomConfigName(): string {
    return this.weaponConfig.armouryName
      ? this.weaponConfig.armouryName
      : null //'slot #' + this.weaponConfig.comparisonSlot
  }
  
  err(event): void {
    event.target.src = '/assets/images/no_image.png'
  }

}
