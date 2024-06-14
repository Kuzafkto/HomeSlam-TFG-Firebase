import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player, Position } from 'src/app/core/interfaces/player';
import { ApiService } from 'src/app/core/services/api/api.service';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['./player-info.component.scss'],
})
export class PlayerInfoComponent implements OnInit {

  /**
   * The player object to display information for.
   */
  @Input() player: Player | null = null;

  /**
   * Event emitted when the player card is clicked.
   */
  @Output() onCardClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the delete button is clicked.
   */
  @Output() onDeleteClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Determines whether to show the delete button.
   */
  @Input() showDeleteButton: boolean = true;

  constructor(private apisvc: ApiService) { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() { }

  /**
   * Handles the click event on the player card.
   */
  onCardClick() {
    this.onCardClicked.emit();
  }

  /**
   * Handles the click event on the delete button.
   * 
   * @param event The event object.
   */
  onDeleteClick(event: any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }

  /**
   * Gets the URL for the position image based on the position ID.
   * 
   * @param positionId The ID of the position.
   * @returns The URL of the position image.
   */
  getPositionImageUrl(positionId: number): string {
    // Here you can return the URL of the image based on the position ID.
    // For now, we use a generic image.
    return `/assets/positions/${positionId}.png`;
  }
}
