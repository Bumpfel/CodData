import { Component, OnInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(private globalService: GlobalService, public soundService: SoundService) { }

  ngOnInit(): void {
  }

  goBack() {
    this.globalService.goBack()
  }

}
