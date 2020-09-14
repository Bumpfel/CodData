import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  activeContextMenu: Menu

  constructor() { }

  openMenu(title: string, options: {}, xPos: number, yPos: number) {
    this.activeContextMenu = { title: title, options: options, x: xPos + 'px', y: yPos + 'px' }
  }

  closeMenu() {
    this.activeContextMenu = undefined
  }
}

type Menu = {
  title: string,
  options: {}
  x: string
  y: string
}
