import { Media } from "./media";
import { Player } from "./player";
import { Trainer } from "./trainer";

export interface Team {
    story: string;
    imageUrl?:Media|undefined,
    name: string;
    players: Player[],
    trainers: Trainer[],
    uuid?: string;
  }
  