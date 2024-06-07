import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';
import { Player } from 'src/app/core/interfaces/player';
import { MediaService } from 'src/app/core/services/api/media.service';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {

  public loading: boolean = false;

  constructor(
    private router: Router,
    private toast: ToastController,
    public players: PlayersService,
    private modal: ModalController,
    private media: MediaService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.loading = false;
  }

  public onDeleteClicked(player: Player) {
    var _player: Player = { ...player };

    this.players.deletePlayer(_player).subscribe(
      {
        next: async () => {
          const options: ToastOptions = {
            message: `Player deleted`,
            duration: 1000,
            position: 'bottom',
            color: 'danger',
            cssClass: 'fav-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
          await Haptics.notification();
        },
        error: err => {
          console.log(err);
          const options: ToastOptions = {
            message: 'Error deleting player',
            duration: 1000,
            position: 'bottom',
            color: 'danger',
            cssClass: 'card-ion-toast'
          };
          this.toast.create(options).then(toast => toast.present());
        }
      }
    );
  }

  public async onCardClicked(player: Player) {
    var onDismiss = (info: any) => {
      switch(info.role){
        case 'ok': {
          this.players.updatePlayer(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Player ${info.data.name} modified`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          }, error => {
            console.error('Error modifying player:', error);
            const options: ToastOptions = {
              message: 'Error modifying player',
              duration: 1000,
              position: 'bottom',
              color: 'danger',
              cssClass: 'card-ion-toast'
            };
            this.toast.create(options).then(toast => toast.present());
          });
        }
        break;
        case 'delete': {
          this.players.deletePlayer(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Player ${info.data.name} deleted`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          }, error => {
            console.error('Error deleting player:', error);
            const options: ToastOptions = {
              message: 'Error deleting player',
              duration: 1000,
              position: 'bottom',
              color: 'danger',
              cssClass: 'card-ion-toast'
            };
            this.toast.create(options).then(toast => toast.present());
          });
        }
        break;
        default: {
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(player, onDismiss);
  }

  async presentForm(data: any | null, onDismiss: (result: any) => void) {
    const modal = await this.modal.create({
      component: PlayerDetailComponent,
      componentProps: {
        player: data
      },
      cssClass: "fullModal"
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    
    if (result && result.data) {
      if (result.data.imageUrl) {
        // Comparar la URL de la imagen actual con la URL de la imagen anterior
        if (data && data.imageUrl === result.data.imageUrl) {
          // Si las URLs son iguales, no realizar la conversión
          onDismiss(result);
        } else {
          // Si la URL es diferente, convertir la imagen actual a Blob
          dataURLtoBlob(result.data.imageUrl, (blob: Blob) => {
            this.media.upload(blob).subscribe((media: number[]) => {
              result.data.imageUrl = media[0];
              result.data.imageUrl = result.data.imageUrl.url_medium;
              onDismiss(result);
            }, error => {
              console.error('Error uploading image:', error);
              const options: ToastOptions = {
                message: 'Error uploading image',
                duration: 1000,
                position: 'bottom',
                color: 'danger',
                cssClass: 'card-ion-toast'
              };
              this.toast.create(options).then(toast => toast.present());
            });
          });
        }
      } else {
        result.data.imageUrl = "";
        onDismiss(result);
      }
    } else {
      onDismiss(result);
    }
  }

  onNewPlayer(){
    var onDismiss = (info: any) => {
      switch(info.role){
        case 'ok': {
          this.players.addPlayer(info.data).subscribe(async player => {
            const options: ToastOptions = {
              message: `Player ${info.data.name} created`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          }, error => {
            console.error('Error creating player:', error);
            const options: ToastOptions = {
              message: 'Error creating player',
              duration: 1000,
              position: 'bottom',
              color: 'danger',
              cssClass: 'card-ion-toast'
            };
            this.toast.create(options).then(toast => toast.present());
          });
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(null, onDismiss);
  }
}
