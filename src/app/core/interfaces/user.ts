import { PaginatedData } from "./data";
import { Media } from "./media";
import { Player } from "./player";

export interface User {
    id?:number,
    email:string,
    name:string,
    nickname?:string
    picture?:string|undefined,
    uuid?:string,
    isAdmin:boolean,
    isOwner:boolean
}

export type PaginatedUsers = PaginatedData<User>;

