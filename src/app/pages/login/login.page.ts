import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserCredentials } from 'src/app/core/interfaces/user-credentials';
import { UserRegisterInfo } from 'src/app/core/interfaces/user-register-info';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { LoginFormComponent } from 'src/app/shared/components/login-form/login-form.component';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  errorMessage: string | null = null;

  async activateVibrationWithOptions() {
    try {
      const options = {
        duration: 300, // Duración de la vibración en milisegundos
        intensity: 0.5 // Intensidad de la vibración, un valor entre 0.1 y 1.0
      }; //por ahora no usamos las options para vibrate
  
      //await Haptics.vibrate();
      await Haptics.notification()
      console.log('Vibración activada con éxito con opciones personalizadas');
    } catch (error) {
      console.error('Error al activar la vibración:', error);
    }
  }
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || null;
    });
  }

  onLogin(credentials: UserCredentials) {
    this.auth.login(credentials).subscribe({
      next: data => {
        this.router.navigate(['/home'])
        console.log(data);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  goToRegisterPage() {
    this.router.navigate(['/register']);
  }

  
  
  
  /*intento fallido de hacer que el register con su form estén dentro de Login
  
  onRegister(registerInfo: UserRegisterInfo) {

    var onDismiss = (info: any) => {
      console.log(info)
      if (info.form.value) {
        this.auth.register(registerInfo).subscribe({
          next: data => {
            console.log("Enviado")
          },  
          error: err => {
            console.log(err);
          }
        })
      }
    }
    console.log("Register formm");
    this.presentForm(onDismiss);

  }


  async presentForm(onDismiss: (result: any) => void) {

    const modal = await this.modal.create({
      component: LoginFormComponent,
      cssClass: "modal-full-right-side"
    }
    );
    modal.present();
    modal.onDidDismiss().then(result => {
      if (result && result.data) {
        onDismiss(result);
      }
    });

  }
*/

}
