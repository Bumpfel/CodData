import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { SoundService } from 'src/app/services/sound.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  attachmentType: string
  attachments: string[]
  selectedAttachment: string

  constructor(private configService: WeaponConfigService, private soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit(): void {
    this.attachmentType = this.route.snapshot.paramMap.get('attachmentType')
    this.globalService.goBackOnEscape()
    
    this.attachments = this.configService.getAttachmentsOfType(this.attachmentType)
    this.selectedAttachment = this.configService.getSelectedAttachment(this.attachmentType)
  }

  selectAttachment(attachment): void {
    let status = this.configService.setAttachment(this.attachmentType, attachment)
    if(status === this.configService.editStatus.EQUIPPED) {
      this.messageService.addMessage('Attachment Equipped', attachment) // temp
      window.history.back()
    } else if(status === this.configService.editStatus.UNEQUIPPED) {
        this.selectedAttachment = undefined
    } else {
      // TODO replace attachment window
      this.messageService.addMessage('Too many attachments', '') // temp
    }
  }

  isSelectedAttachment(attachment: string): boolean {
    return attachment === this.selectedAttachment
  }

}
