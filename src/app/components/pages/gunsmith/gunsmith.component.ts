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

  // TODO type vars when done with res-structure
  baseSummary: any
  attachmentSummary: Array<Map<string, Effect>> = []
  testAttachmentSummary: Array<Map<string, Effect>> = []
  weaponStatSummary: Map<string, Effect>

  statOrder: string[]

  eventCallback: (e: KeyboardEvent) => void

  constructor(private route: ActivatedRoute, private globalService: GlobalService, public configService: WeaponConfigService, private soundService: SoundService) { }

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
    this.weaponStatSummary = null // clear obsolete data

    // Gets attachment summary (should be cached already)
    for(let attachmentSlot in this.weaponConfig.attachments) {
      const attachmentName = this.weaponConfig.attachments[attachmentSlot]
      const attachmentData = await this.configService.getAttachmentData(this.weaponConfig.weaponName, attachmentName) // TODO this class shouldn't really deal with raw data
      this.attachmentSummary[attachmentName] = await this.configService.getEffects(attachmentData, this.weaponConfig.weaponName)
    }

    this.weaponStatSummary = await this.configService.getWeaponSummary(this.weaponConfig)
    
    // this.baseSummary = await this.configService.getWeaponData(this.weaponConfig.weaponName) // TODO not done
  }

  async mapAttachmentSlots(): Promise<void> {
    const availableAttachmentSlots = await this.configService.getAvailableAttachmentSlots(this.weaponConfig.weaponName)

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
