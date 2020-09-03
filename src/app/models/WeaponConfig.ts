export class WeaponConfig {
    // TODO keep exposed vars?
    weaponName: string
    armouryName: string
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

    constructor(slot: number, name: string) {
      this.comparisonSlot = slot
      this.weaponName = name
      this.attachments = {
          muzzle: undefined,
          barrel: undefined,
          laser: undefined,
          optic: undefined,
          stock: undefined,
          underbarrel: undefined,
          triggerAction: undefined,
          ammunition: undefined,
          rearGrip: undefined,
          perk: undefined,
      }
    }

    // getSelectedAttachment(attachmentType: string) : string {
    //   return this.attachments[attachmentType]
    // }


    
    
}
