import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ChatMessageComponent } from './chat/chat-message/chat-message.component';
import { SearchComponent } from './search/search.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { SigninComponent } from './signin/signin.component';

@NgModule({ declarations: [
        AppComponent,
        ChatComponent,
        PageNotFoundComponent,
        NavbarComponent,
        ChatMessageComponent,
        SearchComponent,
        CreateUserComponent,
        SigninComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule], providers: [provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())] })
export class AppModule { }
