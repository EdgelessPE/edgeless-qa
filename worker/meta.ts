import {Meta} from "../types";

function genMeta(installedPath:string):Meta {
    return {
       name:installedPath
    }
}

export {
    genMeta
}