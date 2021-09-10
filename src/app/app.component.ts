import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from './services/chat.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private userSub: Subscription;
  private chatSub: Subscription;
  
  constructor (private chatService: ChatService, private userService: UserService) {
    this.userSub = this.userService.onGetUser$.subscribe(profile => {
      if (profile) {
        this.chatService.startConnection();
        this.chatSub = this.chatService.ConnectedObservable.subscribe(connected => {
          if (connected && profile) {
            this.chatService.setUpChannels(profile.userId);
            this.chatService.listenForMessages();
          }
        });
      }
    });
  }
  
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.userSub && !this.userSub.closed) {
      this.userSub.unsubscribe();
    }
    if (this.chatSub && !this.chatSub.closed) {
      this.chatSub.unsubscribe();
    }
  }
}
