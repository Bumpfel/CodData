import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  attachmentType: string
  attachments: string[]
  selectedAttachment: string

  constructor(private configService: WeaponConfigService, private globalService: GlobalService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.attachmentType = this.route.snapshot.paramMap.get('attachmentType')
    this.globalService.goBackOnEscape()
    
    this.attachments = this.configService.getAttachmentsOfType(this.attachmentType)
    this.selectedAttachment = this.configService.getSelectedAttachment(this.attachmentType)
    console.log(this.selectedAttachment)
    
  }

  selectAttachment(attachment): void {
    if(this.configService.setAttachment(this.attachmentType, attachment)) {
      window.history.back()
    } else {
      // TODO replace attachment window
      console.log('too many attachments')
    }
  }

  isSelectedAttachment(attachment: string): boolean {
    return attachment === this.selectedAttachment
  }

}
