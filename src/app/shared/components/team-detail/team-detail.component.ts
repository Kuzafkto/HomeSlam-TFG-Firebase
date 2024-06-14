import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ModalController } from '@ionic/angular';
import { Player } from 'src/app/core/interfaces/player';
import { Team } from 'src/app/core/interfaces/team';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service'; // Ensure to import your Firebase service

/**
 * Component for managing team details, including player assignments and team information.
 */
@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {
  form: FormGroup;
  mode: 'New' | 'Edit' = 'New';

  /**
   * Set to keep track of current team players.
   */
  currentTeamPlayers = new Set<Player>();

  /**
   * Set to keep track of initial team players.
   */
  initialPlayers = new Set<Player>();

  /**
   * Set to keep track of available players not in the team.
   */
  availablePlayers = new Set<Player>();

  /**
   * Name of the team.
   */
  name: string = "";

  /**
   * Story or description of the team.
   */
  story: string = "";

  imageURl: string = ""


  /**
   * Input setter for the team. Initializes the form with the team data if provided.
   * @param _team The team data to initialize the form with.
   */
  @Input() set team(_team: Team | null) {
    if (_team) {
      this.mode = 'Edit';
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

  /**
   * Constructor for TeamDetailComponent.
   * 
   * @param _modal ModalController for handling modals.
   * @param formBuilder FormBuilder for creating form groups and controls.
   * @param playerSvc PlayersService for managing player data.
   * @param firebaseService FirebaseService for handling image uploads.
   */
  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private playerSvc: PlayersService,
    private firebaseService: FirebaseService // Ensure to inject your Firebase service
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      players: this.formBuilder.array([]),
      uuid: [''],
      imageUrl: [''],
      story: ['']
    });
  }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   * Loads all players and initializes the form data.
   */
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
    this.imageURl = this.form.get('imageUrl')?.value;

  }

  /**
   * Handles the drop event for dragging and dropping players.
   * Updates the sets and form array accordingly.
   * @param event The drag and drop event.
   */
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
    }
  }

  /**
   * Removes a player from a given set.
   * @param player The player to remove.
   * @param set The set to remove the player from.
   */
  private removePlayer(player: Player, set: Set<Player>) {
    const playerIdToRemove = player.uuid;
    const playerToRemove = Array.from(set).find(player => player.uuid === playerIdToRemove);
    if (playerToRemove) {
      set.delete(playerToRemove);
    }
  }

  /**
   * Removes a player from the form array.
   * @param playerId The ID of the player to remove.
   */
  private removeFromFormArray(playerId: string) {
    const playersArray = this.form.get('players') as FormArray;
    const index = playersArray.controls.findIndex((player: any) => player.value.uuid === playerId);
    if (index !== -1) {
      playersArray.removeAt(index);
    }
  }

  /**
   * Adds a player to the form array.
   * @param playerId The player to add.
   */
  private addToFormArray(playerId: Player) {
    const playersArray = this.form.get('players') as FormArray;
    playersArray.push(new FormControl(playerId));
  }

  /**
   * Gets the array of available player IDs.
   * @returns An array of available player IDs.
   */
  get availablePlayersArray(): string[] {
    let availableAsArray = Array.from(this.availablePlayers);
    let availablePlayersId: string[] = [];
    availableAsArray.forEach(player => {
      if (player.uuid)
        availablePlayersId.push(player.uuid);
    });
    return availablePlayersId;
  }

  /**
   * Gets the array of current team player IDs.
   * @returns An array of current team player IDs.
   */
  get currentTeamPlayersArray(): string[] {
    let currentTeamAsArray = Array.from(this.currentTeamPlayers);
    let currentTeamId: string[] = [];
    currentTeamAsArray.forEach(player => {
      if (player.uuid)
        currentTeamId.push(player.uuid);
    });
    return currentTeamId;
  }

  /**
   * Handles the cancel action.
   * Dismisses the modal without saving changes.
   */
  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

  /**
   * Handles the submit action.
   * Dismisses the modal and saves changes.
   */
  onSubmit() {
    if ((this.form.get('players') as FormArray).length === 0) {
      this.form.removeControl('players');
    }
    this._modal.dismiss(this.form.value, 'ok');
  }

  /**
   * Handles the delete action.
   * Dismisses the modal and deletes the team.
   */
  onDelete() {
    this._modal.dismiss(this.form.value, 'delete');
  }

  /**
   * Checks if a form control has a specific error.
   * @param control The form control name.
   * @param error The error to check for.
   * @returns True if the control has the specified error, false otherwise.
   */
  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;
  }

  /**
   * Checks if the form is dirty (modified).
   * @returns True if the form is dirty, false otherwise.
   */
  get isFormDirty(): boolean {
    return this.form.get('name')?.value !== this.name || !this.areSetsEqual(this.currentTeamPlayers, this.initialPlayers) || this.form.get('story')?.value !== this.story || this.form.get('imageUrl')?.value !== this.imageURl;
  }

  /**
   * Checks if two sets of players are equal.
   * @param setA The first set of players.
   * @param setB The second set of players.
   * @returns True if the sets are equal, false otherwise.
   */
  areSetsEqual(setA: Set<Player>, setB: Set<Player>) {
    if (setA.size !== setB.size) return false;
    for (let item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handles image change event and uploads the image to Firebase.
   * @param event The image change event.
   */
  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.firebaseService.imageUpload(file).then((url: string) => {
        this.form.controls['imageUrl'].setValue(url);
      });
    }
  }

  adjustTextarea(event: any): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
