import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/core/interfaces/game';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent {
  @Input() game: Game | undefined;
  @Output() onCardClicked:EventEmitter<void> = new EventEmitter<void>();
  @Output() onDeleteClicked:EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  onCardClick() {
    this.onCardClicked.emit();
  }

  onDeleteClick(event:any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }
}
