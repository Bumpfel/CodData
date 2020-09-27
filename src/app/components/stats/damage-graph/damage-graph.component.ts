import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit } from '@angular/core';
import { interval, of } from 'rxjs';
import { Effect } from 'src/app/models/Effect';
import { Stats } from 'src/app/models/Stats';
import { DamageIntervals } from 'src/app/models/TGD/WeaponDamage';
import { WeaponConfig } from 'src/app/models/WeaponConfig';
import { DataService } from 'src/app/services/data.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-damage-graph',
  templateUrl: './damage-graph.component.html',
  styleUrls: ['./damage-graph.component.scss']
})
export class DamageGraphComponent implements OnInit {

  @Input() weaponConfigs: WeaponConfig[]

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  
  weaponStatSummaries: {[key: string]: Map<string, Effect>} = {}
  damageIntervals: {[key: string]: DamageIntervals[]} = {}
  // summaryPromises: {[key: string]: Promise<Map<string, Effect>>} = {}
  // intervalPromises: {[key: string]: Promise<DamageIntervals[]>} = {}
  promises: {[key: string]: Promise<any>} = {}
  // paths: Map<WeaponConfig, Path2D> = new Map()

  plotColours = ['orange', 'teal', 'orchid', 'brown', 'lightcoral', 'beige', 'olivedrab', 'cornflowerblue', 'turquoise', 'orangered']

  xScale = 4 // TODO calc dynamically
  canvasScale = 1

  hitBoxes = { head: 'head', torso: 'chest', stomach: 'stomach', limbs: 'legs' } // move to some tgd class, and access through dataservice
  selectedHitBox = this.hitBoxes.head
  // hidden = 'hidden'
  extraAttributes = { hidden: 'hidden', colour: 'colour'}

