import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute } from '@angular/router';
import { SelectService } from 'src/app/services/select.service';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  attachmentType: string
  attachments: string[]

  constructor(private selectService: SelectService, private globalService: GlobalService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.attachmentType = this.route.snapshot.paramMap.get('attachmentType')
    this.globalService.goBackOnEscape()
    
    this.attachments = this.selectService.getAttachmentsOfType(this.attachmentType);
  }

}
