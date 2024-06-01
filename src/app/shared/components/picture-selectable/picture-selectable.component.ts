import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

export const PICTURE_SELECTABLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PictureSelectableComponent),
  multi: true
};

@Component({
  selector: 'app-picture-selectable',
  templateUrl: './picture-selectable.component.html',
  styleUrls: ['./picture-selectable.component.scss'],
  providers: [PICTURE_SELECTABLE_VALUE_ACCESSOR]
})
export class PictureSelectableComponent implements OnInit, ControlValueAccessor, OnDestroy {

  private _picture = new BehaviorSubject<string>('');
  public picture$ = this._picture.asObservable();
  isDisabled: boolean = false;
  hasValue: boolean = false;
  test:string="https://youre.outof.cards/media/uploads/c2/6b/c26b2af3-6d22-4485-8c95-bc7f842831e6/spell.jpg";

  constructor(private pictureModal: ModalController) { }

  ngOnDestroy(): void {
    this._picture.complete();
  }

  ngOnInit() { }

  propagateChange = (obj: any) => { }

  writeValue(obj: any): void {
    if (obj) {
      this.hasValue = true;
      this._picture.next(obj);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  changePicture(picture: string) {
    this.hasValue = picture !== '';
    this._picture.next(picture);
    this.propagateChange(picture);
  }

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

  onDeletePicture(event: Event) {
    event.stopPropagation();
    this.changePicture('');
  }

  close() {
    this.pictureModal?.dismiss();
  }
}
