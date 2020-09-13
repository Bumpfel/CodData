import { Component, OnInit, Input } from '@angular/core';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-weapon-select',
  templateUrl: './weapon-select.component.html',
  styleUrls: ['./weapon-select.component.scss']
})
export class WeaponSelectComponent implements OnInit {

  weaponTypes: string[]
  weaponNames: string[]
  hoveredSlot: HTMLElement
  armourySaves: Map<string, number> = new Map()

  weaponType: string
  
  constructor(public globalService: GlobalService, private dataService: DataService, public configService: WeaponConfigService, private soundService: SoundService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.globalService.goBackOnEscape()
    
    this.weaponTypes = this.dataService.getWeaponTypes()
    
    this.route.params.subscribe(async params => {
      if(!params.weaponType) {
        // route to first weapon type in list
        this.router.navigate([this.globalService.nameToLink(this.weaponTypes[0])], { relativeTo: this.route, replaceUrl: true })
      } else {
        this.weaponType = this.globalService.linkToName(params.weaponType)
        // get weapons and map nr of armouryConfigs
        this.weaponNames = await this.dataService.getWeapons(this.globalService.linkToName(params.weaponType))
        for(let weaponName of this.weaponNames) {
          let saves = this.configService.getArmouryConfigs(weaponName)
          this.armourySaves.set(weaponName, saves ? Object.keys(saves).length : 0)
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.globalService.disableGoBackOnEscape()
  }
  
  selectWeapon(weaponName: string): void {
    let slot: number = this.getComparisonSlot()

    this.configService.saveConfig(new WeaponConfig(weaponName, slot, this.weaponType))
    this.dataService.getAvailableAttachmentSlots(weaponName) // for caching
    window.history.back()
  }

  showArmouryButton(weaponName: string): void {    
    if(this.hoveredSlot) {
      this.hoveredSlot.querySelector('#armoury-slot-small').classList.remove('gone')
      this.hoveredSlot.querySelector('#armoury-slot-expanded').classList.add('gone')
    }
    if(this.armourySaves.get(weaponName) > 0) {
      this.hoveredSlot = document.querySelector('#' + this.globalService.nameToLink(weaponName))
      this.hoveredSlot.querySelector('#armoury-slot-small').classList.add('gone')
      this.hoveredSlot.querySelector('#armoury-slot-expanded').classList.remove('gone')
    }
  }

  getComparisonSlot(): number {
    return parseInt(this.route.snapshot.paramMap.get('slot'))
  }
}
