import { Component, Input, OnInit } from '@angular/core';
import { Effect } from 'src/app/models/Effect';
import { Stats } from 'src/app/models/Stats';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dmg-profile',
  templateUrl: './dmg-profile.component.html',
  styleUrls: ['./dmg-profile.component.scss']
})
export class DmgProfileComponent implements OnInit {

  @Input() weaponConfig: WeaponConfig

  weaponStatSummary: Map<string, Effect>
  private baseDamageIntervals: DamageIntervals[] // TODO direkt beroende till TGD DATA
  activeDamageInterval: DamageIntervals
  
  sliderValue: number = 0
  sliderStyle: string
  sliderMaxRange: number
  intervalsLoaded: boolean = false
  rangeMod: number

  hitBoxes = { // TODO move to data service
    head: 'head',
    torso: 'chest',
    stomach: 'stomach',
    limbs: 'legs',
  }
  
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }
  
  async ngOnChanges() {
    if(this.weaponConfig) {
      this.intervalsLoaded = false
      
      this.weaponStatSummary = undefined // clear obsolete data
      this.weaponStatSummary = await this.dataService.getWeaponSummary(this.weaponConfig)     


      const baseData = await this.dataService.getBaseDamageIntervals(this.weaponConfig.weaponName)
      this.baseDamageIntervals = baseData
      this.rangeMod = this.weaponStatSummary.get(Stats.names.dmg_range).status + 1
      // this.activeDamageInterval = baseData[0]
      this.setDamageInterval(this.sliderValue)
      
      this.styleRangeSlider()
      this.intervalsLoaded = true
    }
  }

  getDamage(hitBox: string) {
    return this.activeDamageInterval[hitBox]
  }
  getDPS(hitBox: string) {
    return Math.round(this.activeDamageInterval[hitBox] * this.activeDamageInterval.fire_rate / 60)
  }
  getRateOfFire(): number {
    return this.activeDamageInterval.fire_rate
  }
  getLockTime(): string {
    return this.activeDamageInterval.open_bolt_delay ? (this.activeDamageInterval.open_bolt_delay * 1000) + ' ms' : null
  }
  
 /**
   * Finds the appropriate interval that covers the range given by the value
   * @param value
   */
  setDamageInterval(value: number): void {   
    let prevInterval: DamageIntervals

    for(const interval of this.baseDamageIntervals) {
      if(value <= interval.distances * this.rangeMod) {
        this.activeDamageInterval = prevInterval || interval
        return
      }
      prevInterval = interval
    }
    this.activeDamageInterval = this.baseDamageIntervals[this.baseDamageIntervals.length - 1]
  }
 
  getRangeDisplay(value: number): string {
    let ret: string = value + ''
    
    if(value == this.sliderMaxRange) {
      ret += '+'
    }
    return ret + ' meters'
  }

  private styleRangeSlider(): void {
    // calculate max range
    const smallestTick = 50
    const calc = Math.floor(this.baseDamageIntervals[this.baseDamageIntervals.length - 1].distances * this.rangeMod / smallestTick) + 1
    this.sliderMaxRange = calc * smallestTick
    
    const colours = ['#444', '#666', '#aaa', '#ddd']

    // calculate break point percentages
    const arr: number[] = []
    for(let interval of this.baseDamageIntervals) {
      const calc = interval.distances * this.rangeMod / this.sliderMaxRange * 100
      arr.push(calc)
    }
    arr.push(100)

    // build style with break point ticks
    let sliderGradient = 'to right'
    for(let i = 0; i < this.baseDamageIntervals.length; i ++) {
      sliderGradient += ', ' + colours[i] + ' ' + arr[i] + '%'
      sliderGradient += ', ' + colours[i] + ' ' + arr[i + 1] + '%'
    }

    this.sliderStyle = 'background-image: linear-gradient(' + sliderGradient + ')'
  }


  // getDamagePerMag(hitBox: string) {
  //   if(this.weaponStatSummary) {
  //     console.log(this.weaponStatSummary.get(Stats.names.mag_size))
  //     return this.weaponStatSummary.get(Stats.names.mag_size).status
  //     // this.activeDamageInterval[hitBox] *
  //   }
  // }
}
