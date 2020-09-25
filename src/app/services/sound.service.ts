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
      this.loadSound(this.sounds[sound])
    }
  }

  private loadSound(file: string): HTMLAudioElement {
    const audioElement = document.createElement('audio')
    audioElement.setAttribute('src', './assets/sounds/' + file + '.mp3')
    // audioElement.setAttribute('volume', '0.1')
    return audioElement
  }

  private playSound(file: string) {
    const sound = this.loadSound(file)
    sound.setAttribute('autoplay', '')
    // sound.play()
  }
}
