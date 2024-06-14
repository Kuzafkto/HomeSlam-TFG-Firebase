import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player } from 'src/app/core/interfaces/player';
import { Team } from 'src/app/core/interfaces/team';

/**
 * Component for displaying information about a team.
 */
@Component({
  selector: 'app-team-info',
  templateUrl: './team-info.component.html',
  styleUrls: ['./team-info.component.scss'],
})
export class TeamInfoComponent implements OnInit {

  /**
   * The team object to display information for.
   */
  @Input() team: Team | null = null;

  /**
   * The players array to display information for the team.
   */
  @Input() players: Player[] | null = null;

  /**
   * Event emitted when the team card is clicked.
   */
  @Output() onCardClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the delete button is clicked.
   */
  @Output() onDeleteClicked: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor for TeamInfoComponent.
   */
  constructor() { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {}

  /**
   * Handler for when the team card is clicked.
   */
  onCardClick() {
    this.onCardClicked.emit();
  }

  /**
   * Handler for when the delete button is clicked.
   * Stops the click event from propagating.
   * 
   * @param event The click event.
   */
  onDeleteClick(event: any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }
}
