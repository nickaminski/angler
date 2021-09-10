import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatPacket } from '../services/chat.service';
import { UserProfile, UserService } from '../services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chatHistory') private scrollContainer: ElementRef;

  currentMessage: string;
  lockScrollbar: boolean;
  initialized: boolean;
  userProfile: UserProfile;

  currentChatView: string;

  setupSub: Subscription;
  messageSub: Subscription;
  userSub: Subscription;

  constructor(public chatService: ChatService, private userService: UserService, private router: Router) {
    this.currentChatView = 'public';
    this.lockScrollbar = true;
    this.initialized = this.chatService.isInitialized();

    this.setupSub = this.chatService.setUpChannelsObservable.subscribe(inits => {
      this.initialized = inits;
    });

    this.messageSub = this.chatService.MessageObservable.subscribe(message => {
      if (this.lockScrollbar) {
        try{
          setTimeout(() => {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
          }, 0);
        } catch(err) {}
      }
    });
  }

  ngOnInit(): void {
    this.userSub = this.userService.onGetUser$.subscribe(user => {
      if (user) {
        this.userProfile = user;
      } else {
        this.router.navigate(['signin']);
      }
    });
  }

  sendMessage(){
    if (!this.currentMessage) return;
    if (this.currentMessage.trim().length === 0) return;

    var packet = {
      message: this.currentMessage,
      userId: this.userProfile.userId
    } as ChatPacket;
    this.chatService.sendMessage(packet);
    this.currentMessage = '';
  }

  checkInput(event) {
    if(event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onScroll(event) {
    var currentScroll = this.scrollContainer.nativeElement.scrollTop;
    var maxScroll = this.scrollContainer.nativeElement.scrollHeight - this.scrollContainer.nativeElement.clientHeight;
    this.lockScrollbar = (currentScroll == maxScroll);
  }

  ngOnDestroy(): void {
    if (this.setupSub && !this.setupSub.closed) {
      this.setupSub.unsubscribe();
    }
    if (this.messageSub && !this.messageSub.closed) {
      this.messageSub.unsubscribe();
    }
    if (this.userSub && !this.userSub.closed) {
      this.userSub.unsubscribe();
    }
  }

}
