import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Si la aplicación está en modo producción, habilita el modo de producción
if (environment.production) {
  enableProdMode();
}

// Inicializa la aplicación Angular usando el módulo principal (AppModule)
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err)); // Captura y muestra cualquier error que ocurra durante la inicialización
