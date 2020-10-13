import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeaponSelectComponent } from './pages/weapon-select/weapon-select.component';
import { GunsmithComponent } from './pages/gunsmith/gunsmith.component';
import { AttachmentSelectComponent } from './pages/attachment-select/attachment-select.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { ArmouryComponent } from './pages/armoury/armoury.component';

const routes: Routes = [
  { path:'', pathMatch: 'full', redirectTo: 'configurations'},
  { path:'configurations', component: ConfigurationComponent },
  { path:':slot/weapon-select', component: WeaponSelectComponent },
  { path:':slot/weapon-select/:weaponType', component: WeaponSelectComponent },
  { path:':slot/armoury/:weaponName', component: ArmouryComponent },
  { path:':slot/gunsmith', component: GunsmithComponent },
  { path:':slot/gunsmith/:attachmentSlot', component: AttachmentSelectComponent },
  { path:'**', pathMatch: 'full', redirectTo: '' }, // TODO 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
