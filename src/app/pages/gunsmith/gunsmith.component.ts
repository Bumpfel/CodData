import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponTitle: string
  weaponConfig
  // availableAttachments: object
  upperAttachments: string[]
  lowerAttachments: string[]

  constructor(private route: ActivatedRoute, private globalService: GlobalService, private configService: WeaponConfigService, private _location: Location) { }

  ngOnInit(): void {
    this.weaponTitle = this.route.snapshot.paramMap.get('weaponName').split('_').join(' ')
    this.globalService.goBackOnEscape()
    // this.availableAttachments = this.configService.getAvailableAttachments()
    // console.log(this.availableAttachments)
    this.upperAttachments = ['muzzle', 'barrel', 'laser', 'optic', 'stock']
    this.lowerAttachments = ['underbarrel', 'ammunition', 'rearGrip', 'perk']

    this.configService.selectWeapon(this.weaponTitle) // TOOD should only be called once
    this.weaponConfig = this.configService.getWeaponConfig()
    console.log(this.weaponConfig)
    
  }
}
