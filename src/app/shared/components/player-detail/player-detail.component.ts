import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Player, Position } from 'src/app/core/interfaces/player';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrls: ['./player-detail.component.scss'],
})
export class PlayerDetailComponent implements OnInit {

  form: FormGroup;
  mode: 'New' | 'Edit' = 'New';

  //Tenmos dos sets (los sets son como listas pero los valores no se pueden repetir) para las posiciones para ir chequeando si el inicial es igual que el que el usuario irá modificando
  selectedPositions = new Set<number>();
  initialSelectedPositions = new Set<number>();
  name: string = "";
  surname: string = "";
  age: number = 18;
  uuid:string="";
  @Input() set player(_player: Player | null) {
    if (_player) {
      this.mode = 'Edit';
      this.form.controls['id'].setValue(_player.id);
      this.form.controls['name'].setValue(_player.name);
      this.form.controls['surname'].setValue(_player.surname);
      this.form.controls['age'].setValue(_player.age);
      if(_player.uuid){
        this.uuid=_player.uuid;
      }
      this.selectedPositions.clear();
      _player.positions.forEach(position => {
        this.selectedPositions.add(position);
        (this.form.get('positions') as FormArray).push(new FormControl(position));
      });
      this.initialSelectedPositions = new Set(this.selectedPositions);
    }
  }


  //Array con todas las posiciones para mostrar en el template

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

  // Chequea si la posicion esta seleccionada (se usa para los botones)
  isPositionSelected(positionId: number): boolean {
    return this.selectedPositions.has(positionId);
  }
  //Obtiene el formArray de positions y la borra o añade la posicion dependiendo de si ya estaba o no en el Set, se activa cuando un usuario hace click en cualquiera de los botones de posicion
  togglePosition(positionId: number): void {

    //obtiene una referencia (por lo que no es una copia, sino que se vincula) al FormArray de tu formGroup
    const positionsArray = this.form.get('positions') as FormArray;
    //si lo tiene saca el index y borralo del set y el FormArray
    if (this.selectedPositions.has(positionId)) {
      const index = positionsArray.controls.findIndex(control => control.value === positionId);
      positionsArray.removeAt(index);
      this.selectedPositions.delete(positionId);
    } else {
      //Sino metelo dentro del formArray y el Set
      positionsArray.push(new FormControl(positionId));
      this.selectedPositions.add(positionId);
    }
  }

  constructor(
    private _modal: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      age: [18, [Validators.required, Validators.min(18)]],
      positions: this.formBuilder.array([])
    });

  }

  ngOnInit() {
    this.name = this.form.get('name')?.value;
    this.surname = this.form.get('surname')?.value;
    this.age = this.form.get('age')?.value;
  }

  onCancel() {
    this._modal.dismiss(null, 'cancel');
  }

  onSubmit() {
     // Agregar el uuid al objeto del formulario antes de descartarlo
     const formWithUUID = { ...this.form.value, uuid: this.uuid };
     console.log(formWithUUID);
     this._modal.dismiss(formWithUUID, 'ok');
  }

  onDelete() {
    this._modal.dismiss(this.form.value, 'delete');
  }

  hasError(control: string, error: string): boolean {
    let errors = this.form.controls[control].errors;
    return errors != null && error in errors;

  }

  updateSelected(set: Set<number>) {
    this.selectedPositions = set;
  }

  //chequea si el formulario esta sucio, es necesario esta funcion porque el .dirty por defecto no tiene en cuenta los formArray por lo que chequearemos si los sets de las posiciones iniciales y las "cambiadas" son los mismos
  get isFormDirty(): boolean {
    return (this.form.get('name')?.value != this.name || this.form.get('surname')?.value != this.surname || this.form.get('age')?.value != this.age) || !this.areSetsEqual(this.selectedPositions, this.initialSelectedPositions);
  }



  //esta fumada chequea si dos sets de tipo string son iguales
  areSetsEqual(setA: Set<number>, setB: Set<number>) {
    //si los dos sets no tienen el mismo tamaño entonces no pueden ser iguales, return false
    if (setA.size !== setB.size) return false;
    //ahora chequeamos por cada item del setA, si el setB no lo tiene, return false
    for (let item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    //en caso de que no haya devuelto false, entonces son iguales y devuelve true
    return true;
  }

}






