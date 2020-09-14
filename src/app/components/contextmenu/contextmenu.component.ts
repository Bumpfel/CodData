import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ContextMenuService } from 'src/app/services/contextmenu.service';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.scss']
})
export class ContextmenuComponent implements OnInit {

  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>()

  constructor(public contextMenuService: ContextMenuService) { }

  ngOnInit(): void {
  }

  selectOption(option: string): void {
    this.optionSelected.emit(option)
    this.contextMenuService.closeMenu()
  }

}
