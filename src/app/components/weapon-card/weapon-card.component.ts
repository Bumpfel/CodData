import { Component, OnInit, Input, HostListener } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { WeaponConfigService } from 'src/app/services/weapon-config.service';
import { WeaponConfig } from 'src/app/models/WeaponConfig';

@Component({
  selector: 'app-weapon-card',
  templateUrl: './weapon-card.component.html',
  styleUrls: ['./weapon-card.component.scss']
})
export class WeaponCardComponent implements OnInit {

  @Input() config: WeaponConfig
  @Input() link: string
  // @HostListener('click') onClick() {
  //   this.configService.saveConfig(this.config)
  // }

  constructor(public globalService: GlobalService, private configService: WeaponConfigService) { }

  ngOnInit(): void {
  }

  err(event) {
    event.target.src = '/assets/images/no_image.png'
  }

}
