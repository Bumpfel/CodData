import { Component, OnInit } from '@angular/core';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-weapon-select',
  templateUrl: './weapon-select.component.html',
  styleUrls: ['./weapon-select.component.scss']
})
export class WeaponSelectComponent implements OnInit {

  // selectedWeaponType: string
  weaponTypes: string[] // TODO of type (interface) weapon
  activeWeapons: string[]

  constructor(public globalService: GlobalService, public configService: WeaponConfigService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.weaponTypes = this.configService.getWeaponTypes()
    // this.selectService.getWeaponsOfTypeAsync(this.selectedWeaponType).subscribe(weapons => {
    //   this.activeWeapons = weapons
    // })

    
    // this.setWeaponType(this.weaponTypes[0])

    this.route.params.subscribe(params => {
      if(!params.weaponType) {
        console.log('navigate to ' + this.weaponTypes[0])
        this.router.navigate([this.globalService.nameToLink(this.weaponTypes[0])], { relativeTo: this.route })
      } else {
        this.activeWeapons = this.configService.getWeaponsOfType(this.globalService.linkToName(params.weaponType))
      }
    })

  }

  // setWeaponType(type: string): void {
  //   this.selectedWeaponType = type
  //   this.activeWeapons = this.configService.getWeaponsOfType(type)
  // }

  // iSelectedWeaponType(type: string): boolean {
  //   return type === this.selectedWeaponType
  // }
}
