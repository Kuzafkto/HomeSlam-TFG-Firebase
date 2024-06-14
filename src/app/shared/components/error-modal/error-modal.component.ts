import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * Component for displaying error messages in a modal.
 */
@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent {
  
  /**
   * The title of the error modal.
   */
  @Input() title: string = 'Error';

  /**
   * The message displayed in the error modal.
   */
  @Input() message: string = 'No tienes acceso de propietario a esta página';

  /**
   * Creates an instance of ErrorModalComponent.
   * 
   * @param modalController Controller for handling modal operations.
   */
  constructor(private modalController: ModalController) {}

  /**
   * Dismisses the error modal.
   */
  dismiss() {
    this.modalController.dismiss();
  }
}
