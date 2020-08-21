import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messages: object[] = []
  timeout: number = 3000

  constructor() { }

  addMessage(msg1: string, msg2: string): void {
    this.messages.push({msg1: msg1, msg2: msg2})
    setTimeout(() => this.messages.shift(), this.timeout)
  }
}
