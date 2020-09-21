import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private sounds = {
    hover: 'button-hover',
    goBack: 'go-back',
    select: 'select',
    highPitched: 'high-pitched',
    selectCategory: 'select-category',
  }

  constructor() { }
   
  hover(): void {
    this.playSound(this.sounds.hover);
  }
  
  goBack(): void {
    this.playSound(this.sounds.goBack);
  }
  
  select(): void {
    this.playSound(this.sounds.select);
  }
  
  highPitched(): void {   
    this.playSound(this.sounds.highPitched);
  }
  
  selectCategory(): void {
    this.playSound(this.sounds.selectCategory);
  }

  private playSound = (sound: string) => {
    const audioElement = document.createElement('audio')
    audioElement.setAttribute('autoplay', '')
    // document.body.appendChild(audioElement)
    audioElement.setAttribute('src', './assets/sounds/' + sound + '.mp3')
    audioElement.setAttribute('volume', '0.1')
    audioElement.play();
    
    // setTimeout(() => { document.body.removeChild(audioElement) }, 500)
  }
}
