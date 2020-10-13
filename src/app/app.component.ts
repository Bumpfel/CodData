import { Component, OnInit } from '@angular/core';
import { SoundService } from './services/sound.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CodData';

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    this.soundService.preloadSounds()    
  }
}
