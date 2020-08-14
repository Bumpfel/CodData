import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';

const routes: Routes = [
  { path:'', component: WeaponSelectComponent},
  { path:':type', component: WeaponSelectComponent},
  { path:'**', pathMatch: 'full', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
