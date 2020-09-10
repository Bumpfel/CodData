import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { Stats } from '../../../models/Stats'
import { Effect } from '../../../models/Effect'
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  // determines order of attachment buttons
  upperAttachmentsMap: Map<string, number> = new Map([
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
  
  lowerAttachmentsMap: Map<string, number> = new Map([
    ['underbarrel', 0],
    ['trigger action', 0],
    ['ammunition', 1],
    ['bolt', 1],
    ['rear grip', 2],
    ['guard', 2],
    ['perk', 3],
  ])

  weaponConfig: WeaponConfig
  upperAttachments: string[]
  lowerAttachments: string[]

  deselectPopup: HTMLElement 

  // TODO type vars when done with re-structure
  baseSummary: any
  attachmentSummary: Array<Map<string, Effect>> = []
  weaponStatSummary: Map<string, Effect>

  statOrder: string[]

  eventCallback: (e: KeyboardEvent) => void

  constructor(private route: ActivatedRoute, private dataService: DataService, public globalService: GlobalService, public configService: WeaponConfigService, private soundService: SoundService) { }

  ngOnInit(): void {   
    this.globalService.goBackOnEscape()
    this.deselectPopup = document.querySelector('#deselect')

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)
   
    this.statOrder = Stats.getAllOrderedStats()
    
    document.addEventListener('keydown', e => {     
      if(e.key === '1') { // TODO save once
        // TODO save form
        console.log('saved')
        this.weaponConfig.armouryName = 'temp' // TODO temp
        this.configService.saveConfig(this.weaponConfig, true)
      }
    })
    
    this.requestAvailableAttachmentSlots()
    this.requestWeaponStatSummary()
    this.requestAttachmentSummary()
  }

  ngOnDestroy(): void {
    this.disableAttachmentRemoval()
  }

  async requestAttachmentSummary(): Promise<void> {
    this.weaponStatSummary = null // clear obsolete data
    this.weaponStatSummary = await this.dataService.getWeaponSummary(this.weaponConfig)
    
    // this.baseSummary = await this.configService.getWeaponData(this.weaponConfig.weaponName) // TODO not done
  }
  
  async requestWeaponStatSummary(): Promise<void> {
    this.attachmentSummary = await this.dataService.getAllAttachmentEffects(this.weaponConfig)
  }

  async requestAvailableAttachmentSlots(): Promise<void> {
    const availableAttachmentSlots = await this.dataService.getAvailableAttachmentSlots(this.weaponConfig.weaponName)

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
        const removedAttachment = this.weaponConfig.attachments[attachmentSlot]
        this.configService.removeAttachment(this.weaponConfig, attachmentSlot)
        delete this.attachmentSummary[removedAttachment]

        this.requestAttachmentSummary()
        this.requestWeaponStatSummary()
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

  getNrOfAttachments(): number {
    return Object.keys(this.weaponConfig.attachments).length
  }

  isSummary(field: string): boolean {    
    return field.toLowerCase() === "summary"
  }

  summaryFirst(a: any, b: any): number {
    if(a.key === 'Summary') {
      return -1
    }
    return 0
  }

  log(...what: any[]) { // TODO debug
    console.log(what)
  }
  
}
