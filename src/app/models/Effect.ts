export class Effect {
  // key: string
  value: string
  status: number

  constructor(value: string, status: number) { // key: string, 
    // this.key = key
    this.value = value
    this.status = status
  }

  isPositive() {
    return this.status > 0
  }

  isNegative() {
    return this.status < 0
  }
}