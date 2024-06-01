import { PaginatedData } from "./data";
import { Media } from "./media";
import { Player } from "./player";

export interface User {
    id?:number,
    name:string,
    nickname?:string
    picture?:Media|null,
    uuid?:string,
    players:string[],
    teams:string[]
}

export type PaginatedUsers = PaginatedData<User>;


