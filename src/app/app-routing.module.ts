import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './pages/gunsmith/gunsmith.component';

const routes: Routes = [
  { path:'', pathMatch: 'full', redirectTo: 'weapon-select'},
  { path:'weapon-select', component: WeaponSelectComponent},
  { path:'gunsmith/:weapon', component: GunsmithComponent},
  { path:'**', pathMatch: 'full', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
