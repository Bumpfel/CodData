import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { SoundService } from 'src/app/services/sound.service';
import { MessageService } from 'src/app/services/message.service';
import { TgdData } from 'src/app/models/TgdData'
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-attachment-select',
  templateUrl: './attachment-select.component.html',
  styleUrls: ['./attachment-select.component.scss']
})
export class AttachmentSelectComponent implements OnInit {

  // private weaponData: any // tgd weapon
  attachmentSlot: string
  attachments: any[]
  selectedAttachmentName: string // tgd attachment
  hoveredAttachment: any // tgd attachment

  hoveredAttachmentPositiveEffects: Array<object> = []
  hoveredAttachmentNegativeEffects: Array<object> = []

  constructor(private configService: WeaponConfigService, private soundService: SoundService, private globalService: GlobalService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {   
    this.attachmentSlot = this.route.snapshot.paramMap.get('attachmentSlot')
    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    
    // this.globalService.navigateOnEscape('/' + slot + '/gunsmith/', this.router)   
    this.globalService.goBackOnEscape()
    
    this.selectedAttachmentName = this.configService.getSelectedAttachmentName(slot, this.attachmentSlot)

    const weaponConfig = this.configService.getWeaponConfig(slot)

    this.mapAttachments(weaponConfig.weaponName)
    // this.weaponData = this.configService.getWeapon(weaponConfig.weaponName)    
  }
  
  async mapAttachments(weaponName: string): Promise<void> {
    this.attachments = await this.configService.getAttachments(weaponName, this.attachmentSlot)
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

  setHoveredAttachment(attachment: any): void { // TODO keeping this here adds dependency to TgdData
    this.hoveredAttachment = attachment
    this.hoveredAttachmentPositiveEffects = []
    this.hoveredAttachmentNegativeEffects = []

    for(let key in this.hoveredAttachment) { // TODO not the best variable names here
      const value = this.hoveredAttachment[key]
      
      const positiveModEffect = TgdData.positiveModEffect.get(key)

      let comparableEffect: number // positive effect = pro, negative effect = con, neutral effect = none
      if(positiveModEffect) {
        if(positiveModEffect === TgdData.positiveEffects.greaterThan1) {
          comparableEffect = value - 1
        } else if(positiveModEffect === TgdData.positiveEffects.lessThan1) {
          comparableEffect = (value - 1) * -1
        } else if(positiveModEffect === TgdData.positiveEffects.negative) {
          comparableEffect = value * -1
        }

        const obj = {label: key, value: value}
        
        if(comparableEffect > 0) {
          this.hoveredAttachmentPositiveEffects.push(obj)
        } else if(comparableEffect < 0) {
          this.hoveredAttachmentNegativeEffects.push(obj)
        }
      }
    }
    // console.log(attachment)
    
    // console.log(this.hoveredAttachmentPositiveEffects.length + ' PROS: ', this.hoveredAttachmentPositiveEffects)
    // console.log(this.hoveredAttachmentNegativeEffects.length + ' CONS', this.hoveredAttachmentNegativeEffects)
  }

  getEffectDisplayName(effectLabel: string): string {
    return TgdData.getEffectDisplayName(effectLabel)
  }

  getEffectDisplayValue(effectLabel: string, effectValue: number, isPositive: boolean): string {
   return TgdData.getEffectDisplayValue(effectLabel, effectValue, isPositive)
  }

}
