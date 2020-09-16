import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContextMenu } from 'src/app/models/ContextMenu';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.scss']
})
export class ContextmenuComponent implements OnInit {

  @Input() options: ContextMenu
  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>()

  private contentLoaded: boolean = false
  isActive: boolean = false

  private closeMenuCB: (e: KeyboardEvent) => void

  /**
   * Menu is opened by setting @Input options. This component reacts to the changes
   */
  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.closeMenuCB = (e: KeyboardEvent) => {
      if(e.key === 'Escape') {
        this.closeMenu(e)
      }
    }
  }

  ngAfterViewInit(): void {
    this.contentLoaded = true
  }

  ngOnChanges(): void {
    if(this.contentLoaded === true && this.options) {
      this.isActive = true
      this.globalService.disableGoBackOnEscape()
      document.addEventListener('keydown', this.closeMenuCB, { once: true })
    }
  }
  
  selectAlternative(alternative: string): void {
    this.isActive = false
    this.optionSelected.emit(alternative)
    document.removeEventListener('keydown', this.closeMenuCB)
  }
  
  closeMenu(event: Event): void {
    event.preventDefault()
    this.isActive = false
    this.globalService.enableGoBackOnEscape()
    document.removeEventListener('keydown', this.closeMenuCB)
  }
}
