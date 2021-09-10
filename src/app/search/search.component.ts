import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserProfile, UserService } from '../services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  private _userProfile: UserProfile;
  private userSub: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userSub = this.userService.onGetUser$.subscribe(user => {
      this._userProfile = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSub && !this.userSub.closed) {
      this.userSub.unsubscribe();
    }
  }

}
