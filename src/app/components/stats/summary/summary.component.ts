import { Component, Input, OnInit } from '@angular/core';
import { Effect } from 'src/app/models/Effect';
import { Stats } from 'src/app/models/Stats';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  
  @Input() weaponConfig: WeaponConfig
  @Input() condensed: boolean = false

  weaponStatSummary: Map<string, Effect>
  statOrder: string[]

  condensedSkipStats = [Stats.names.dmg_range, Stats.names.recoil_control, Stats.names.recoil_stability]

  constructor(private dataService: DataService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.statOrder = Stats.getAllOrderedStats()
  }
    
  async ngOnChanges() {
    if(this.weaponConfig) {
      this.weaponStatSummary = undefined // clear obsolete data
      this.weaponStatSummary = await this.dataService.getWeaponSummary(this.weaponConfig)

      if(this.condensed === true) {

        for(const skipStat of this.condensedSkipStats) {
          this.statOrder = this.statOrder.filter(stat => stat !== skipStat)
        }
      }
    }
  }  
 
}
