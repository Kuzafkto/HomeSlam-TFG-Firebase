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
    this.presentForm(null, (info: any) => {
      switch(info.role) {
        case 'ok': {
          this.gameService.addGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: "Game created",
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          });
        }
        break;
        default: {
          console.error("No debería entrar");
        }
      }
    });
  }

  async onCardClicked(game: Game) {
    this.presentForm(game, (info: any) => {
      switch(info.role) {
        case 'ok': {
          this.gameService.updateGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: "Game modified",
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          });
        }
        break;
        case 'delete': {
          this.gameService.deleteGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: "Game deleted",
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
            //this.gameService.getAll().subscribe();
          });
        }
        break;
        default: {
          console.error("No debería entrar");
        }
      }
      //this.gameService.getAll().subscribe();
    });
  }

  public onDeleteClicked(game: Game) {
    this.gameService.deleteGame(game).subscribe(
      async () => {
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
      error => {
        console.log(error);
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
        // Si hay una nueva imagen, cargarla primero
        dataURLtoBlob(result.data.imageUrl, (blob: Blob) => {
          this.media.upload(blob).subscribe((media: number[]) => {
            result.data.imageUrl = media[0];
            result.data.imageUrl = result.data.imageUrl.url_medium;
            onDismiss(result);
          });
        });
      } else {
        result.data.imageUrl = data?.imageUrl || "";
        this.gameService.updateGame(result.data).subscribe(() => {
          onDismiss(result);
        });
      }
    } else {
      onDismiss(result);
    }
  }
}
