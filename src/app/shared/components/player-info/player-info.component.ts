import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player, Position } from 'src/app/core/interfaces/player';
import { ApiService } from 'src/app/core/services/api/api.service';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['./player-info.component.scss'],
})
export class PlayerInfoComponent implements OnInit {

  @Input() player: Player | null = null;
  @Output() onCardClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() onDeleteClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() showDeleteButton: boolean = true;

  constructor(private apisvc: ApiService) { }

  ngOnInit() { }

  onCardClick() {
    this.onCardClicked.emit();
  }

  onDeleteClick(event: any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }

  getPositionImageUrl(positionId: number): string {
    // Aquí puedes devolver la URL de la imagen basada en el ID de la posición.
    // De momento, usaremos una imagen genérica.
    return `/assets/positions/${positionId}.png`;
  }
}
