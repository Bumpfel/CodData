import { KeyValue } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { range } from 'rxjs';
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

  baseData: Promise<any>

  sliderValue: number = 0
  maxRange: number
  intervalsLoaded: boolean = false
  
  hitBoxes = { // TODO move to data service
    head: 'head',
    torso: 'chest',
    stomach: 'stomach',
    limbs: 'legs',
  }

  // sortHitBoxes(a: KeyValue<string, string>, b: KeyValue<string, string>) {
  //   return a.key.localeCompare(b.key)
  // }

  constructor(private dataService: DataService, private globalService: GlobalService) { }

   ngOnInit(): void {
    this.statOrder = Stats.getAllOrderedStats()
    this.baseData = this.dataService.getBaseDamage(this.weaponConfig.weaponName).then(result => {
      this.baseDamageIntervals = result
      this.activeDamageInterval = result[0]
    })
      
    this.drawCanvas()
  }
    
  async ngOnChanges() {
    console.log('changes detected')
    this.intervalsLoaded = false
    
    this.weaponStatSummary = undefined // clear obsolete data
    this.weaponStatSummary = await this.dataService.getWeaponSummary(this.weaponConfig)
    
    await this.baseData
    this.styleRangeSlider()
    console.log('loaded')
    
    this.intervalsLoaded = true
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
  
  /**
   * Finds the appropriate interval that covers the range given by the value
   * @param value
   */
  setDamageInterval(value: number): void {
    let prevInterval: WeaponDamage
    const rangeMod = this.weaponStatSummary.get(Stats.names.dmg_range).status + 1

    for(const interval of this.baseDamageIntervals) {
      if(value <= interval.distances * rangeMod) {
        this.activeDamageInterval = prevInterval || interval
        return
      }
      prevInterval = interval
    }
    this.activeDamageInterval = this.baseDamageIntervals[this.baseDamageIntervals.length - 1]
  }
 
  getRangeDisplay(value: number): string {
    let ret: string = value + ''
    
    if(value == this.maxRange) {
      ret += '+'
    }
    return ret + ' meters'
  }

  styleRangeSlider() {
    // calculate max range
    const smallestTick = 50
    const rangeMod = this.weaponStatSummary.get(Stats.names.dmg_range).status + 1
    const calc = Math.floor(this.baseDamageIntervals[this.baseDamageIntervals.length - 1].distances * rangeMod / smallestTick) + 1
    this.maxRange = calc * smallestTick
    
    const colours = ['#444', '#666', '#aaa', '#ddd']

    // calculate break point percentages
    const arr: number[] = []
    for(let interval of this.baseDamageIntervals) {
      const calc = interval.distances * rangeMod / this.maxRange * 100
      arr.push(calc)
    }
    arr.push(100)

    // build style with break point ticks
    let style = 'to right'
    for(let i = 0; i < this.baseDamageIntervals.length; i ++) {
      style += ', ' + colours[i] + ' ' + arr[i] + '%'
      style += ', ' + colours[i] + ' ' + arr[i + 1] + '%'
    }

    // apply style to slider
    setTimeout(() => {
      const slider = (document.querySelector('#rangeSlider') as HTMLElement)
      slider.style.backgroundImage = 'linear-gradient(' + style + ')'
      
      slider.setAttribute('max', this.maxRange + '')
      this.setDamageInterval(this.sliderValue)
    }, 0)
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

  

}
