import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';
import { Team } from 'src/app/core/interfaces/team';
import { MediaService } from 'src/app/core/services/api/media.service';
import { TeamService } from 'src/app/core/services/api/team.service';
import { TeamDetailComponent } from 'src/app/shared/components/team-detail/team-detail.component';
import { take } from 'rxjs/operators';
import { CsvService } from 'src/app/core/services/api/csv.service';

/**
 * Component for managing the teams page.
 */
@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {

  /**
   * Indicates if the page is currently loading.
   */
  public loading: boolean = false;

  /**
   * Creates an instance of TeamsPage.
   * 
   * @param teams Service to manage team data.
   * @param toast Controller to show toast notifications.
   * @param modal Controller to handle modal dialogs.
   * @param media Service to manage media uploads.
   * @param csvService Service to generate CSV files.
   */
  constructor(
    public teams: TeamService,
    private toast: ToastController,
    private modal: ModalController,
    private media: MediaService,
    private csvService: CsvService
  ) { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
    this.loading = false;
  }

  /**
   * Handles the creation of a new team.
   */
  onNewteam() {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.teams.addTeam(info.data).subscribe(async (player) => {
            const options: ToastOptions = {
              message: `Team ${info.data.name} created`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast',
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          });
        }
      }
    };
    this.presentForm(null, onDismiss);
  }

  /**
   * Handles the click event on a team card.
   * 
   * @param team The team that was clicked.
   */
  public async onCardClicked(team: Team) {
    var onDismiss = (info: any) => {
      switch (info.role) {
        case 'ok': {
          this.teams.updateTeam(info.data).subscribe(async (team) => {
            const options: ToastOptions = {
              message: `Team ${info.data.name} modified`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast',
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          });
        }
        break;
        case 'delete': {
          this.teams.deleteTeam(info.data).subscribe(async (team) => {
            const options: ToastOptions = {
              message: `Team ${team.name} deleted`,
              duration: 1000,
              position: 'bottom',
              color: 'tertiary',
              cssClass: 'card-ion-toast',
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
          });
        }
        break;
      }
    };
    this.presentForm(team, onDismiss);
  }

  /**
   * Handles the deletion of a team.
   * 
   * @param team The team to be deleted.
   */
  public onDeleteClicked(team: Team) {
    var _team: Team = { ...team };

    this.teams.deleteTeam(_team).subscribe({
      next: async (team) => {
        const options: ToastOptions = {
          message: `Team ${team.name} deleted`,
          duration: 1000,
          position: 'bottom',
          color: 'danger',
          cssClass: 'fav-ion-toast',
        };
        this.toast.create(options).then((toast) => toast.present());
        await Haptics.notification();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  /**
   * Presents a form in a modal for creating or editing a team.
   * 
   * @param data The initial data to populate the form with.
   * @param onDismiss Callback to handle the result when the modal is dismissed.
   */
  async presentForm(data: any | null, onDismiss: (result: any) => void) {
    const modal = await this.modal.create({
      component: TeamDetailComponent,
      componentProps: {
        team: data,
      },
      cssClass: 'fullModal',
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
            });
          });
        }
      } else {
        result.data.imageUrl = '';
        onDismiss(result);
      }
    } else {
      onDismiss(result);
    }
  }

  /**
   * Downloads the teams data as a CSV file.
   */
  downloadTeamsCSV() {
    this.teams.teams$.pipe(take(1)).subscribe((teams) => {
      const formattedTeams = teams.map(team => {
        const teamData: any = { 
          uuid: team.uuid,
          name: team.name,
          imageUrl: team.imageUrl,
          story: team.story
        };
        team.players.forEach((player: { name: any; uuid: any; positions: any[]; imageUrl: any; }, index: number) => {
          teamData[`player ${index + 1} uuid`] = player.uuid;
          teamData[`player ${index + 1} name`] = player.name;
          teamData[`player ${index + 1} imageUrl`] = player.imageUrl;
          teamData[`player ${index + 1} positions`] = player.positions.join(', ');
        });
        delete teamData.players; // Elimina el array players después de mapear los datos
        return teamData;
      });

      const allKeys = new Set<string>();
      formattedTeams.forEach(team => {
        Object.keys(team).forEach(key => allKeys.add(key));
      });

      const orderedKeys = [
        'uuid',
        'name',
        'imageUrl',
        'story',
        ...Array.from(allKeys).filter(key => key.startsWith('player')).sort((a, b) => {
          const regex = /player (\d+) (uuid|name|imageUrl|positions)/;
          const aMatch = a.match(regex);
          const bMatch = b.match(regex);
          if (aMatch && bMatch) {
            if (aMatch[1] === bMatch[1]) {
              return ['uuid', 'name', 'imageUrl', 'positions'].indexOf(aMatch[2]) - ['uuid', 'name', 'imageUrl', 'positions'].indexOf(bMatch[2]);
            }
            return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
          }
          return 0;
        })
      ];

      const csvData = this.csvService.convertToCSV(formattedTeams, orderedKeys);
      this.csvService.downloadFile(csvData, 'teams.csv');
    });
  }
}
