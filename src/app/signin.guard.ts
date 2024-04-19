import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from './services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SigninGuard {

  constructor(private router: Router, private localStorageSerive: LocalStorageService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!this.localStorageSerive.getValue('user-id')) {
        this.router.navigate(['signin']);
        return false;
      }

      return true;
  }
  
}
