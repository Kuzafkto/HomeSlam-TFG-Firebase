import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Player, Position } from 'src/app/core/interfaces/player';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';

/**
 * Component for managing player details, including their positions and personal information.
 */
@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrls: ['./player-detail.component.scss'],
})
export class PlayerDetailComponent implements OnInit {
  imageUrl: string = "";

  /**
   * Define the form group for the player detail form
   */
  form: FormGroup;
  
  /**
   * Mode to determine if the form is for creating a new player or editing an existing one
   */
  mode: 'New' | 'Edit' = 'New';

  /**
   * Sets to track selected positions for comparison
   */
  selectedPositions = new Set<number>();
  initialSelectedPositions = new Set<number>();

  /**
   * Name of the player
   */
  name: string = "";

  /**
   * UUID of the player
   */
  uuid: string = "";

  /**
   * Input to set the player details
   */
  @Input() set player(_player: Player | null) {
    if (_player) {
      this.mode = 'Edit';
      this.form.controls['name'].setValue(_player.name);
      if (_player.imageUrl) {
        this.form.controls['imageUrl'].setValue(_player.imageUrl);
        this.imageUrl = _player.imageUrl.toString();
      }
      if (_player.uuid) {
        this.uuid = _player.uuid;
      }
      this.selectedPositions.clear();
      _player.positions.forEach(position => {
        this.selectedPositions.add(position);
        (this.form.get('positions') as FormArray).push(new FormControl(position));
      });
      this.initialSelectedPositions = new Set(this.selectedPositions);
    }
  }

  /**
   * Array with all possible positions for display in the template
   */
  allPositions: Position[] = [
    { id: 1, name: 'pitcher' },
    { id: 2, name: 'catcher' },
    { id: 3, name: 'firstBase' },
    { id: 4, name: 'secondBase' },
    { id: 5, name: 'thirdBase' },
    { id: 6, name: 'shortstop' },
    { id: 7, name: 'leftField' },
    { id: 8, name: 'centerField' },
    { id: 9, name: 'rightField' },
  ];

  /**
   * Constructor for PlayerDetailComponent.
   * 
   * @param _modal ModalController for handling modals.
   * @param formBuilder FormBuilder for creating form groups and controls.
   * @param firebaseService FirebaseService for handling image uploads.
   */
  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService // Ensure to inject your Firebase service
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      positions: this.formBuilder.array([]),
      imageUrl: ['']
    });
  }

  /**
   * Angular lifecycle hook called after data-bound properties are initialized.
   * Initialize the name property.
   */
  ngOnInit() {
    this.name = this.form.get('name')?.value;
  }

  /**
   * Check if a position is selected
   * @param positionId The ID of the position to check
   * @returns True if the position is selected, false otherwise
   */
  isPositionSelected(positionId: number): boolean {
    return this.selectedPositions.has(positionId);
  }

  /**
   * Toggle the selection of a position
   * @param positionId The ID of the position to toggle
   */
  togglePosition(positionId: number): void {
    const positionsArray = this.form.get('positions') as FormArray;
    if (this.selectedPositions.has(positionId)) {
      const index = positionsArray.controls.findIndex(control => control.value === positionId);
      positionsArray.removeAt(index);
      this.selectedPositions.delete(positionId);
    } else {
      positionsArray.push(new FormControl(positionId));
      this.selectedPositions.add(positionId);
    }
  }

  /**
   * Handle the cancel action
   * Dismisses the modal without saving changes
   */
  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

  /**
   * Handle the submit action
   * Dismisses the modal and saves changes
   */
  onSubmit() {
    const formWithUUID = { ...this.form.value, uuid: this.uuid };
    console.log(formWithUUID);
    this._modal.dismiss(formWithUUID, 'ok');
  }

  /**
   * Handle the delete action
   * Dismisses the modal and deletes the player
   */
  onDelete() {
    this._modal.dismiss(this.form.value, 'delete');
  }

  /**
   * Check if a control has a specific error
   * @param control The form control name
   * @param error The error to check for
   * @returns True if the control has the specified error, false otherwise
   */
  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;
  }

  /**
   * Update the selected positions
   * @param set The set of selected positions
   */
  updateSelected(set: Set<number>) {
    this.selectedPositions = set;
  }

  /**
   * Check if the form is dirty
   * @returns True if the form is dirty, false otherwise
   */
  get isFormDirty(): boolean {
    return (this.form.get('name')?.value != this.name || !this.areSetsEqual(this.selectedPositions, this.initialSelectedPositions) || this.imageUrl != this.form.get('imageUrl')?.value);
  }

  /**
   * Check if two sets are equal
   * @param setA The first set to compare
   * @param setB The second set to compare
   * @returns True if the sets are equal, false otherwise
   */
  areSetsEqual(setA: Set<number>, setB: Set<number>) {
    if (setA.size !== setB.size) return false;
    for (let item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handle the image change event
   * @param event The image change event
   */
  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.firebaseService.imageUpload(file).then((url: string) => {
        this.form.controls['imageUrl'].setValue(url);
        this.imageUrl = url; // Update the imageUrl to mark the form as dirty
      });
    }
  }
}
