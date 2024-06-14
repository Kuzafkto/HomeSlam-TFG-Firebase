import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

/**
 * Factory function to create a TranslateHttpLoader with a specific path for translation files.
 *
 * @param http Angular HttpClient
 * @returns TranslateHttpLoader instance
 */
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateService {
  /**
   * BehaviorSubject to track the current language.
   */
  private languageChangeSubject = new BehaviorSubject<string>('es');
  
  /**
   * Observable to expose the current language.
   */
  public languageChange$ = this.languageChangeSubject.asObservable();

  /**
   * Creates an instance of CustomTranslateService.
   * Initializes the translation service with available languages and the default language.
   * 
   * @param translate ngx-translate service
   */
  constructor(private translate: TranslateService) { 
    this.init();
  }

  /**
   * Initializes the translation service by adding languages, setting the default language, and using it.
   */
  private init() {
    this.translate.addLangs(['es', 'en']);
    const defaultLang = this.languageChangeSubject.value;
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }

  /**
   * Changes the current language and updates the BehaviorSubject.
   * 
   * @param lang Language code to switch to (e.g., 'en', 'es')
   */
  public onLanguageChange(lang: string) {
    this.translate.use(lang).subscribe(() => {
      this.languageChangeSubject.next(lang);
    });
  }

  /**
   * Retrieves the translation for a given key.
   * 
   * @param key The translation key
   * @returns Observable with the translated string
   */
  get(key: string): Observable<string> {
    return this.translate.get(key);
  }

  /**
   * Gets the current language code.
   * 
   * @returns The current language code as a string
   */
  getLang(): string {
    return this.languageChangeSubject.value;
  }
}
