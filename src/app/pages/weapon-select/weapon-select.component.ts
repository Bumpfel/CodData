import { Component, OnInit, Input } from '@angular/core';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { DataService } from 'src/app/services/data.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-weapon-select',
  templateUrl: './weapon-select.component.html',
  styleUrls: ['./weapon-select.component.scss']
})
export class WeaponSelectComponent implements OnInit {

  weaponTypes: string[]
  weaponNames: string[]
  weaponProfiles: Map<string, string[]>
  weaponsLoaded: boolean

  hoveredWeapon: HTMLElement
  armourySaves: Map<string, number> = new Map()

  weaponType: string
  activeWeapon: WeaponConfig
    
  constructor(public globalService: GlobalService, private dataService: DataService, public configService: WeaponConfigService, private soundService: SoundService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    // const useTGDData: boolean = JSON.parse(window.localStorage.getItem(this.useTGDDataKey)) || true

    this.dataService.cacheWeapons()
    this.globalService.enableGoBackOnEscape()
    this.weaponTypes = this.dataService.getWeaponTypes()
    
    this.route.params.subscribe(async params => {
      delete this.activeWeapon
      if(!params.weaponType) {
        // route to first weapon type in list
        this.router.navigate([this.globalService.nameToLink(this.weaponTypes[0])], { relativeTo: this.route, replaceUrl: true })
      } else {
        // get weapons and map nr of armouryConfigs
        this.weaponsLoaded = false
        this.weaponType = this.globalService.linkToName(params.weaponType)
        this.weaponProfiles = await this.dataService.getWeaponProfilesOfType(this.weaponType)
        this.weaponNames = Array.from(this.weaponProfiles.keys())
        // this.weaponNames = await this.dataService.getWeaponNames(this.weaponType)
        this.weaponsLoaded = true
        
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
  
  private getTempConfig(weaponName: string): WeaponConfig {   
    return new WeaponConfig(weaponName, this.getComparisonSlot(), this.weaponType)
  }

  setActiveWeapon(weaponName: string): void {
    this.activeWeapon = this.getTempConfig(weaponName)
  }

  selectWeapon(weaponName: string): void {  
    this.soundService.goBack()
    this.soundService.select()
    let slot: number = this.getComparisonSlot()

    this.configService.saveConfig(new WeaponConfig(weaponName, slot, this.weaponType))
    this.dataService.getAvailableAttachmentSlots(weaponName) // for caching
    this.messageService.addMessage('Weapon Equipped', weaponName)
    window.history.back()
  }

  showArmouryButton(weaponName: string): void {    
    if(this.hoveredWeapon) {
      this.hoveredWeapon.querySelector('#armoury-button-collapsed').classList.remove('gone')
      this.hoveredWeapon.querySelector('#armoury-button-expanded').classList.add('gone')
    }
    if(this.armourySaves.get(weaponName) > 0) {
      this.hoveredWeapon = document.querySelector('#' + this.globalService.nameToSelector(weaponName))
      this.hoveredWeapon.querySelector('#armoury-button-collapsed').classList.add('gone')
      this.hoveredWeapon.querySelector('#armoury-button-expanded').classList.remove('gone')
    }
  }

  getComparisonSlot(): number {
    return parseInt(this.route.snapshot.paramMap.get('slot'))
  }
}
