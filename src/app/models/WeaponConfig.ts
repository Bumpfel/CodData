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
    weaponProfile: string

    static maxNameLength = 20
    
    constructor(weaponName: string, slot?: number, type?: string) {
      this.comparisonSlot = slot
      this.weaponName = weaponName
      this.weaponProfile = weaponName
      this.weaponType = type
      this.attachments = {}
      this.armouryName  = undefined
    }
}

export class WeaponProfile {
  profileName: string
  attachmentSlot: string
  attachmentName: string
}
