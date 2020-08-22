import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private configService: WeaponConfigService, private soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.attachmentType = this.route.snapshot.paramMap.get('attachmentType')
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    
    this.globalService.navigateOnEscape('/' + slot + '/gunsmith/', this.router)
    
    this.attachments = this.configService.getAttachments(this.attachmentType)
    this.selectedAttachment = this.configService.getSelectedAttachment(slot, this.attachmentType)
  }
  
  selectAttachment(attachment): void {
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))

    let status = this.configService.setAttachment(slot, this.attachmentType, attachment)
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
