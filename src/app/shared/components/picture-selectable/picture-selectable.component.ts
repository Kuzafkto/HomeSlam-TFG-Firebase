import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

/**
 * Define a constant for providing the PictureSelectableComponent as a NG_VALUE_ACCESSOR.
 * This allows the component to be used as a form control.
 */
export const PICTURE_SELECTABLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PictureSelectableComponent),
  multi: true
};

/**
 * Component for selecting and displaying a picture, implementing ControlValueAccessor for form integration.
 */
@Component({
  selector: 'app-picture-selectable',
  templateUrl: './picture-selectable.component.html',
  styleUrls: ['./picture-selectable.component.scss'],
  providers: [PICTURE_SELECTABLE_VALUE_ACCESSOR]
})
export class PictureSelectableComponent implements OnInit, ControlValueAccessor, OnDestroy {

  /**
   * BehaviorSubject to hold the picture URL.
   */
  private _picture = new BehaviorSubject<string>('');

  /**
   * Observable for the picture URL.
   */
  public picture$ = this._picture.asObservable();

  /**
   * Flag to indicate if the component is disabled.
   */
  isDisabled: boolean = false;

  /**
   * Flag to indicate if the component has a value.
   */
  hasValue: boolean = false;

  /**
   * Test picture URL.
   */
  test: string = "https://youre.outof.cards/media/uploads/c2/6b/c26b2af3-6d22-4485-8c95-bc7f842831e6/spell.jpg";

  /**
   * Constructor for PictureSelectableComponent.
   * 
   * @param pictureModal ModalController for handling modals.
   */
  constructor(private pictureModal: ModalController) { }

  /**
   * Lifecycle hook to complete the BehaviorSubject when the component is destroyed.
   */
  ngOnDestroy(): void {
    this._picture.complete();
  }

  /**
   * Lifecycle hook called on component initialization.
   */
  ngOnInit() { }

  /**
   * Function to propagate changes to the parent form.
   */
  propagateChange = (obj: any) => { }

  /**
   * Implementation of ControlValueAccessor interface method to write a new value to the component.
   * 
   * @param obj The new value to write.
   */
  writeValue(obj: any): void {
    if (obj) {
      this.hasValue = true;
      this._picture.next(obj);
    }
  }

  /**
   * Implementation of ControlValueAccessor interface method to register a change function.
   * 
   * @param fn The change function to register.
   */
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  /**
   * Implementation of ControlValueAccessor interface method to register a touched function.
   * 
   * @param fn The touched function to register.
   */
  registerOnTouched(fn: any): void { }

  /**
   * Implementation of ControlValueAccessor interface method to set the disabled state.
   * 
   * @param isDisabled The disabled state to set.
   */
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Method to change the picture URL.
   * 
   * @param picture The new picture URL.
   */
  changePicture(picture: string) {
    this.hasValue = picture !== '';
    this._picture.next(picture);
    this.propagateChange(picture);
  }

  /**
   * Method to handle the picture change event.
   * 
   * @param event The change event.
   * @param fileLoader The file input element.
   */
  onChangePicture(event: Event, fileLoader: HTMLInputElement) {
    event.stopPropagation();
    fileLoader.onchange = () => {
      if (fileLoader.files && fileLoader.files.length > 0) {
        const file = fileLoader.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.changePicture(reader.result as string);
        };
        reader.onerror = (error) => {
          console.log(error);
        };
        reader.readAsDataURL(file);
      }
    };
    fileLoader.click();
  }

  /**
   * Method to handle the delete picture event.
   * 
   * @param event The delete event.
   */
  onDeletePicture(event: Event) {
    event.stopPropagation();
    this.changePicture('');
  }

  /**
   * Method to close the modal.
   */
  close() {
    this.pictureModal?.dismiss();
  }
}
