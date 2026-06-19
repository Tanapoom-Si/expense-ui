import { isDevMode } from '@angular/core';

export const AppConfig = {
  apiBase: isDevMode()
    ? 'http://localhost:8080/api'                           
    : 'https://janet-dated-roller-dated.trycloudflare.com/api' 
};