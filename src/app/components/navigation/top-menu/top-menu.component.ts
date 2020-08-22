import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  @Input() title: string
  @Input() menuItems: string[]
  // @Input() link: string = ''

  constructor(public globalService: GlobalService) { }

  ngOnInit(): void {
  }

}
