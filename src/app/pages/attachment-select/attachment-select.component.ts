import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { DataService } from 'src/app/services/data.service';
import { SoundService } from 'src/app/services/sound.service';
import { MessageService } from 'src/app/services/message.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { Effect } from 'src/app/models/Effect';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  weaponConfig: WeaponConfig
  attachmentSlot: string
  attachments: {[key: string]: Map<string, Effect>}
  selectedAttachmentName: string
  hoveredAttachment: Map<string, Effect>
  hoveredAttachmentName: string

  constructor(private configService: WeaponConfigService, private dataService: DataService, public soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {   
    this.attachmentSlot = this.route.snapshot.paramMap.get('attachmentSlot')
    let slot = parseInt(this.route.snapshot.paramMap.get('slot'))
    
    this.globalService.enableGoBackOnEscape()
    
    this.selectedAttachmentName = this.configService.getSelectedAttachmentName(slot, this.attachmentSlot)
    this.weaponConfig = this.configService.getWeaponConfig(slot)
    
    this.mapAttachmentEffects()
  }
  
  async mapAttachmentEffects(): Promise<void> {
    this.attachments = await this.dataService.getAttachmentsEffectsOfType(this.weaponConfig.weaponName, this.attachmentSlot)
    let firstInList =  Object.keys(this.attachments).sort((a, b) => a.localeCompare(b))[0]
    this.setHoveredAttachment(this.selectedAttachmentName ? this.selectedAttachmentName : firstInList)
  }
  
  selectAttachment(attachmentName: string): void {
    this.soundService.select()

    let slot = parseInt(this.route.snapshot.paramMap.get('slot'))

    let status = this.configService.setAttachment(slot, this.attachmentSlot, attachmentName)
    if(status === this.configService.editStatus.EQUIPPED) {
      this.messageService.addMessage('Attachment Equipped', attachmentName)
      window.history.back()
      this.soundService.goBack()
    } else if(status === this.configService.editStatus.UNEQUIPPED) {
      this.selectedAttachmentName = undefined
    } else if(status === this.configService.editStatus.BLOCKED) {
      this.messageService.addMessage('Cannot equip attachments', 'This attachment is blocked by another attachment')
    } else if(status === this.configService.editStatus.TOOMANY) {
      // TODO replace attachment window
      this.messageService.addMessage('Cannot equip attachments', 'You have too many attachments equipped already') // temp
    }
  }

  isSelectedAttachment(attachmentName: string): boolean {    
    if(attachmentName) {
      return attachmentName === this.selectedAttachmentName
    }
    return false
  }

  private async setHoveredAttachment(attachmentName: string): Promise<void> {
    this.soundService.hover()
    this.hoveredAttachment = this.attachments[attachmentName]
    this.hoveredAttachmentName = attachmentName
  }

  log(...what: any[]): void { // TODO debug
    console.log(what)
  }
}
