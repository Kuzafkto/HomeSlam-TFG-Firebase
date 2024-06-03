import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Game } from 'src/app/core/interfaces/game';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {

  form: FormGroup;
  mode: 'New' | 'Edit' = 'New';
  uuid: string = "";
  allTeams: any[] = [];
  localTeamImageUrl: string | null = null;
  visitorTeamImageUrl: string | null = null;
  localTeamName: string | null = null;
  visitorTeamName: string | null = null;

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
    }
  }

  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService // Asegúrate de inyectar tu servicio de Firebase
  ) {
    this.form = this.formBuilder.group({
      gameDate: ['', [Validators.required]],
      local: ['', [Validators.required]],
      localRuns: [0, [Validators.required]],
      visitor: ['', [Validators.required]],
      visitorRuns: [0, [Validators.required]],
      story: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.firebaseService.teams$.subscribe(teams => {
      this.allTeams = teams;
      this.updateTeamImages();
    });
  }

  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

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

  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;
  }

  get isFormDirty(): boolean {
    return this.form.dirty;
  }

  updateTeamImages() {
    const localTeam = this.allTeams.find(team => team.uuid === this.form.value.local);
    const visitorTeam = this.allTeams.find(team => team.uuid === this.form.value.visitor);
    this.localTeamImageUrl = localTeam ? localTeam.imageUrl : null;
    this.visitorTeamImageUrl = visitorTeam ? visitorTeam.imageUrl : null;
    this.localTeamName = localTeam ? localTeam.name : null;
    this.visitorTeamName = visitorTeam ? visitorTeam.name : null;
  }
}
