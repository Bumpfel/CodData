import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { Stats } from 'src/app/models/Stats'
import { Effect } from 'src/app/models/Effect'
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
  baseWeaponStats: any
  attachmentSummary: Array<Map<string, Effect>> = []
  weaponStatSummary: Map<string, Effect>

  statOrder: string[]

  maxNameLength: number = 20

  private nameFormOverlay: HTMLElement

  private quickAttachmentRemoveCb: (e: KeyboardEvent) => void
  private saveConfigCb: (e: KeyboardEvent) => void
  private cancelConfigCb: (e: KeyboardEvent) => void

  constructor(private route: ActivatedRoute, private dataService: DataService, public globalService: GlobalService, public configService: WeaponConfigService, private soundService: SoundService) { }

  ngOnInit(): void {   
    this.globalService.enableGoBackOnEscape()
    this.deselectPopup = document.querySelector('#deselect')
    this.nameFormOverlay = document.querySelector('#nameFormOverlay')

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)
   
    this.statOrder = Stats.getAllOrderedStats()    

    this.saveConfigCb = e => {
      if(e.key === '1') {        
        this.nameFormOverlay.classList.remove('hidden')
        this.globalService.disableGoBackOnEscape()
        document.removeEventListener('keydown', this.saveConfigCb)
        document.addEventListener('keydown', this.cancelConfigCb)
        setTimeout(() => (this.nameFormOverlay.querySelector('#nameInput') as HTMLElement).focus(), 0) // sending to event loop ensure its run last
      }
    }
    
    this.cancelConfigCb = e => {
      if(e.key === 'Escape') {
        this.hideOverlay()
        document.removeEventListener('keydown', this.cancelConfigCb)
        document.addEventListener('keydown', this.saveConfigCb);
        this.globalService.enableGoBackOnEscape()
      }
    }

    document.addEventListener('keydown', this.saveConfigCb)

    this.fetchAvailableAttachmentSlots()
    this.fetchTableData()
  }
  
  ngOnDestroy(): void {
    this.disableQuickAttachmentRemoval()
    document.removeEventListener('keydown', this.saveConfigCb)
    document.removeEventListener('keydown', this.cancelConfigCb)
  }

  fetchTableData(): void {
    this.dataService.getWeaponSummary(new WeaponConfig(this.weaponConfig.weaponName)).then(result => this.baseWeaponStats = result)
    
    this.weaponStatSummary = null // clears obsolete data
    this.dataService.getWeaponSummary(this.weaponConfig).then(result => this.weaponStatSummary = result)

    this.dataService.getAllAttachmentEffects(this.weaponConfig).then(result => this.attachmentSummary = result)
  }

  async fetchAvailableAttachmentSlots(): Promise<void> {
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
  
  enableQuickAttachmentRemoval(attachmentSlot: string, event: MouseEvent): void {
    this.quickAttachmentRemoveCb = (e: KeyboardEvent) => {
      if(e.key === 'r') {
        const removedAttachment = this.weaponConfig.attachments[attachmentSlot]
        this.configService.removeAttachment(this.weaponConfig, attachmentSlot)
        delete this.attachmentSummary[removedAttachment]

        this.fetchTableData()
        this.disableQuickAttachmentRemoval()
      }
    }
    
    if(this.weaponConfig.attachments[attachmentSlot]) {     
      this.deselectPopup.classList.remove('hidden')
      this.deselectPopup.classList.add('fade-in')
      
      this.deselectPopup.style.left = event.clientX + 'px'
      this.deselectPopup.style.top = event.clientY + 'px'
      
      document.addEventListener('keydown', this.quickAttachmentRemoveCb)
    }
  }
  
  disableQuickAttachmentRemoval(): void {
    this.deselectPopup.classList.add('hidden')
    this.deselectPopup.classList.remove('fade-in')
    document.removeEventListener('keydown', this.quickAttachmentRemoveCb)
  }

  getNrOfAttachments(): number {
    return Object.keys(this.weaponConfig.attachments).length
  }

  isSummary(field: string): boolean {
    return field.toLowerCase() === "summary"
  }

  summaryFirst(a: any, b: any): number { // sort function
    if(a.key === 'Summary') {
      return -1
    }
    return 0
  }

  getImageLink(): string {
    return '/assets/images/weapons/' + this.globalService.nameToLink(this.weaponConfig.weaponType) + '/' + this.weaponConfig.weaponName + '.png'
  }
  
  saveConfig(name: string): void {
    name = name.trim()
    if(name.length === 0) {
      return
    }
    if(name.length > this.maxNameLength) {
      name = name.substr(0, this.maxNameLength)
    }
    this.hideOverlay()
    this.weaponConfig.armouryName = name
    this.configService.saveConfig(this.weaponConfig, true)
  }

  hideOverlay = (): void => {
    this.nameFormOverlay.classList.add('hidden')
  }

}
