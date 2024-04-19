import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class EncodingService {

  constructor() { }

  decode(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  encode(str: string): string {
    return Buffer.from(str, 'base64').toString('ascii');
  }
}
