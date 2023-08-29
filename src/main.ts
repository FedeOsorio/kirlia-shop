import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
interface Window {
  checkoutButton: any;
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
