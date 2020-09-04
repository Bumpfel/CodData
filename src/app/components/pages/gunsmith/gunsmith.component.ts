import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { Stats } from '../../../models/Stats'
import { Effect } from '../../../models/Effect'

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponConfig: WeaponConfig
  upperAttachments: string[]
  lowerAttachments: string[]

  deselectPopup: HTMLElement 

  upperAttachmentsMap: Map<string, number>
  lowerAttachmentsMap: Map<string, number>

  baseSummary: any
  attachmentSummary: any
  statSummary: any

  statOrder: string[]

  eventCallback

  constructor(private route: ActivatedRoute, private router: Router, private globalService: GlobalService, public configService: WeaponConfigService, private soundService: SoundService) { }

  ngOnInit(): void {
    this.globalService.goBackOnEscape()
    this.deselectPopup = document.querySelector('#deselect')

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)

    this.statOrder = Stats.getAllOrderedStats()

    this.mapStatSummary()

    // determines order of attachment buttons
    this.upperAttachmentsMap = new Map([
      ['muzzle', 0],
      ['cable', 0],
      ['pump grip', 0],
      ['barrel', 1],
      ['arms', 1],
      ['laser', 2],
      ['optic', 3],
      ['stock', 4],
      ['pumps', 4],
    ])
    this.lowerAttachmentsMap = new Map([
      ['underbarrel', 0],
      ['trigger action', 0],
      ['ammunition', 1],
      ['bolt', 1],
      ['rear grip', 2],
      ['guard', 2],
      ['perk', 3],
    ])
    
    document.addEventListener('keydown', e => {     
      if(e.key === '1') { // TODO save once
        // TODO save form
        console.log('saved')
        this.weaponConfig.armouryName = 'temp' // TODO temp
        this.configService.saveConfig(this.weaponConfig, true)
      }
    })

    this.mapAttachmentSlots()
  }

  ngOnDestroy(): void {
    this.disableAttachmentRemoval()
  }

  async mapStatSummary(): Promise<void> {
    const result = await this.configService.getWeaponSummary(this.weaponConfig)
    this.statSummary = result['Summary']
    this.attachmentSummary = result
    delete this.attachmentSummary['Summary']

    this.baseSummary = await this.configService.getWeaponData(this.weaponConfig.weaponName)
    // console.log(this.baseSummary)
    

    // console.log('statSummary ', this.statSummary)
    // console.log('attachmentSummary ', this.attachmentSummary)
    
    
    // console.log(this.statSummary)
  }

  async mapAttachmentSlots(): Promise<void> {
    const availableAttachmentSlots: Set<string> = await this.configService.getAvailableAttachmentSlots(this.weaponConfig.weaponName)

    this.upperAttachments = new Array(5)
    this.lowerAttachments = new Array(4)

    for(let attachment of availableAttachmentSlots) {
      let upperIndex: number = this.upperAttachmentsMap.get(attachment)
      let lowerIndex: number = this.lowerAttachmentsMap.get(attachment)
      if(upperIndex >= 0) {
        this.upperAttachments[upperIndex] = attachment
      }
      if(lowerIndex >= 0) {
        this.lowerAttachments[lowerIndex] = attachment
      }
    }
  }
  
  enableAttachmentRemoval(attachmentSlot: string, event: MouseEvent): void {
    this.eventCallback = (e: KeyboardEvent) => {
      if(e.key === 'r') {
        this.configService.removeAttachment(this.weaponConfig, attachmentSlot)
        this.mapStatSummary()
        this.disableAttachmentRemoval()
      }
    }
    
    if(this.weaponConfig.attachments[attachmentSlot]) {     
      this.deselectPopup.classList.remove('gone')
      this.deselectPopup.classList.add('fade-in')
      
      this.deselectPopup.style.left = event.clientX + 'px'
      this.deselectPopup.style.top = event.clientY + 'px'
      
      document.addEventListener('keydown', this.eventCallback)
    }
  }
  
  disableAttachmentRemoval(): void {
    this.deselectPopup.classList.add('gone')
    this.deselectPopup.classList.remove('fade-in')
    document.removeEventListener('keydown', this.eventCallback)
  }

  getNrOfAttachments() {
    return Object.keys(this.weaponConfig.attachments).length
  }

  // isPositiveEffect(mod: string, value: string) {
  //   const temp = this.configService.getWeaponData(this.weaponConfig.weaponName)
  //   console.log('done', temp)
    
  //   return Stats.isPositiveEffect(mod, value, this.configService.getWeaponData(this.weaponConfig.weaponName))
  // }

  isSummary(field: string): boolean {    
    return field.toLowerCase() === "summary"
  }

  summaryFirst(a, b) {
    if(a.key === 'Summary') {
      return -1
    }
    return 0
  }

  log(...what) { // TODO debug
    console.log(what)
  }
  
  // print(arr: Effect[], stat: string) { // TODO badness 10000
  //   for(let effect of arr) {
      
  //     if(effect.key === stat) {
  //       return effect.value
  //     }
  //   }
  // }
  
}
