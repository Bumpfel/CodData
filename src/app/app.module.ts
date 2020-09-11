import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeaponSelectComponent } from './components/pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './components/pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './components/pages/attachment-select/attachment-select.component';
import { ConfigurationComponent } from './components/pages/configuration/configuration.component';
import { MessagesComponent } from './components/messages/messages.component';
import { WeaponCardComponent } from './components/weapon-card/weapon-card.component';
import { TopMenuComponent } from './components/navigation/top-menu/top-menu.component';
import { FooterComponent } from './components/navigation/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    WeaponSelectComponent,
    GunsmithComponent,
    AttachmentSelectComponent,
    ConfigurationComponent,
    MessagesComponent,
    WeaponCardComponent,
    TopMenuComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
