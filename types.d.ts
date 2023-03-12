import {Result} from "ts-results";

export interface Task {
    name:string
    category:string
    download:string
}

interface Meta {

}

export interface EndReq {
    name:string
    category:string
    result:Result<{ readme:string,meta:Meta }, string>
}

export interface TakeShotReq {
    name:string
    category:string
}

export interface TakeShotRes {
    fileName:string
}