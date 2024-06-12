import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Game } from 'src/app/core/interfaces/game';
import { MediaService } from 'src/app/core/services/api/media.service';
import { GameService } from 'src/app/core/services/api/game.service';
import { VoteService } from 'src/app/core/services/api/vote.service';
import { TeamService } from 'src/app/core/services/api/team.service';
import { GameDetailComponent } from 'src/app/shared/components/game-detail/game-detail.component';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CsvService } from 'src/app/core/services/api/csv.service';

/**
 * Component for managing the games page.
 */
@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {

  /**
   * Indicates if the page is currently loading.
   */
  public loading: boolean = false;

  /**
   * Observable for the list of games.
   */
  public games$ = this.gameService.games$;

  /**
   * Creates an instance of GamesPage.
   * 
   * @param gameService Service to manage game data.
   * @param voteService Service to manage vote data.
   * @param teamService Service to manage team data.
   * @param toast Controller to show toast notifications.
   * @param modal Controller to handle modal dialogs.
   * @param media Service to manage media uploads.
   * @param csvService Service to generate CSV files.
   */
  constructor(
    private gameService: GameService,
    private voteService: VoteService,
    private teamService: TeamService,
    private toast: ToastController,
    private modal: ModalController,
    private media: MediaService,
    private csvService: CsvService
  ) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
    this.loading = false;
  }

  /**
   * Handles the creation of a new game.
   */
  onNewGame() {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.gameService.addGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Game created`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
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

  /**
   * Handles the click event on a game card.
   * 
   * @param game The game that was clicked.
   */
  public async onCardClicked(game: Game) {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.gameService.updateGame(info.data).subscribe(async () => {
            const options: ToastOptions = {
              message: `Game modified`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
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
              message: `Game deleted`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
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
    }
    this.presentForm(game, onDismiss);
  }

  /**
   * Handles the deletion of a game.
   * 
   * @param game The game to be deleted.
   */
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

  /**
   * Presents a form in a modal for creating or editing a game.
   * 
   * @param data The initial data to populate the form with.
   * @param onDismiss Callback to handle the result when the modal is dismissed.
   */
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
        if (data && data.imageUrl === result.data.imageUrl) {
          onDismiss(result);
        } else {
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

  /**
   * Downloads the votes data as a CSV file.
   */
  downloadVotesCSV() {
    combineLatest([
      this.voteService.votes$,
      this.teamService.teams$,
      this.gameService.games$
    ]).pipe(
      map(([votes, teams, games]) => {
        const votesWithDetails = votes.map(vote => {
          const team = teams.find(t => t.uuid === vote.reference);
          const game = games.find(g => g.uuid === vote.game);
          return {
            ...vote,
            votedTeam: team ? team.name : 'Unknown',
            gameDate: game ? new Date(game.gameDate).toLocaleDateString() : 'Unknown'
          };
        });

        const allKeys = new Set<string>();
        votesWithDetails.forEach((vote: {}) => {
          Object.keys(vote).forEach(key => allKeys.add(key));
        });

        return { votesWithDetails, keys: Array.from(allKeys) };
      })
    ).subscribe(({ votesWithDetails, keys }) => {
      const csvData = this.csvService.convertToCSV(votesWithDetails, keys);
      this.csvService.downloadFile(csvData, 'votes.csv');
    });
  }

  /**
   * Downloads the games data as a CSV file.
   */
  downloadGamesCSV() {
    this.games$.pipe(take(1)).subscribe((games) => {
      const formattedGames = games.map(game => {
        const gameData: any = { 
          uuid: game.uuid,
          gameDate: game.gameDate,
          local: game.local,
          visitor: game.visitor,
          localRuns: game.localRuns,
          visitorRuns: game.visitorRuns
        };

        // Adding local team details
        if (gameData.local) {
          gameData['local uuid'] = gameData.local.uuid;
          gameData['local name'] = gameData.local.name;
          gameData['local imageUrl'] = gameData.local.imageUrl;
          gameData['local story'] = gameData.local.story;
          delete gameData.local;
        }

        // Adding visitor team details
        if (gameData.visitor) {
          gameData['visitor uuid'] = gameData.visitor.uuid;
          gameData['visitor name'] = gameData.visitor.name;
          gameData['visitor imageUrl'] = gameData.visitor.imageUrl;
          gameData['visitor story'] = gameData.visitor.story;
          delete gameData.visitor;
        }

        return gameData;
      });

      const allKeys = new Set<string>();
      formattedGames.forEach(game => {
        Object.keys(game).forEach(key => allKeys.add(key));
      });

      const orderedKeys = [
        'uuid',
        'gameDate',
        'local uuid',
        'local name',
        'local imageUrl',
        'local story',
        'visitor uuid',
        'visitor name',
        'visitor imageUrl',
        'visitor story',
        'localRuns',
        'visitorRuns'
      ];

      const csvData = this.csvService.convertToCSV(formattedGames, orderedKeys);
      this.csvService.downloadFile(csvData, 'games.csv');
    });
  }
}
