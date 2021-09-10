import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { tap, retryWhen, delay, take } from 'rxjs/operators';
import { api_url } from 'src/environments/environment';
import { GuidService } from './guid.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiPath = `${api_url}/User`;

  public onGetUser$: Observable<UserProfile>;
  private userReplaySubject: ReplaySubject<UserProfile>;

  constructor(private httpClient: HttpClient, private guidService: GuidService, private localStorageService: LocalStorageService) {
    this.userReplaySubject = new ReplaySubject<UserProfile>();
    this.onGetUser$ = this.userReplaySubject.asObservable();
    if (this.localStorageService.getValue('user-id')) {
      this.httpClient.get<UserProfile>(`${this.apiPath}?id=${this.localStorageService.getValue('user-id')}`).pipe(
        retryWhen(errors => errors.pipe(
          tap(errors => console.log(`${errors}`)),
          delay(2000)
        ))
      ).subscribe(user => {
        if (user) {
          this.userReplaySubject.next(user);
        }
      });
    }
  }

  public createNewUserProfile(username: string): Observable<UserProfile> {
    console.log(this.localStorageService.getValue('user-id'));
    if (this.localStorageService.getValue('user-id')){
      return this.onGetUser$;
    } 
    else {
      var guid = this.guidService.newGuid();
      return this.httpClient.post<UserProfile>(this.apiPath, { UserId: guid, Username: username })
                            .pipe(
                              tap(x => {
                                this.localStorageService.setValue('user-id', x.userId);
                                this.userReplaySubject.next(x);
                              })
                            );
    }
  }

}

export interface UserProfile {
  userId: string;
  username: string;
  channels: Set<string>;
  createdDate: Date;
  updatedDate: Date;
  dateLastLogedIn: Date;
}