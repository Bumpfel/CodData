import { Component, OnInit } from '@angular/core';
import { SelectService } from 'src/app/services/select.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  activeWeapons: string[]

  constructor(public selectService: SelectService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.selectService.getSelectedWeaponType().subscribe(type => {
      this.activeWeapons = this.selectService.getWeaponsOfTypeSync(type)
      console.log(this.activeWeapons)
      
    })

  }

}
