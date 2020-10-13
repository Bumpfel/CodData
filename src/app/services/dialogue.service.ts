import { Injectable } from '@angular/core';
import { DialogueComponent } from '../components/dialogue/dialogue.component';
import { Dialogue } from '../models/ComponentTypes';

@Injectable({
  providedIn: 'root'
})
export class DialogueService {

  // openDialogues: Array<DialogueComponent>
  openDialogues: Array<Dialogue>

  constructor() { }

  openDialogue(dialogue: Dialogue): void {
    this.openDialogues.push(dialogue)
  }
  
  closeDialogue(): void {
    this.openDialogues.pop()

  }
}
