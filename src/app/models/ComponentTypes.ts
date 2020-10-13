export type ContextMenu = {
  title: string,
  alternatives: {}
  x: string
  y: string
}

export type Dialogue = {
  title?: string
  buttons?: string[]
  maxNameLength?: number 
  form?: {
    inputValue: string
    // buttons: string[]
  }
  // weaponConfig?: WeaponConfig
}

export type InfoPopup = {
  info: {[key:string]: string}
  x: number
  y: number
}