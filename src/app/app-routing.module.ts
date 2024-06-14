import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { OwnerGuard } from './core/guards/owner.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]  // Protege la ruta 'home' con AuthGuard
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'  // Redirige la ruta vacía a 'splash'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'players',
    loadChildren: () => import('./pages/players/players.module').then(m => m.PlayersPageModule),
    canActivate: [AuthGuard]  // Protege la ruta 'players' con AuthGuard
  },
  {
    path: 'teams',
    loadChildren: () => import('./pages/teams/teams.module').then(m => m.TeamsPageModule),
    canActivate: [AuthGuard]  // Protege la ruta 'teams' con AuthGuard
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule)
  },
  {
    path: 'games',
    loadChildren: () => import('./pages/games/games.module').then(m => m.GamesPageModule),
    canActivate: [AuthGuard]  // Protege la ruta 'games' con AuthGuard
  },
  {
    path: 'users-admin',
    loadChildren: () => import('./pages/users-admin/users-admin.module').then(m => m.UsersAdminPageModule),
    canActivate: [AuthGuard, OwnerGuard]  // Protege la ruta 'users-admin' con AuthGuard y OwnerGuard
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule),
    canActivate: [AuthGuard] 
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })  // Configura el enrutador con las rutas y la estrategia de precarga
  ],
  exports: [RouterModule]  // Exporta RouterModule para que esté disponible en el resto de la aplicación
})
export class AppRoutingModule { }
