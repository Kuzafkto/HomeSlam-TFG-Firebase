import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';
import { Player } from 'src/app/core/interfaces/player';
import { MediaService } from 'src/app/core/services/api/media.service';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';
import { CsvService } from 'src/app/core/services/api/csv.service';
import { take } from 'rxjs/operators';

/**
 * Component for managing the players page.
 */
@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {

  /**
   * Indicates if the page is currently loading.
   */
  public loading: boolean = false;

  /**
   * Creates an instance of PlayersPage.
   * 
   * @param router Service to handle navigation.
   * @param toast Controller to show toast notifications.
   * @param players Service to manage player data.
   * @param modal Controller to handle modal dialogs.
   * @param media Service to manage media uploads.
   * @param csvService Service to generate CSV files.
   */
  constructor(
    private router: Router,
    private toast: ToastController,
    public players: PlayersService,
    private modal: ModalController,
    private media: MediaService,
    private csvService: CsvService // Inject the CSV service
  ) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit(): void {
    this.loading = true;
    this.loading = false;
  }

  /**
   * Handles the deletion of a player.
   * 
   * @param player The player to be deleted.
   */
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

  /**
   * Handles the click event on a player card.
   * 
   * @param player The player that was clicked.
   */
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

  /**
   * Presents a form in a modal for creating or editing a player.
   * 
   * @param data The initial data to populate the form with.
   * @param onDismiss Callback to handle the result when the modal is dismissed.
   */
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
        // Compare the current image URL with the previous image URL
        if (data && data.imageUrl === result.data.imageUrl) {
          // If the URLs are the same, do not perform the conversion
          onDismiss(result);
        } else {
          // If the URL is different, convert the current image to Blob
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

  /**
   * Handles the creation of a new player.
   */
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

  /**
   * Downloads the players data as a CSV file.
   */
  downloadPlayersCSV() {
    this.players.players$.pipe(take(1)).subscribe((players) => {
      const formattedPlayers = players.map(player => {
        return {
          uuid: player.uuid,
          name: player.name,
          imageUrl: player.imageUrl,
          positions: player.positions.join(', ')
        };
      });

      const orderedKeys = ['uuid', 'name', 'imageUrl', 'positions'];

      const csvData = this.csvService.convertToCSV(formattedPlayers, orderedKeys);
      this.csvService.downloadFile(csvData, 'players.csv');
    });
  }
}
