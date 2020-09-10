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
  @Input() link: string
  @Input() displayExtras: boolean = true

  constructor(public globalService: GlobalService, private configService: WeaponConfigService) { }

  ngOnInit(): void {
  }

  getFullWeaponType(): string {
    return this.displayExtras === true ? this.configService.getFullWeaponType(this.weaponConfig) : undefined
  }

  getConfigName(): string {
    return this.displayExtras === true
      ? (this.weaponConfig.armouryName
        ? this.weaponConfig.armouryName
        : 'slot #' + this.weaponConfig.comparisonSlot)
      : undefined
  }
  
  err(event): void {
    event.target.src = '/assets/images/no_image.png'
  }

}
