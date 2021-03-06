import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SigninGuard } from './signin.guard';


const routes: Routes = [
  { path: 'chat', component: ChatComponent, canActivate: [SigninGuard] },
  { path: 'signin', component: CreateUserComponent },
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
