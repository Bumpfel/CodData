import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './pages/attachment-select/attachment-select.component';

@NgModule({
  declarations: [
    AppComponent,
    WeaponSelectComponent,
    GunsmithComponent,
    AttachmentSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
