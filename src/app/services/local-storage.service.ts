import { Injectable } from '@angular/core';
import { EncodingService } from './encoding.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private encodingService: EncodingService) { }

  setValue(name: string, val: string) {
    window.localStorage.setItem(name, this.encodingService.encode(val))
  }

  getValue(name: string): string {
    const val = window.localStorage.getItem(name);

    if (val) {
      return this.encodingService.decode(val);
    }
    
    return '';
  }

  deleteValue(name: string) {
    window.localStorage.removeItem(name);
  }
}
