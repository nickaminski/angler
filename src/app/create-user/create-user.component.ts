import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, OnDestroy {

  constructor(private userService: UserService, private chatService: ChatService, private router: Router) { }

  username: string = '';

  userSub: Subscription;

  ngOnInit(): void {
    this.userSub = this.userService.onGetUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['chat'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy():void {
    if (this.userSub && !this.userSub.closed) {
        this.userSub.unsubscribe();
    }
  }

  checkInput(event) {
    if(event.key === 'Enter') {
      this.create();
    }
  }

  create() {
    if (this.isValidInput()) {
      this.userService.createNewUserProfile(this.username).subscribe(response => {
        if (response instanceof HttpErrorResponse)
        {
          if (response.status == 400)
          {
            console.log(response.error);
          }
        }
        else if (response) {
          this.router.navigate(['chat']);
        }
      });
    }
  }

  isValidInput() {
    return this.username && 
           this.username.length > 0 &&
           this.username.length <= 25;
  }

}
