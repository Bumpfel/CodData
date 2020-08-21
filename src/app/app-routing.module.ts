import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeaponSelectComponent } from './components/pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './components/pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './components/pages/attachment-select/attachment-select.component';
import { ConfigurationComponent } from './components/pages/configuration/configuration.component';

const routes: Routes = [
  { path:'', pathMatch: 'full', redirectTo: 'configurations'},
  { path:'configurations', component: ConfigurationComponent },
  { path:'weapon-select', component: WeaponSelectComponent },
  { path:'weapon-select/:weaponType', component: WeaponSelectComponent },
  { path:'gunsmith/:weaponName', component: GunsmithComponent },
  { path:'gunsmith/:weaponName/:attachmentType', component: AttachmentSelectComponent },
  { path:'**', pathMatch: 'full', redirectTo: '' }, // TODO 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
