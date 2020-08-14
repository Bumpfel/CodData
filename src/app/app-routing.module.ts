import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { MainComponent } from './pages/main/main.component';

const routes: Routes = [
  { path:'', component:MainComponent},
  { path:':type', component:MainComponent},
  { path:'**', pathMatch: 'full', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
