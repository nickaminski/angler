import { Injectable } from '@angular/core';
import { EncodingService } from './encoding.service';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor(private encodingService: EncodingService) { }

  setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;

    date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000))

    document.cookie = `${name}=${this.encodingService.encode(value)}; expires=${date.toUTCString()}; path=/; SameSite=Strict;`;
  }

  getCookie(name: string) {
    const value = `; ` + document.cookie;
    const parts = value.split(`; ${name}=`);

    if (parts.length == 2) {
      return this.encodingService.decode(parts.pop().split(";").shift());
    }
  }

  deleteCookie(name: string) {
    const date = new Date();

    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=; expires=${date.toUTCString()}; path=/; SameSite=Strict;`;
  }
}
