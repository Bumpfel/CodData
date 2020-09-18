import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './pages/attachment-select/attachment-select.component';
import { ArmouryComponent } from './pages/armoury/armoury.component';

import { MessagesComponent } from './components/messages/messages.component';
import { WeaponCardComponent } from './components/weapon-card/weapon-card.component';
import { TopMenuComponent } from './components/navigation/top-menu/top-menu.component';
import { FooterComponent } from './components/navigation/footer/footer.component';
import { ContextmenuComponent } from './components/contextmenu/contextmenu.component';
import { NameformComponent } from './components/nameform/nameform.component';
import { DialogueComponent } from './components/dialogue/dialogue.component';

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
    FooterComponent,
    ArmouryComponent,
    ContextmenuComponent,
    NameformComponent,
    DialogueComponent
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
