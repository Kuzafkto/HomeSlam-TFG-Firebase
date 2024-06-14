import { Component } from '@angular/core';
import { AuthService } from './core/services/api/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTranslateService } from './core/services/custom-translate.service';
import { delay, of, tap } from 'rxjs';
import { IonMenu } from '@ionic/angular';

/**
 * Componente principal de la aplicación.
 * Gestiona la lógica de enrutamiento y la traducción del idioma.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  lang: string = "es";  // Idioma por defecto

  /**
   * Constructor de AppComponent
   * 
   * @param translate Servicio de traducción personalizado.
   * @param auth Servicio de autenticación.
   * @param router Servicio de enrutamiento de Angular.
   * @param route Ruta activada de Angular.
   */
  constructor(
    public translate: CustomTranslateService,
    public auth: AuthService,
    private router: Router,
    public route: ActivatedRoute
  ) {
    this.translate.onLanguageChange(this.lang);  // Establece el idioma por defecto en el servicio de traducción
  }

  /**
   * Cambia el idioma de la aplicación.
   * 
   * @param lang El nuevo idioma a establecer.
   * @returns false para prevenir la acción por defecto del evento.
   */
  onLang(lang: string) {
    this.lang = lang;
    this.translate.onLanguageChange(this.lang);
    return false;
  }

  /**
   * Cierra el menú lateral después de un retraso.
   * 
   * @param menu La instancia de IonMenu a cerrar.
   */
  close(menu: IonMenu) {
    of('').pipe(
      delay(500),  // Espera 500 ms antes de ejecutar el siguiente paso
      tap(_ => menu.close())  // Cierra el menú
    ).subscribe();
  }

  /**
   * Cierra la sesión del usuario y navega a la página de inicio de sesión.
   * 
   * @param menu La instancia de IonMenu a cerrar después de cerrar sesión.
   */
  onSignOut(menu: IonMenu) {
    this.auth.logout().subscribe(async _ => {
      await this.router.navigate(['/login']);
      menu.close();
    });
  }

  /**
   * Verifica si la ruta actual incluye un determinado camino.
   * 
   * @param path El camino a verificar en la URL actual.
   * @returns true si la URL actual incluye el camino, false en caso contrario.
   */
  routeInclude(path: string): boolean {
    return this.router.url.includes(path);
  }
}
