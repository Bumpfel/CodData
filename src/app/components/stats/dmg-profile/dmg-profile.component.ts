import { Component, Input, OnInit } from '@angular/core';
import { Effect } from 'src/app/models/Effect';
import { Stats } from 'src/app/models/Stats';
import { DamageInterval } from 'src/app/models/TGD/Data';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { WeaponTypes } from 'src/app/models/WeaponTypes';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dmg-profile',
  templateUrl: './dmg-profile.component.html',
  styleUrls: ['./dmg-profile.component.scss']
})
export class DmgProfileComponent implements OnInit {

  @Input() weaponConfig: WeaponConfig

  weaponStatSummary: Map<string, Effect>
  private baseDamageIntervals: DamageInterval[] // TODO direkt beroende till TGD DATA
  activeDamageInterval: DamageInterval
  
  sliderValue: number = 0
  sliderStyle: string
  sliderMaxRange: number
  intervalsLoaded: boolean = false
  rangeMod: number

  hitBoxes = { // TODO move to data service
    head: 'head',
    torso: 'chest',
    stomach: 'stomach',
    limbs: 'extremities',
  }
  
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }
  
  async ngOnChanges() {
    if(this.weaponConfig) {
      this.intervalsLoaded = false
      
      this.weaponStatSummary = undefined // clear obsolete data
      this.weaponStatSummary = await this.dataService.getWeaponSummary(this.weaponConfig)
      
      this.rangeMod = 1 //this.weaponStatSummary.get(Stats.names.dmg_range).status + 1

      this.baseDamageIntervals = await this.dataService.getBaseDamageIntervals(this.weaponConfig.weaponName)
      this.setDamageInterval(this.sliderValue)
      
      this.styleRangeSlider()
      this.intervalsLoaded = true
    }
  }

  getDamage(hitBox: string) {
    return this.activeDamageInterval[hitBox]
  }
  // getDPS(hitBox: string) {
  //   return Math.round(this.activeDamageInterval[hitBox] * this.activeDamageInterval.fire_rate / 60)
  // }
  // getRateOfFire(): number {
  //   return this.activeDamageInterval.fire_rate
  // }
  // getLockTime(): string {
  //   return this.activeDamageInterval.open_bolt_delay ? (this.activeDamageInterval.open_bolt_delay * 1000) + ' ms' : null
  // }
  
 /**
   * Finds the appropriate interval that covers the range given by the value
   * @param value
   */
  setDamageInterval(value: number): void {   
    let prevInterval: DamageInterval

    for(const interval of this.baseDamageIntervals) {
      if(value <= interval.dropoff * this.rangeMod) {
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
    // (alternative 1) calculate max range based on weapon dmg intervals 
    const smallestTick = 50
    const minimumPadding = 10
    const calc = Math.floor((this.baseDamageIntervals[this.baseDamageIntervals.length - 1].dropoff * this.rangeMod + minimumPadding) / smallestTick) + 1
    this.dataService.getWeaponTypes();
    this.sliderMaxRange = calc * smallestTick

    // (alternative 2) set max range based on type
    // const weaponTypeMaxRanges = new Map([
    //   [WeaponTypes.assaultRifles, 100],
    //   [WeaponTypes.subMachineGuns, 100], // aug 5.56 needs 100+. uzi has exactly 50
    //   [WeaponTypes.lightMachineGuns, 100],
    //   [WeaponTypes.marksmanRifles, 150],
    //   [WeaponTypes.sniperRifles, 150],
    // ])
    // this.sliderMaxRange = weaponTypeMaxRanges.get(this.weaponConfig.weaponType)
    
    const colours = ['#444', '#666', '#aaa', '#ddd']

    // calculate break point percentages
    const arr: number[] = []

    for(let interval of this.baseDamageIntervals) {
      const calc = interval.dropoff * this.rangeMod / this.sliderMaxRange * 100
      arr.push(calc)
    }
    arr.push(100)   

    // build style with break point ticks
    let sliderGradient = 'to right'
    for(let i = 0; i < this.baseDamageIntervals.length; i ++) {
      // const dropoff = this.baseDamageIntervals[i].dropoff
      
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
