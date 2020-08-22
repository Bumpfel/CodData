export class WeaponConfig {
    // TODO keep exposed vars?
    weaponName: string
    armoryName: string
    comparisonSlot: number
    weaponType: string
    attachments: {
      muzzle: string,
      barrel: string,
      laser: string,
      optic: string,
      stock: string,
      underbarrel: string,
      triggerAction: string,
      ammunition: string,
      rearGrip: string,
      perk: string,
    }

    constructor(slot: number) {
      this.comparisonSlot = slot
    }

    // getSelectedAttachment(attachmentType: string) : string {
    //   return this.attachments[attachmentType]
    // }

    
}
