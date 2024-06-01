import { NumberSymbol } from "@angular/common"
import { Media } from "./media";

export interface Player {
    name: string;
    positions: number[];
    imageUrl?:Media|undefined,
    uuid?: string;
}

export interface Position {
    id: number,
    name: "firstBase" | "secondBase" | "thirdBase" | "pitcher" | "catcher" | "shortstop" | "leftField" | "centerField" | "rightField" | "designatedHitter"
}

