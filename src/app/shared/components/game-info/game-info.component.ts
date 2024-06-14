import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/core/interfaces/game';

/**
 * Component for displaying game information.
 */
@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent {

  /**
   * The game data to display.
   */
  @Input() game: Game | undefined;

  /**
   * Event emitted when the game card is clicked.
   */
  @Output() onCardClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the delete button is clicked.
   */
  @Output() onDeleteClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Creates an instance of GameInfoComponent.
   */
  constructor() {}

  /**
   * Handles the click event on the game card.
   */
  onCardClick() {
    this.onCardClicked.emit();
  }

  /**
   * Handles the click event on the delete button.
   * 
   * @param event The click event.
   */
  onDeleteClick(event: any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }
}
