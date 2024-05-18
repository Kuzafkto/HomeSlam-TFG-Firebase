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

  url: any;

  ngOnInit() {
    this.apisvc.get(`/upload/files/?name=catcher`).subscribe(result => {
      this.url = result[0].formats.thumbnail.url;
    });
  }

  ur2: number[] | undefined = this.player?.positions;
  onCardClick() {
    this.onCardClicked.emit();
  }

  onDeleteClick(event: any) {
    this.onDeleteClicked.emit();
    event.stopPropagation();
  }
  constructor(
    private apisvc: ApiService
  ) { }


}


