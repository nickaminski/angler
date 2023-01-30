import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, retry, catchError } from 'rxjs/operators';
import { api_url } from 'src/environments/environment';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiPath = `${api_url}/User`;

  public onGetUser$: Observable<UserProfile>;
  private userBehaviorSubject: BehaviorSubject<UserProfile>;

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) {
    this.userBehaviorSubject = new BehaviorSubject<UserProfile>(null);
    this.onGetUser$ = this.userBehaviorSubject.asObservable();
    if (this.localStorageService.getValue('user-id')) {
      this.httpClient.get<UserProfile>(`${this.apiPath}?id=${this.localStorageService.getValue('user-id')}`).pipe(
        retry({count: 5, delay: 2000}),
        catchError(err => {
          this.localStorageService.deleteValue('user-id');
          return of(null);
        })
      ).subscribe(user => {
        if (user) {
          this.userBehaviorSubject.next(user);
        }
      });
    }
  }

  public signin(username: string): Observable<UserProfile> {
    if (this.localStorageService.getValue('user-id')){
      return this.onGetUser$;
    } 
    else {
      return this.httpClient.get<UserProfile>(`${this.apiPath}?username=${username}`)
                            .pipe(
                              tap(x => {
                                this.localStorageService.setValue('user-id', x.userId);
                                this.userBehaviorSubject.next(x);
                              })
                            );
    }
  }

  public createNewUserProfile(username: string): Observable<UserProfile> {
    if (this.localStorageService.getValue('user-id')){
      return this.onGetUser$;
    } 
    else {
      return this.httpClient.post<UserProfile>(this.apiPath, { Username: username })
                            .pipe(
                              tap(x => {
                                this.localStorageService.setValue('user-id', x.userId);
                                this.userBehaviorSubject.next(x);
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