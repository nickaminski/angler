import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncodingService {

  constructor() { }

  decode(str: string): string {
    return btoa(str);
  }

  encode(str: string): string {
    return Buffer.from(str, 'binary').toString('base64');
  }
}
