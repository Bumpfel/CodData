import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {

  @Input() title: string
  @Input() menuItems: string[]

  constructor(public globalService: GlobalService, public soundService: SoundService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
  }

  navigate(path: string) {
    this.router.navigate([ '../' + this.globalService.nameToLink(path) ], { relativeTo: this.route, replaceUrl: true })
  }

  isActive(path : string) {
    return this.globalService.nameToLink(path) === this.route.snapshot.paramMap.get('weaponType')
  }

}
