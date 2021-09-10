import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncodingService {

  constructor() { }

  decode(str: string): string {
    return window.atob(str);
    // return Buffer.from(str, 'base64').toString('binary');
  }

  encode(str: string): string {
    return window.btoa(str);
    // return Buffer.from(str, 'binary').toString('base64');
  }
}
