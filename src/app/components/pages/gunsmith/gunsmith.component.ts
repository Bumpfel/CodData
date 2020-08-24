import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponConfig: WeaponConfig
  upperAttachments: string[]
  lowerAttachments: string[]
  
  loaded: boolean = false

  upperAttachmentsMap: Map<string, number>
  lowerAttachmentsMap: Map<string, number>

  constructor(private route: ActivatedRoute, private router: Router, private globalService: GlobalService, private configService: WeaponConfigService, private soundService: SoundService) { }

  ngOnInit(): void {
    this.globalService.goBackOnEscape()

    let slot: number = parseInt(this.route.snapshot.paramMap.get('slot'))
    this.weaponConfig = this.configService.getWeaponConfig(slot)

    // using these to show the most common attachment slots before the async call has returned
    // this.upperAttachments = ['muzzle', 'barrel', 'laser', 'optic', 'stock']
    // this.lowerAttachments = ['underbarrel', 'ammunition', 'rear grip', 'perk']

    this.upperAttachmentsMap = new Map([
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

    this.lowerAttachmentsMap = new Map([
      ['underbarrel', 0],
      ['trigger action', 0],
      ['ammunition', 1],
      ['bolt', 1],
      ['rear grip', 2],
      ['guard', 2],
      ['perk', 3],
    ])
    
    document.addEventListener('keydown', e => {     
      if(e.key === '1') { // TODO save once
        // TODO save form
        console.log('saved')
        this.weaponConfig.armouryName = 'temp' // TODO temp
        this.configService.saveConfig(this.weaponConfig, true)
      }
    })

    this.mapAttachmentSlots() // async
  }


  async mapAttachmentSlots(): Promise<void> {
    const availableAttachmentSlots: Set<string> = await this.configService.getAvailableAttachmentSlots(this.weaponConfig.weaponName)

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
    this.loaded = true
  }

  navigate(attachmentSlot: string) {
    // console.log(attachmentSlot)
    
    if(!this.configService.getBlockingAttachment(this.weaponConfig, attachmentSlot)) {
      this.router.navigate([attachmentSlot], { relativeTo: this.route })
    }
  }
}
