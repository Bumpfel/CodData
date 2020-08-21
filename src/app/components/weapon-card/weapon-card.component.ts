import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-weapon-card',
  templateUrl: './weapon-card.component.html',
  styleUrls: ['./weapon-card.component.scss']
})
export class WeaponCardComponent implements OnInit {

  @Input() weapon: any
  @Input() link: string

  constructor(public globalService: GlobalService) { }

  ngOnInit(): void {
  }

}
