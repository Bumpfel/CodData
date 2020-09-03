import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
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
  attachments: any[]
  selectedAttachmentName: string // tgd attachment
  hoveredAttachment: any // tgd attachment

  hoveredAttachmentEffects: Array<Effect> = []

  // hoveredAttachmentPositiveEffects: Array<Effect> = []
  // hoveredAttachmentNegativeEffects: Array<Effect> = []

  constructor(private configService: WeaponConfigService, private soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {   
    this.attachmentSlot = this.route.snapshot.paramMap.get('attachmentSlot')
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    
    // this.globalService.navigateOnEscape('/' + slot + '/gunsmith/', this.router)   
    this.globalService.goBackOnEscape()
    
    this.selectedAttachmentName = this.configService.getSelectedAttachmentName(slot, this.attachmentSlot)

    this.weaponConfig = this.configService.getWeaponConfig(slot)

    this.mapAttachments()
  }
  
  async mapAttachments(): Promise<void> {
    this.attachments = await this.configService.getAttachments(this.weaponConfig.weaponName, this.attachmentSlot)
    this.setHoveredAttachment(this.selectedAttachmentName ? this.getAttachmentData(this.selectedAttachmentName) : this.attachments[0])
  }

  getAttachmentData(attachmentName: string): any {
    return this.attachments.find(attachment => attachment.attachment === attachmentName)
  }
  
  selectAttachment(attachmentName: string): void {
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))

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

  isSelectedAttachment(attachment: any): boolean {
    if(attachment) {
      return attachment.attachment === this.selectedAttachmentName
    }
    return false
  }

  async setHoveredAttachment(attachment: any): Promise<void> {
    this.hoveredAttachment = attachment
    // this.hoveredAttachmentEffects = await this.configService.getAttachmentEffects(attachment, this.weaponConfig.weaponName)
  }
}
