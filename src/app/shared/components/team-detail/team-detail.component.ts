import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ModalController } from '@ionic/angular';
import { Player } from 'src/app/core/interfaces/player';
import { Team } from 'src/app/core/interfaces/team';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service'; // Asegúrate de importar tu servicio de Firebase

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {
  form: FormGroup;
  mode: 'New' | 'Edit' = 'New';

  currentTeamPlayers = new Set<Player>();
  initialPlayers = new Set<Player>();
  availablePlayers = new Set<Player>();
  name: string = "";
  story: string = "";

  @Input() set team(_team: Team | null) {
    if (_team) {
      this.mode = 'Edit';
      this.form.controls['id'].setValue(_team.id);
      this.form.controls['name'].setValue(_team.name);
      this.form.controls['uuid'].setValue(_team.uuid); 
      this.form.controls['imageUrl'].setValue(_team.imageUrl || '');
      this.form.controls['story'].setValue(_team.story || '');
      this.currentTeamPlayers.clear();

      _team.players.forEach(player => {
        if (player.uuid) {
          this.currentTeamPlayers.add(player);
          this.initialPlayers.add(player);
          (this.form.get('players') as FormArray).push(new FormControl(player));
        }
      });
    }
  }

  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private playerSvc: PlayersService,
    private firebaseService: FirebaseService // Asegúrate de inyectar tu servicio de Firebase
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      players: this.formBuilder.array([]),
      uuid: [''],
      imageUrl: [''],
      story: ['']
    });
  }

  ngOnInit() {
    this.playerSvc.getAll().subscribe((players: any[]) => {
      let initialPlayersArray = Array.from(this.initialPlayers);
      players.forEach(player => {
        if (initialPlayersArray.some((p: Player) => p.uuid === player.uuid)) {
          this.removePlayer(player, this.availablePlayers);
        } else {
          this.availablePlayers.add(player);
        }
      });
    });
    this.name = this.form.get('name')?.value;
    this.story = this.form.get('story')?.value;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      let playerId = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      if (event.previousContainer.id === 'availablePlayersList') {
        this.playerSvc.getPlayer(playerId).subscribe((player: Player) => {
          this.currentTeamPlayers.add(player);
          this.removePlayer(player, this.availablePlayers);
          this.addToFormArray(player);
        });
      } else {
        this.playerSvc.getPlayer(playerId).subscribe((player: Player) => {
          this.removePlayer(player, this.currentTeamPlayers);
          this.availablePlayers.add(player);
          this.removeFromFormArray(playerId);
        });
      }

      console.log(event.previousIndex)
    }
  }

  private removePlayer(player: Player, set: Set<Player>) {
    const playerIdToRemove = player.uuid;
    const playerToRemove = Array.from(set).find(player => player.uuid === playerIdToRemove);
    if (playerToRemove) {
      set.delete(playerToRemove);
    }
  }

  private removeFromFormArray(playerId: string) {
    const playersArray = this.form.get('players') as FormArray;
    const index = playersArray.controls.findIndex((player: any) => player.value.uuid === playerId);
    if (index !== -1) {
      playersArray.removeAt(index);
      console.log(playersArray);
    }
  }

  private addToFormArray(playerId: Player) {
    const playersArray = this.form.get('players') as FormArray;
    playersArray.push(new FormControl(playerId));
  }

  get availablePlayersArray(): string[] {
    let availableAsArray = Array.from(this.availablePlayers);
    let availablePlayersId: string[] = [];
    availableAsArray.forEach(player => {
      if (player.uuid)
        availablePlayersId.push(player.uuid);
    });
    return availablePlayersId;
  }

  get currentTeamPlayersArray(): string[] {
    let currentTeamAsArray = Array.from(this.currentTeamPlayers);
    let currentTeamId: string[] = [];
    currentTeamAsArray.forEach(player => {
      if (player.uuid)
        currentTeamId.push(player.uuid);
    });
    return currentTeamId;
  }

  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

  onSubmit() {
    this._modal.dismiss(this.form.value, 'ok');
  }

  onDelete() {
    this._modal.dismiss(this.form.value, 'delete');
  }

  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;
  }

  get isFormDirty(): boolean {
    return this.form.get('name')?.value !== this.name || !this.areSetsEqual(this.currentTeamPlayers, this.initialPlayers) || this.form.get('story')?.value !== this.story;
  }

  areSetsEqual(setA: Set<Player>, setB: Set<Player>) {
    if (setA.size !== setB.size) return false;
    for (let item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    return true;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.firebaseService.imageUpload(file).then((url: string) => {
        this.form.controls['imageUrl'].setValue(url);
      });
    }
  }
}
