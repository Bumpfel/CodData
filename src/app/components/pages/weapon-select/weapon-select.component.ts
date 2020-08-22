import { Component, OnInit, Input } from '@angular/core';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Component({
  selector: 'app-weapon-select',
  templateUrl: './weapon-select.component.html',
  styleUrls: ['./weapon-select.component.scss']
})
export class WeaponSelectComponent implements OnInit {

  weaponTypes: string[] // TODO of type (interface/class) weapon
  weaponNamesOfSelectedType: string[]

  constructor(public globalService: GlobalService, public configService: WeaponConfigService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.globalService.navigateOnEscape('/configurations', this.router)

    this.weaponTypes = this.configService.getWeaponTypes()

    this.route.params.subscribe(params => {
      if(!params.weaponType) {
        // console.log('navigate to ' + this.weaponTypes[0])
        this.router.navigate([this.globalService.nameToLink(this.weaponTypes[0])], { relativeTo: this.route })
      } else {
        this.weaponNamesOfSelectedType = this.configService.getWeapons(this.globalService.linkToName(params.weaponType))
      }
    })
  }

  selectWeapon(weaponName: string) {
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.configService.saveNewConfig(slot, weaponName)
  }
}
