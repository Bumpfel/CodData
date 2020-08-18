import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './pages/attachment-select/attachment-select.component';

const routes: Routes = [
  { path:'', pathMatch: 'full', redirectTo: 'weapon-select'},
  { path:'weapon-select', component: WeaponSelectComponent},
  // { path:'weapon-select/:weaponType', component: WeaponSelectComponent},
  { path:'gunsmith/:weaponName', component: GunsmithComponent},
  { path:'gunsmith/:weaponName/:attachmentType', component: AttachmentSelectComponent},
  { path:'**', pathMatch: 'full', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
