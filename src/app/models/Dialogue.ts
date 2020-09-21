import { WeaponConfig } from './WeaponConfig';

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