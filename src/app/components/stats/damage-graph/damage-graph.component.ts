import { Component, Input, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-damage-graph',
  templateUrl: './damage-graph.component.html',
  styleUrls: ['./damage-graph.component.scss']
})
export class DamageGraphComponent implements OnInit {

  @Input() weaponConfig: WeaponConfig

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  
  damageIntervals: DamageIntervals[]
  promise: Promise<DamageIntervals[]>
  
  invertedScale = 1 // TODO bättre namn
  offset = 50
  padding = 100
  xLineInterval = 50
  yLineInterval = 100

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.promise = this.dataService.getBaseDamageIntervals(this.weaponConfig.weaponName).then(result => this.damageIntervals = result)
    this.drawCanvas()
  }
  
  drawCanvas(): void {
    this.canvas = document.querySelector('canvas')
    this.canvas.setAttribute('width', '500')
    this.canvas.setAttribute('height', '400')
    this.context = this.canvas.getContext('2d')
      
    this.drawGrid()
    this.plotWeaponDamage('head')
  }

  getDPS(damage: number): number { // TODO duplicate method (BaseData component)
    const rateOfFire = this.damageIntervals[0].fire_rate
    return damage * rateOfFire / 60
  }
  
  async drawGrid(): Promise<void> {
    await this.promise

    const rateOfFire = this.damageIntervals[0].fire_rate
    
    const maxDmg = Math.round(this.getDPS(this.damageIntervals[0].head))
    const minDmg = Math.round(this.getDPS(this.damageIntervals[this.damageIntervals.length -1].legs))

    const centerLine = (maxDmg + minDmg) / 2
    console.log(maxDmg, minDmg, centerLine)
    
    // set scale and position
    this.context.translate(this.offset, -centerLine / 2)
    this.context.scale(1 / this.invertedScale, 1)
    // this.context.translate(50, this.canvas.height)
    // this.context.scale(1 / this.invertedScale, 1 / -this.invertedScale)



    this.context.strokeStyle = 'white'
    this.context.lineWidth = .5

    this.context.beginPath()
    // horizontal lines
    for(let yPos = 0; yPos < maxDmg + this.padding; yPos += this.xLineInterval) {  
      this.context.strokeText(yPos + '', -this.offset / 2, yPos)
      this.context.moveTo(0, yPos)
      this.context.lineTo(this.canvas.width * this.invertedScale - this.offset, yPos)
    }
    
    // vertical lines
    for(let xPos = 0; xPos < this.canvas.width * this.invertedScale; xPos += 100) {
      this.context.moveTo(xPos, centerLine / 2)
      this.context.lineTo(xPos, centerLine * 2)
    }

    this.context.stroke()
    this.context.closePath()
  }
  
  async plotWeaponDamage(hitBox: string): Promise<void> {
    await this.promise

    this.context.lineWidth = 2
    this.context.strokeStyle = 'orange'

    this.context.beginPath()
    this.context.moveTo(0, this.getDPS(this.damageIntervals[0][hitBox]))
    // for(let interval of this.damageIntervals) {
    for(let i = 0; i < this.damageIntervals.length; i ++) {
      const interval = this.damageIntervals[i]
      const nextInterval = this.damageIntervals[i + 1] || { distances: 1000 }

      // console.log('lineTo', interval.distances, this.getDPS(interval[hitBox]))
      this.context.lineTo(interval.distances, this.getDPS(interval[hitBox]))
      // console.log('lineTo', nextInterval.distances, this.getDPS(interval[hitBox]))
      this.context.lineTo(nextInterval.distances, this.getDPS(interval[hitBox]))
    }
    
    // this.context.moveTo(0, 350)
    // this.context.lineTo(30.5, 350)
    //   this.context.lineTo(30.5, 288) // vertical
    // this.context.lineTo(54.5, 288)
    //   this.context.lineTo(54.5, 225) // vertical
    // this.context.lineTo(200, 225)
    this.context.stroke()
    this.context.closePath()

  }

}
