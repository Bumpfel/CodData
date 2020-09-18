import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';
import { Stats } from 'src/app/models/Stats'
import { Effect } from 'src/app/models/Effect'
import { DataService } from 'src/app/services/data.service';
import { MessageService } from 'src/app/services/message.service';
import { Dialogue } from 'src/app/models/Dialogue';
import { trigger } from '@angular/animations';

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
  newName: string
  upperAttachments: string[]
  lowerAttachments: string[]

  deselectPopup: HTMLElement 

  // TODO type vars when done with re-structure
  baseWeaponStats: any
  attachmentSummary: Array<Map<string, Effect>> = []
  weaponStatSummary: Map<string, Effect>

  statOrder: string[]

  initialDialogueOptions: Dialogue
  secondDialogueOptions: Dialogue
  
  private quickAttachmentRemoveCb: (e: KeyboardEvent) => void
  private showCustomModDialogueCB: (e: KeyboardEvent) => void
  // private cancelConfigCb: (e: KeyboardEvent) => void

  initialDialogueButtons = {
    enterName: 'Enter name',
    updateConfig: 'Update Config',
    createNewConfig: 'Create new Config'
  }

  secondDialogueButton = { 
     ok: 'OK',
     cancel: 'Cancel'
  }

  constructor(private route: ActivatedRoute,
    private dataService: DataService,
    public globalService: GlobalService,
    public configService: WeaponConfigService,
    public soundService: SoundService,
    private messageService: MessageService) { }

  ngOnInit(): void {   
    this.globalService.enableGoBackOnEscape()
    this.deselectPopup = document.querySelector('#deselect')

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)
   
    this.statOrder = Stats.getAllOrderedStats()    

    this.showCustomModDialogueCB = e => {
      if(e.key === '1') {       
        this.initialDialogueOptions = {
          buttons: [ 
            this.initialDialogueButtons.enterName,
            this.initialDialogueButtons.createNewConfig,
            this.initialDialogueButtons.updateConfig,
          ],
          // triggerKey: '1'
        }
        document.removeEventListener('keydown', this.showCustomModDialogueCB)
      }
    }
    document.addEventListener('keydown', this.showCustomModDialogueCB)

    this.fetchAvailableAttachmentSlots()
    this.fetchTableData()
  }
  
  ngOnDestroy(): void {
    this.disableQuickAttachmentRemoval()
    document.removeEventListener('keydown', this.showCustomModDialogueCB)
    // document.removeEventListener('keydown', this.cancelConfigCb)
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
  
  initialDialogueAction(action: string): void {
    console.log('received emit from first dialogue ', action)
    
    if(action === this.initialDialogueButtons.enterName) {
      this.secondDialogueOptions = {
        form: {
          inputLabel: 'enter name',
          inputValue: this.weaponConfig.armouryName,
        }
      }
      console.log('opening second dialogue', this.secondDialogueOptions)
      
    } else if(action === this.initialDialogueButtons.createNewConfig) {
      console.log('creating new config: ' + this.newName)
      // TODO save new config
      // this.messageService.addMessage('Created new armoury config', name)
    } else if(action === this.initialDialogueButtons.updateConfig) {
      console.log('renaming config: ' + this.newName)
      // TODO rename config
      // this.messageService.addMessage('Armoury Config updated', name)
    } else {
      this.initialDialogueOptions = undefined
      document.addEventListener('keydown', this.showCustomModDialogueCB)
    }
  }

  secondDialogueAction(name: string): void {
    console.log('received emit from second dialogue ', name)
    if(name) {
      this.newName = name
    }
    this.secondDialogueOptions = undefined
    
  }

  // saveConfig(name: string): void {
  //   if(name) {
  //     this.nameFormConfig.armouryName = name
  //     if(this.configService.saveConfig(this.nameFormConfig, true)) {
  //       // TODO ny config eller uppdatera gammal?
  //       this.messageService.addMessage('Armoury Config saved', name)
  //     }
  //   }
  //   // this.nameFormConfig = undefined
  //   document.addEventListener('keydown', this.saveConfigCb)
  // }
}
