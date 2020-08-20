export class WeaponConfig {
    private name: string
    private attachments: {
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

    constructor(name) {
      this.name = name
    }

    
}
