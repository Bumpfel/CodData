export class Effect {
  value: string
  status: number

  constructor(value: string, status: number) {
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