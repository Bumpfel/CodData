import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private sounds = {
    hover: 'button-hover',
    goBack: 'go-back',
    select: 'select',
  }

  constructor() { }
   
  hover() {
    this.playSound(this.sounds.hover);
  }
  
  goBack() {
    this.playSound(this.sounds.goBack);
  }
  
  select() {
    this.playSound(this.sounds.select);
  }

  private playSound = (sound: string) => {
    let audioElement = document.createElement('audio')
    audioElement.setAttribute('src', './assets/sounds/' + sound + '.mp3')
    // audioElement.setAttribute('muted', 'muted')
    audioElement.play();
  }
}
