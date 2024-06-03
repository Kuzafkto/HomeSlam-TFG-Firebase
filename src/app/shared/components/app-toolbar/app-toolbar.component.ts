import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/api/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss'],
})
export class AppToolbarComponent  implements OnInit {

  @Input() languages:string[] = ["es","en"];
  @Input() languageSelected:string = "es";
  @Output() onSignout = new EventEmitter();
  @Output() onProfile = new EventEmitter();
  @Output() onLanguage = new EventEmitter();

  @Input() set username(value: string | undefined) {
    this._username.next(value || "Kuza Fkto");
  }

  @Input() set nickname(value: string | undefined) {
    this._nickname.next(value || "Kuza");
  }
  private _username = new BehaviorSubject<string>("Kuza Fkto");
  username$ = this._username.asObservable();

  private _nickname = new BehaviorSubject<string>("Kuza");
  nickname$ = this._nickname.asObservable();
  hidden=false;
  constructor(
    private router:Router,
    private auth: AuthService,
    private lang:CustomTranslateService
  ) { /*
    this.strapi.me().subscribe(user => {
      this._username.next(user.name);
      this._nickname.next(user.username);
    });*/
  }
  ngOnInit(
    
  ) {/*
     this.strapi.me().subscribe((user) => {
      this._username.next(user.name);
      this._nickname.next(user.username);
    });*/
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
  
        if (currentUrl === '/login'||currentUrl === '/register') {
          this.hidden=true;
          
        }else{
          this.hidden=false;
          this.auth.me().subscribe((user) => {
            this._username.next(user.name);
            this._nickname.next(user.username);
          });
        }
      }
     
    });
  }


  
  public goToPlayers(){
    this.router.navigate(['/players']);
  }
  public goToAbout(){
    this.router.navigate(['/about']);
  }
  public goToTeams(){
    this.router.navigate(['/teams']);
  }
  public goToGames(){
    this.router.navigate(['/games']);
  }
  onLogout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  
  setLanguage(lang:string){
    this.languageSelected = lang;
    this.lang.onLanguageChange(lang);
  } 
}