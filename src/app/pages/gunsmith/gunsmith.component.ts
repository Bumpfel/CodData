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
import { Dialogue, InfoPopup } from 'src/app/models/ComponentTypes';

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

  // deselectPopup: HTMLElement
  infoPopupSettings: InfoPopup

  // TODO type vars when done with re-structure
  baseWeaponStats: any
  attachmentSummary: Array<Map<string, Effect>> = [] // TODO not array
  weaponStatSummary: Map<string, Effect>

  statOrder: string[]

  initialDialogueOptions: Dialogue
  secondDialogueOptions: Dialogue
  
  initialDialogueButtons = {
    enterName: 'Enter name',
    saveConfig: 'Save modification',
    createNewConfig: 'Create new modification',
    updateConfig: 'Update modification',
  }
  secondDialogueButton = {
     ok: 'OK',
     cancel: 'Cancel'
  }

  private quickAttachmentRemoveCb: (e: KeyboardEvent) => void
  private showConfigDialogueCB: (e: KeyboardEvent) => void

  constructor(private route: ActivatedRoute,
    private dataService: DataService,
    public globalService: GlobalService,
    public configService: WeaponConfigService,
    public soundService: SoundService,
    public messageService: MessageService,
    ) { }

  ngOnInit(): void {
    this.globalService.enableGoBackOnEscape()

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)
   
    this.statOrder = Stats.getAllOrderedStats()

    this.showConfigDialogueCB = e => {
      if(e.key === '1') {
        this.soundService.highPitched()
        this.initialDialogueOptions = {
          title: 'save custom mod',
          buttons: this.weaponConfig.armouryName
          ? [ this.initialDialogueButtons.enterName, this.initialDialogueButtons.updateConfig,  this.initialDialogueButtons.createNewConfig ]
          : [ this.initialDialogueButtons.enterName, this.initialDialogueButtons.saveConfig ] }
          document.removeEventListener('keydown', this.showConfigDialogueCB)
      }
    }
      
    document.addEventListener('keydown', this.showConfigDialogueCB)

    this.fetchAvailableAttachmentSlots()
    this.fetchTableData()
  }
  
  ngOnDestroy(): void {
    this.disableQuickAttachmentRemoval()
    document.removeEventListener('keydown', this.showConfigDialogueCB)
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
    this.soundService.hover()

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
      this.infoPopupSettings = { info: { R: 'Deselect' }, x: event.pageX, y: event.pageY }      
      document.addEventListener('keydown', this.quickAttachmentRemoveCb)
    }
  }
  
  disableQuickAttachmentRemoval(): void {
    delete this.infoPopupSettings
    document.removeEventListener('keydown', this.quickAttachmentRemoveCb)
  }

  chooseAttachment(): void {
    this.soundService.goBack()
    this.soundService.highPitched()
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
    return this.globalService.getImageLink(this.weaponConfig)
  }
  
  initialDialogueAction(action: string): void {
    if(action === this.initialDialogueButtons.enterName) {
      // Enter Name
      this.secondDialogueOptions = {
        title: 'enter name',
        form: {
          inputValue: this.newName || this.weaponConfig.armouryName || '',
        }
      }      
    } else {
      if(action === this.initialDialogueButtons.createNewConfig || action === this.initialDialogueButtons.saveConfig) {
        this.weaponConfig.armouryName = this.newName || this.weaponConfig.armouryName
        // Save/Create new modification

        if(this.configService.configDuplicateExists(this.weaponConfig)) {
          this.messageService.addMessage('Notice', 'A modification with that name already exists') // TODO change to overwrite dialogue
          this.refreshInitialDialogue()
          return
        }
        else if(this.configService.saveConfig(this.weaponConfig, true)) {
          this.messageService.addMessage('Modification added to the weapon armoury', this.weaponConfig.armouryName)
          this.initialDialogueOptions = undefined
        } else {
          this.messageService.addMessage('Notice', 'Enter a name to save a custom modification')
          this.refreshInitialDialogue()
          return
        }
      } else if(action === this.initialDialogueButtons.updateConfig) {
        // Update modification
        this.globalService.enableGoBackOnEscape()
        if(this.configService.renameArmouryConfig(this.weaponConfig, this.newName || this.weaponConfig.armouryName)) {
          // this.messageService.addMessage('Modification added to the weapon armoury', this.newName)
          this.messageService.addMessage('Modification updated', this.newName || this.weaponConfig.armouryName)
          this.initialDialogueOptions = undefined
        }
      }
      this.initialDialogueOptions = undefined
      document.addEventListener('keydown', this.showConfigDialogueCB)
      this.globalService.enableGoBackOnEscape()
    }
  }

  secondDialogueAction(name: string): void {
    if(name) {
      this.newName = name
      // console.log('update name: ', name)
    }
    this.secondDialogueOptions = undefined
    // trigger change to register event listener on the first dialogue
    this.refreshInitialDialogue()
  }
  
  refreshInitialDialogue() {
    this.initialDialogueOptions = this.initialDialogueOptions ? JSON.parse(JSON.stringify(this.initialDialogueOptions)) : undefined
  }
}
