import { Media } from "./media";
import { Player } from "./player";
import { Trainer } from "./trainer";

export interface Team {
    story: string;
    imageUrl?:Media|undefined,
    id: number;
    name: string;
    players: Player[],
    trainers: Trainer[],
    uuid?: string;
  }
  