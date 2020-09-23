import { Component, Input, OnInit } from '@angular/core';
import { Effect } from 'src/app/models/Effect';
import { Stats } from 'src/app/models/Stats';
import { WeaponData } from 'src/app/models/TGD/Data';
import { WeaponDamage } from 'src/app/models/TGD/WeaponDamage';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  
  @Input() weaponConfig: WeaponConfig

  weaponStatSummary: Map<string, Effect>
  statOrder: string[]
  private baseDamageIntervals: WeaponDamage[] // TODO direkt beroende till TGD DATA
  activeDamageInterval: WeaponDamage

  baseStatsWidth: number = 300
  private lastIntervalPercentagePosition = 75

  hitBoxes: Map<string, string> = new Map([ // move to data service...?
    ['head', 'head'],
    ['torso', 'chest'],
    ['stomach', 'stomach'],
    ['limbs', 'legs'],
  ])

  constructor(private dataService: DataService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.weaponStatSummary = null // clears obsolete data
    this.statOrder = Stats.getAllOrderedStats()
    this.dataService.getBaseDamage(this.weaponConfig.weaponName).then(result => { 
      this.baseDamageIntervals = result
      this.activeDamageInterval = result[0]
      console.log(this.baseDamageIntervals)

      const colours = ['$meterBG', 'grey', 'lightgrey', 'white']      
      const arr = this.getDamageRangeIntervals()


      let style = 'to right'
      for(let i = 0; i < this.baseDamageIntervals.length; i ++) {
        style += ', ' + colours[i] + ' ' + arr[i] 
      }    
    
      console.log(style)
      

      setTimeout(() => (document.querySelector('#rangeSlider') as HTMLElement).style.backgroundImage = 
      'linear-gradient(' + style + ')', 0)
    })

    // this.dataService.getBaseStats(this.weaponConfig.weaponName).then(result => {
    //   this.baseStats = result
    // })

    this.drawCanvas()
  }
 
  drawCanvas(): void {
    const xMult = 1.5

    const canvas = document.querySelector('canvas')
    canvas.setAttribute('width', '500')
    canvas.setAttribute('height', '400')
    const context = canvas.getContext('2d')
    
    context.strokeStyle = 'orange'
    this.plotWeaponDamage(context)

  }

  plotWeaponDamage(canvasContext: CanvasRenderingContext2D, ...lines) {
    const xMult = 1.5

    canvasContext.beginPath()
    canvasContext.moveTo(0, 350)
    canvasContext.lineTo(30.5 * xMult, 350)
      canvasContext.lineTo(30.5 * xMult, 288) // vertical
    canvasContext.lineTo(54.5 * xMult, 288)
      canvasContext.lineTo(54.5 * xMult, 225) // vertical
    canvasContext.lineTo(200 * xMult, 225)
    canvasContext.stroke()
    canvasContext.closePath()

  }

  ngOnChanges(): void {
    this.weaponStatSummary = undefined
    this.dataService.getWeaponSummary(this.weaponConfig).then(result => {
      this.weaponStatSummary = result
    })
  }

  // getDamageRangeInterval(damageInterval: WeaponDamage): string {
  //   if(this.weaponStatSummary) {
  //     const index = this.baseDamage.findIndex(interval => interval === damageInterval)
  //     const rangeMod = 1 + this.weaponStatSummary.get(Stats.names.dmg_range).status
  //     const from = this.globalService.round(this.baseDamage[index].distances * rangeMod, 1)
  //     const to = index + 1 < this.baseDamage.length
  //       ? ' - ' + this.globalService.round(this.baseDamage[index + 1].distances * rangeMod, 1)
  //       : ' +'
     
  //     return from + to + ' m'
  //   }
  // }

  /**
   * Finds the appropriate interval that covers the range given by the value
   * @param value
   */
  setDamageInterval(value: number): void {
    let prevInterval: WeaponDamage
    for(const interval of this.baseDamageIntervals) {
      if(value < interval.distances) {
        this.activeDamageInterval = prevInterval || interval
        return
      }
      prevInterval = interval
    }
    this.activeDamageInterval = this.baseDamageIntervals[this.baseDamageIntervals.length - 1]
  }
  
  getSliderRange(): number {
    return Math.round(this.baseDamageIntervals[this.baseDamageIntervals.length - 1].distances / this.lastIntervalPercentagePosition * 100)
  }
 
  /**
   * Used to add ticks for the range slider
   */
  getDamageRangeIntervals() {
    let intervals = []
    const ratio = (this.lastIntervalPercentagePosition / 100) * this.baseStatsWidth / this.baseDamageIntervals[this.baseDamageIntervals.length - 1].distances

    let totalWidth = 0
    for(let i = 1; i < this.baseDamageIntervals.length; i ++) {
      const interval = this.baseDamageIntervals[i].distances
      const calc = interval * ratio - totalWidth
      intervals.push(calc)
      totalWidth += calc
    }
    
    return intervals
  }
  // getDamageRangeIntervals() {
  //   let intervals = {} // display interval + element width
  //   const ratio = (this.lastIntervalPercentagePosition / 100) * this.baseStatsWidth / this.baseDamageIntervals[this.baseDamageIntervals.length - 1].distances

  //   let totalWidth = 0
  //   for(let i = 1; i < this.baseDamageIntervals.length; i ++) {
  //     const interval = this.baseDamageIntervals[i].distances
  //     const calc = interval * ratio - totalWidth
  //     intervals[interval] = calc
  //     totalWidth += calc
  //   }
    
  //   return intervals
  // }

  getRangeDisplay(value: number): string {
    let ret: string = value + ''
    
    if(value == this.getSliderRange()) {
      ret += '+'
    }
    return ret + ' meters'
  }

  // getDamageRangeInterval(damageInterval: WeaponDamage): number {
  //   if(this.weaponStatSummary) {
  //     const max = 200
  //     const index = this.baseDamageIntervals.findIndex(interval => interval === damageInterval) + 1
  //     const distance = this.baseDamageIntervals[index].distances

  //     const rangeMod = 1 + this.weaponStatSummary.get(Stats.names.dmg_range).status
  //     return this.globalService.round(distance * rangeMod, 1)
  //   }
  // }

  getDamage(hitBox: string) {
    return this.activeDamageInterval[hitBox]
  }
  
  getDPS(hitBox: string) {
    return Math.round(this.activeDamageInterval[hitBox] * this.activeDamageInterval.fire_rate / 60)
  }

  getRateOfFire(): number {
    return this.activeDamageInterval.fire_rate
  }

  // getDamagePerMag(hitBox: string) {
  //   if(this.weaponStatSummary) {
  //     console.log(this.weaponStatSummary.get(Stats.names.mag_size))
  //     return this.weaponStatSummary.get(Stats.names.mag_size).status
  //     // this.activeDamageInterval[hitBox] *
  //   }
  // }
  
  getLockTime(): number {
      return this.activeDamageInterval.open_bolt_delay
  }

}
