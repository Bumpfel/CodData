import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponTitle: string
  weaponConfig: WeaponConfig
  // availableAttachments: object
  upperAttachments: string[]
  lowerAttachments: string[]

  constructor(private route: ActivatedRoute, private router: Router, private globalService: GlobalService, private configService: WeaponConfigService) { }

  ngOnInit(): void {
    // this.weaponTitle = this.route.snapshot.paramMap.get('weaponName').split('_').join(' ')
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))

    this.weaponConfig = this.configService.getWeaponConfig(slot)
    
    console.log(this.weaponConfig)
    this.weaponTitle = this.weaponConfig.weaponName
    
    // this.globalService.goBackOnEscape()
    this.globalService.navigateOnEscape('/configurations', this.router)

    // this.availableAttachments = this.configService.getAvailableAttachments()
    // console.log(this.availableAttachments)
  // TODO temp
    this.upperAttachments = ['muzzle', 'barrel', 'laser', 'optic', 'stock'] 
    this.lowerAttachments = ['underbarrel', 'ammunition', 'rearGrip', 'perk']

    // this.configService.selectWeapon(this.weaponTitle) // TODO should only be called once
    
    document.addEventListener('keydown', e => {     
      if(e.key === '1') { // TODO save once
        // TODO save form
        console.log('saved')
        this.weaponConfig.armouryName = 'temp' // TODO temp
        // this.configService.saveConfig(this.weaponConfig.armoryName)
      }
    })

  }
}
