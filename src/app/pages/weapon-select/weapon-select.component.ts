import { Component, OnInit } from '@angular/core';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-weapon-select',
  templateUrl: './weapon-select.component.html',
  styleUrls: ['./weapon-select.component.scss']
})
export class WeaponSelectComponent implements OnInit {

  selectedWeaponType: string
  weaponTypes: string[] // TODO of type (interface) weapon
  activeWeapons: string[]

  constructor(public configService: WeaponConfigService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.weaponTypes = this.configService.getWeaponTypes()
    // this.selectService.getWeaponsOfTypeAsync(this.selectedWeaponType).subscribe(weapons => {
    //   this.activeWeapons = weapons
    // })

    this.setWeaponType(this.weaponTypes[0])
  }

  setWeaponType(type: string): void {
    this.selectedWeaponType = type
    this.activeWeapons = this.configService.getWeaponsOfType(type)
  }

  iSelectedWeaponType(type: string): boolean {
    return type === this.selectedWeaponType
  }

  makeLink(str: string): string {
    return str.split(' ').join('_').toLowerCase();
  }
}
