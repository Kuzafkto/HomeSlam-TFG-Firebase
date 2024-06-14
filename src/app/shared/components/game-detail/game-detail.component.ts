import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Game } from 'src/app/core/interfaces/game';
import { VoteService } from 'src/app/core/services/api/vote.service';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {
  /**
   * Form group for the game detail form
   */
  form: FormGroup;

  /**
   * Mode to determine if the form is for creating a new game or editing an existing one
   */
  mode: 'New' | 'Edit' = 'New';

  /**
   * UUID of the game
   */
  uuid: string = "";

  /**
   * List of all teams
   */
  allTeams: any[] = [];

  /**
   * Image URL of the local team
   */
  localTeamImageUrl: string | null = null;

  /**
   * Image URL of the visitor team
   */
  visitorTeamImageUrl: string | null = null;

  /**
   * Name of the local team
   */
  localTeamName: string | null = null;

  /**
   * Name of the visitor team
   */
  visitorTeamName: string | null = null;

  /**
   * Object to store vote counts for teams
   */
  voteCounts: { [teamId: string]: number } = {};

  /**
   * Title of the game
   */
  gameTitle: string = '';

  /**
   * Initial form values to check for changes
   */
  initialFormValues: any;

  /**
   * Input to set the game details
   */
  @Input() set game(_game: Game | null) {
    if (_game) {
      this.mode = 'Edit';
      this.form.controls['gameDate'].setValue(_game.gameDate);
      this.form.controls['local'].setValue(_game.local?.uuid || '');
      this.form.controls['localRuns'].setValue(_game.localRuns);
      this.form.controls['visitor'].setValue(_game.visitor?.uuid || '');
      this.form.controls['visitorRuns'].setValue(_game.visitorRuns);
      this.form.controls['story'].setValue(_game.story);
      if (_game.uuid) {
        this.uuid = _game.uuid;
      }
      this.updateTeamImages();
      this.updateGameTitle();
      this.storeInitialFormValues();
    }
  }

  /**
   * Constructor for GameDetailComponent.
   * 
   * @param _modal ModalController for handling modals.
   * @param formBuilder FormBuilder for creating form groups and controls.
   * @param firebaseService FirebaseService for managing team data.
   * @param voteService VoteService for managing votes.
   */
  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private voteService: VoteService,
  ) {
    this.form = this.formBuilder.group({
      gameDate: ['', [Validators.required]],
      local: ['', [Validators.required]],
      localRuns: ['', [Validators.required, this.customRunValidator]],
      visitor: ['', [Validators.required]],
      visitorRuns: ['', [Validators.required, this.customRunValidator]],
      story: ['', [Validators.required]],
    });
  }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  
  ngOnInit() {
    // Subscribe to the teams observable to get all teams
    this.firebaseService.teams$.subscribe(teams => {
      this.allTeams = teams;
      this.updateTeamImages();
      this.updateGameTitle();
    });

    // Subscribe to the vote counts for teams
    this.voteService.countVotesForTeams(this.uuid).subscribe(counts => {
      this.voteCounts = counts;
      console.log(this.voteCounts);
    });
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
   * Dismisses the modal and saves the form data.
   */
  onSubmit() {
    const date = new Date(this.form.value.gameDate);
    const formattedDate = date.toISOString().split('T')[0];
    const formWithUUID = {
      ...this.form.value,
      gameDate: formattedDate,
      uuid: this.uuid,
      localRuns: this.form.value.localRuns.toString(),
      visitorRuns: this.form.value.visitorRuns.toString()
    };
    console.log(formWithUUID);
    this._modal.dismiss(formWithUUID, 'ok');
  }

  /**
   * Checks if a form control has a specific error.
   * 
   * @param control The name of the form control.
   * @param error The error to check for.
   * @returns True if the control has the specified error, false otherwise.
   */
  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;
  }

  /**
   * Checks if the form is dirty (modified).
   * 
   * @returns True if the form is dirty, false otherwise.
   */
  get isFormDirty(): boolean {
    return !this.areFormValuesEqual(this.initialFormValues, this.form.value);
  }

  /**
   * Updates the team images and names based on the selected local and visitor teams.
   */
  updateTeamImages() {
    const localTeam = this.allTeams.find(team => team.uuid === this.form.value.local);
    const visitorTeam = this.allTeams.find(team => team.uuid === this.form.value.visitor);
    this.localTeamImageUrl = localTeam ? localTeam.imageUrl : null;
    this.visitorTeamImageUrl = visitorTeam ? visitorTeam.imageUrl : null;
    this.localTeamName = localTeam ? localTeam.name : null;
    this.visitorTeamName = visitorTeam ? visitorTeam.name : null;
    this.updateGameTitle();
  }

  /**
   * Updates the game title based on the selected local and visitor teams.
   */
  updateGameTitle() {
    const localTeam = this.allTeams.find(team => team.uuid === this.form.value.local);
    const visitorTeam = this.allTeams.find(team => team.uuid === this.form.value.visitor);
    const localTeamName = localTeam ? localTeam.name : 'Local';
    const visitorTeamName = visitorTeam ? visitorTeam.name : 'Visitor';
    this.gameTitle = `${localTeamName} vs ${visitorTeamName}`;
  }

  /**
   * Checks if there are vote counts available.
   * 
   * @returns True if there are vote counts, false otherwise.
   */
  hasVoteCounts(): boolean {
    return Object.keys(this.voteCounts).length > 0;
  }

  /**
   * Custom validator for the runs input field.
   * 
   * @param control The form control to validate.
   * @returns Validation errors or null if the control is valid.
   */
  customRunValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const valid = /^\d+$/.test(value) || value === '?';
    return valid ? null : { invalidRun: true };
  }

  /**
   * Gets the name of a team based on its ID.
   * 
   * @param teamId The ID of the team.
   * @returns The name of the team or the team ID if the team is not found.
   */
  getTeamName(teamId: string): string {
    const team = this.allTeams.find(t => t.uuid === teamId);
    return team ? team.name : teamId;
  }

  /**
   * Handles the change event for the team selection.
   * Updates the team images and game title.
   */
  onTeamChange() {
    this.updateTeamImages();
    this.updateGameTitle();
  }

  /**
   * Adjusts the height of the textarea based on its content.
   * 
   * @param event The input event.
   */
  adjustTextarea(event: any) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  /**
   * Stores the initial form values to check for changes later.
   */
  storeInitialFormValues() {
    this.initialFormValues = this.form.getRawValue();
  }

  /**
   * Compares the initial form values with the current form values.
   * 
   * @param initialValues The initial form values.
   * @param currentValues The current form values.
   * @returns True if the form values are equal, false otherwise.
   */
  areFormValuesEqual(initialValues: any, currentValues: any): boolean {
    return JSON.stringify(initialValues) === JSON.stringify(currentValues);
  }
}
