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

  preloadSounds(): void {
    for(let sound in this.sounds) {
      this.playSound(this.sounds[sound], true)
    }
  }

  private playSound(file: string, mute?: boolean) {
    const audioElement = document.createElement('audio')
    audioElement.setAttribute('src', './assets/sounds/' + file + '.mp3')
    
    if(mute) {
      audioElement.muted = true
    }
    audioElement.setAttribute('autoplay', '')
    // sound.play()
  }
}
