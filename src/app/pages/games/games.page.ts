import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Game } from 'src/app/core/interfaces/game';
import { MediaService } from 'src/app/core/services/api/media.service';
import { GameService } from 'src/app/core/services/api/game.service';
import { GameDetailComponent } from 'src/app/shared/components/game-detail/game-detail.component';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {

  public loading: boolean = false;
  public games$ = this.gameService.games$;

  constructor(
    private gameService: GameService,
    private toast: ToastController,
    private modal: ModalController,
    private media: MediaService
  ) {}

  ngOnInit() {
    this.loading = false;
    /*this.gameService.getAll().subscribe(() => {
      this.loading = false;
    });*/
  }

  onNewGame() {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.gameService.addGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Game ${info.data.name} created`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          }, error => {
            console.error('Error creating game:', error);
            const options: ToastOptions = {
              message: 'Error creating game',
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
    this.presentForm(null, onDismiss);
  }

  public async onCardClicked(game: Game) {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.gameService.updateGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Game ${info.data.name} modified`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          }, error => {
            console.error('Error modifying game:', error);
            const options: ToastOptions = {
              message: 'Error modifying game',
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
          this.gameService.deleteGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Game ${info.data.name} deleted`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          }, error => {
            console.error('Error deleting game:', error);
            const options: ToastOptions = {
              message: 'Error deleting game',
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
      //this.gameService.getAll().subscribe();
    }
    this.presentForm(game, onDismiss);
  }

  public onDeleteClicked(game: Game) {
    var _game: Game = { ...game };

    this.gameService.deleteGame(_game).subscribe(
      {
        next: async () => {
          const options: ToastOptions = {
            message: `Game deleted`,
            duration: 1000,
            position: 'bottom',
            color: 'danger',
            cssClass: 'fav-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
          await Haptics.notification();
          //this.gameService.getAll().subscribe();
        },
        error: err => {
          console.log(err);
          const options: ToastOptions = {
            message: 'Error deleting game',
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

  async presentForm(data: any | null, onDismiss: (result: any) => void) {
    const modal = await this.modal.create({
      component: GameDetailComponent,
      componentProps: {
        game: data
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
        onDismiss(result)
      }
    } else {
      onDismiss(result);
    }
  }
}
