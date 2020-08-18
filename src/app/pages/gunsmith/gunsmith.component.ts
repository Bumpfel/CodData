import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { SelectService } from 'src/app/services/select.service';
import { Location } from '@angular/common'

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponTitle: string

  constructor(private route: ActivatedRoute, private globalService: GlobalService, private selectService: SelectService, private _location: Location) { }

  ngOnInit(): void {
    // TODO check that the weapon exists
    // this.selectService.getWeaponsOfTypeSync()

    this.weaponTitle = this.route.snapshot.paramMap.get('weaponName').split('_').join(' ')

    this.globalService.goBackOnEscape()
  }
}
