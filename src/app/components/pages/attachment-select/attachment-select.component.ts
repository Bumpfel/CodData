import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { SoundService } from 'src/app/services/sound.service';
import { MessageService } from 'src/app/services/message.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { Effect } from 'src/app/models/Effect';
import { AttachmentData } from 'src/app/models/TGD/Data';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  weaponConfig: WeaponConfig
  attachmentSlot: string
  attachments: AttachmentData[]
  selectedAttachmentName: string // tgd attachment
  hoveredAttachment: AttachmentData // tgd attachment
  hoveredAttachmentEffects: Map<string, Effect>

  constructor(private configService: WeaponConfigService, public soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {   
    this.attachmentSlot = this.route.snapshot.paramMap.get('attachmentSlot')
    let slot = parseInt(this.route.snapshot.paramMap.get('slot'))
    
    this.globalService.goBackOnEscape()
    
    this.selectedAttachmentName = this.configService.getSelectedAttachmentName(slot, this.attachmentSlot)
    this.weaponConfig = this.configService.getWeaponConfig(slot)

    this.mapAttachments()
  }
  
  async mapAttachments(): Promise<void> {
    this.attachments = await this.configService.getAttachmentsOfType(this.weaponConfig.weaponName, this.attachmentSlot) // TODO class should not deal with raw TGD data
    const attachmentData = this.attachments.find(attachment => attachment.attachment === this.selectedAttachmentName)   
    this.setHoveredAttachment(this.selectedAttachmentName ? attachmentData : this.attachments[0])
  }
  
  selectAttachment(attachmentName: string): void {
    let slot = parseInt(this.route.snapshot.paramMap.get('slot'))

    let status = this.configService.setAttachment(slot, this.attachmentSlot, attachmentName)
    if(status === this.configService.editStatus.EQUIPPED) {
      this.messageService.addMessage('Attachment Equipped', attachmentName) // temp
      window.history.back()
    } else if(status === this.configService.editStatus.UNEQUIPPED) {
      this.selectedAttachmentName = undefined
    } else if(status === this.configService.editStatus.BLOCKED) {
      this.messageService.addMessage('Cannot equip attachments', 'This attachment is blocked by another attachment')
    } else if(status === this.configService.editStatus.TOOMANY) {
      // TODO replace attachment window
      this.messageService.addMessage('Cannot equip attachments', 'You have too many attachments equipped already') // temp
    }
  }

  isSelectedAttachment(attachment: AttachmentData): boolean {
    if(attachment) {
      return attachment.attachment === this.selectedAttachmentName
    }
    return false
  }

  private async setHoveredAttachment(attachment: AttachmentData): Promise<void> {
    this.hoveredAttachment = attachment
    this.hoveredAttachmentEffects = await this.configService.getEffects(attachment, this.weaponConfig.weaponName)
  }

  log(...what: any[]): void { // TODO debug
    console.log(what)
  }
}
