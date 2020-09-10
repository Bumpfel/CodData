export class WeaponConfig {
    weaponName: string
    armouryName: string
    comparisonSlot: number
    weaponType: string
    attachments: {
      muzzle?: string,
      barrel?: string,
      laser?: string,
      optic?: string,
      stock?: string,
      underbarrel?: string,
      triggerAction?: string,
      ammunition?: string,
      rearGrip?: string,
      perk?: string,
    }

    constructor(name: string, slot?: number, type?: string) {
      this.comparisonSlot = slot
      this.weaponName = name
      this.weaponType = type
      this.attachments = {}
      this.armouryName  = undefined
    }
}
