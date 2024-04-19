import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setValue(name: string, val: string) {
    window.localStorage.setItem(name, val);
  }

  getValue(name: string): string {
    return window.localStorage.getItem(name) ?? '';
  }

  deleteValue(name: string) {
    window.localStorage.removeItem(name);
  }
}
