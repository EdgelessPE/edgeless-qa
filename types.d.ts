import {Result} from "ts-results";

export interface Task {
    name:string
    category:string
    download:string
}

export interface StartRes {
    task:Task
    eptDownload?:string
}

interface Meta {

}

export interface EndReq {
    name:string
    category:string
    result:Result<{ readme:string,meta:Meta }, string>
}

type ShotStage="afterInstall"|"onRun"|"afterUninstall"
export interface TakeShotReq {
    name:string
    category:string
    stage:ShotStage
}

export interface TakeShotRes {
    fileName:string
}