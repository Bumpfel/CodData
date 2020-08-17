import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-gunsmith',
  templateUrl: './gunsmith.component.html',
  styleUrls: ['./gunsmith.component.scss']
})
export class GunsmithComponent implements OnInit {

  weaponTitle: string

  constructor(private route: ActivatedRoute, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.weaponTitle = this.route.snapshot.paramMap.get('weaponName').split('_').join(' ')

    this.globalService.goBackOnEscape()
  }
}
