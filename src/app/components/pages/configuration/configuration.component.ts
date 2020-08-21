import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  constructor(private globalService: GlobalService) { }
  
  configurations: any[] = [
    { weaponName: 'kilo 141', attachments: { muzzle: 'Monolithic Suppressor' } },
  ]

  ngOnInit(): void {
  }

}
