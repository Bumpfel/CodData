import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { TopMenuComponent } from './navigation/top-menu/top-menu.component';
import { WeapontypeSelectComponent } from './navigation/weapontype-select/weapontype-select.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    TopMenuComponent,
    WeapontypeSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