  constructor(private dataService: DataService, private globalService: GlobalService) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if(this.weaponConfigs && this.weaponConfigs.length > 0) {
      for(let config of this.weaponConfigs) {
        this.promises[config.weaponName + 'Summary'] = this.dataService.getWeaponSummary(config).then(result => this.weaponStatSummaries[config.comparisonSlot] = result)
        this.promises[config.weaponName + 'Interval'] = this.dataService.getBaseDamageIntervals(config.weaponName).then(result => this.damageIntervals[config.weaponName] = result)
      }
      this.drawCanvas()
    }
  }

  setHitBox(hitBox: string) {
    // needed since the ngModel-bind is slow (happens after the graph is drawn)
    this.selectedHitBox = hitBox
    this.drawCanvas()
  }
  
  zoomCanvas(event: WheelEvent): void {
    event.preventDefault()
    const ratio = 1.1

    if(event.deltaY < 0) {
      this.canvasScale *= ratio
    } if(event.deltaY > 0) {
      this.canvasScale /= ratio
    }
    this.canvasScale = this.globalService.clamp(this.canvasScale, 0.5, 3)
    this.drawCanvas()
  }
  
  /**
   * Use this method to re-draw the graph
   */
  private drawCanvas(): void {
    this.canvas = document.querySelector('#mainCanvas')
    this.canvas.setAttribute('width', '700')
    this.canvas.setAttribute('height', '400')
    this.context = this.canvas.getContext('2d')
    ;(document.querySelector('#markerContainer') as HTMLElement).style.maxWidth = this.canvas.width + 'px'
    this.drawGrid()
    this.plotWeaponDamage()
  }
  
  /**
   * Use drawCanvas() to draw the whole graph
   * Reponsible for setting scale and offset the origin
   * Also draws the grid lines
   */
  private async drawGrid(): Promise<void> {
    const offsetX = 50
    const textPadding = 10
    const gridPadding = 20 // how much padding between the line closest to the edges in y axis
    const horizontalLineInterval = 50
    const verticalLineInterval = 25 * this.xScale
    
    await Promise.all(Object.values(this.promises))
    
    this.context.beginPath()
    this.context.strokeStyle = 'grey'
    this.context.lineWidth = 1

    let minDmg: number = 1000000 // TODO ugly hack
    let maxDmg: number = 0
    for(let config of this.weaponConfigs) {
      maxDmg = Math.max(maxDmg, this.getMaxDPS(config, this.selectedHitBox))
      minDmg = Math.min(minDmg, this.getMinDPS(config, this.selectedHitBox))
    }
    // calculates the average DPS which the graph centers around on the y axis
    const centerLine = (maxDmg + minDmg) / 2
    // console.log(maxDmg, minDmg, centerLine)
    
    // TODO adjust scale dynamically so everything can be seen
    // sets scale and position 
    const canvasRatio = this.canvas.width / this.canvas.height
    const offsetY = (-centerLine * this.canvasScale + this.canvas.height / 2) + offsetX / canvasRatio // to the center point, then up half the canvas height, down padding amount
    
    this.context.translate(offsetX, offsetY)
    this.context.scale(this.canvasScale, this.canvasScale)
    
    // horizontal lines
    this.context.strokeText('DPS', -offsetX, centerLine)
    
    // this.context.rotate
    const startY = this.globalService.roundToClosestInterval(minDmg - gridPadding, horizontalLineInterval, true)
    const endY = this.globalService.roundToClosestInterval(maxDmg + gridPadding, horizontalLineInterval) //centerLine + this.canvas.height / 2
    for(let yPos = startY; yPos <= endY; yPos += horizontalLineInterval) {
      const textWidth = this.context.measureText(yPos + '').width
      this.context.strokeText(yPos + '', - textWidth - textPadding, yPos)
      this.context.moveTo(0, yPos)
      this.context.lineTo((this.canvas.width * 1 / this.canvasScale) - offsetX, yPos)
    }
    
    this.context.strokeText('Range (meters)', this.canvas.width / 2 * this.canvasScale, startY - textPadding * 3)
    // vertical lines
    for(let xPos = 0; xPos < this.canvas.width * (1 / this.canvasScale); xPos += verticalLineInterval) {
      const textWidth = this.context.measureText(xPos + '').width
      this.context.strokeText(xPos / this.xScale + '', xPos - textWidth / 2, startY - textPadding)
      this.context.moveTo(xPos, startY)
      this.context.lineTo(xPos, endY)
    }

    this.context.stroke()
    this.context.closePath()
  }
  
  /**
   * Plots the injected configs on the canvas
   * @param hitBox
   */
  private async plotWeaponDamage(): Promise<void> {
    await Promise.all(Object.values(this.promises))

    this.context.lineWidth = 3
    this.context.globalAlpha = .7

    // iterates through configs
    for(let i = 0; i < this.weaponConfigs.length; i ++) {
      const config = this.weaponConfigs[i]
      if(config[this.extraAttributes.hidden] === true) {
        continue;
      }
      // TODO twas nice idea to wait for the promises one at a time, but problem when origin moves after the lines have been drawn
      // await this.promises[config.weaponName + 'Interval'] 
      // await this.promises[config.weaponName + 'Summary']
      
      const rangeMod = this.weaponStatSummaries[config.comparisonSlot].get(Stats.names.dmg_range).status + 1
      
      // const path = new Path2D()
      // this.paths.set(config, path)
      const colour = this.plotColours[i % this.plotColours.length] // add colour property to config so it can be used by the markers
      config[this.extraAttributes.colour] = colour
      this.context.beginPath()
      this.context.strokeStyle = colour

      this.context.moveTo(0, this.getDPS(config, this.damageIntervals[config.weaponName][0][this.selectedHitBox]))
      
      // iterates through dmg intervals
      for(let j = 0; j < this.damageIntervals[config.weaponName].length; j ++) {
        const interval = this.damageIntervals[config.weaponName][j]
        const from = this.getPoint(interval.distances, rangeMod)
        const nextInterval = this.damageIntervals[config.weaponName][j + 1] || { distances: this.canvas.width }
        const to = this.getPoint(nextInterval.distances, rangeMod)

        this.context.lineTo(from, this.getDPS(config, interval[this.selectedHitBox]))
        this.context.lineTo(to, this.getDPS(config, interval[this.selectedHitBox]))
      }
      this.context.stroke()
      this.context.closePath()
    }
  }

  togglePath(config: WeaponConfig): void {
    config[this.extraAttributes.hidden] = !config[this.extraAttributes.hidden]
    this.drawCanvas()
  }

  isHidden(config: WeaponConfig): boolean {
    return config[this.extraAttributes.hidden]
  }

  getPoint(distance: number, rangeMod: number): number {
    return distance * rangeMod * this.xScale
  }

  private getMaxDPS(config: WeaponConfig, hitBox: string): number {
    return this.getDPS(config, this.damageIntervals[config.weaponName][0][hitBox])
  }
  private getMinDPS(config: WeaponConfig, hitBox: string): number {
    return this.getDPS(config, this.damageIntervals[config.weaponName][this.damageIntervals[config.weaponName].length -1][hitBox])
  }
  private getDPS(config: WeaponConfig, damage: number) {
    const rateOfFire = this.damageIntervals[config.weaponName][0].fire_rate
    return Math.round(damage * rateOfFire / 60)
  }

}
