import { Component, OnInit } from '@angular/core';
import { SelectService } from 'src/app/services/select.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-weapontype-select',
  templateUrl: './weapontype-select.component.html',
  styleUrls: ['./weapontype-select.component.scss']
})
export class WeapontypeSelectComponent implements OnInit {
  selectedWeaponType: string
  weaponTypes: string[] // TODO of type (interface) weapon
  
  constructor(public selectService: SelectService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.weaponTypes = this.selectService.getWeaponTypes()
    // this.selectedWeaponType = this.weaponTypes[0]

    // console.log('top-menu', this.route.snapshot.paramMap.get('type'))
    
    // this.route.paramMap.subscribe(params => {
    //   console.log(this.route.snapshot.data) 
    //   let type = params.get('type')
    //   this.selectedWeaponType = type
    //   // console.log('debug')
      
    // })
  }

  setWeaponType(type: string): void {
    this.selectedWeaponType = type
    this.selectService.setWeaponType(type)
  }

  iSelectedWeaponType(type: string): boolean {
    return type === this.selectedWeaponType
  }

}
